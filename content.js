// FRONTEND
window.addEventListener("mouseup", function (event) {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
        var startIndex = document.body.innerText.indexOf(text);
        var endIndex = startIndex + text.length;
        while (new RegExp(/[a-zA-Z0-9]/, 'g').test(document.body.innerText.charAt(startIndex))) {
            startIndex--;
        }
        while (new RegExp(/[a-zA-Z0-9]/, 'g').test(document.body.innerText.charAt(endIndex))) {
            endIndex++;
        }
        text = document.body.innerText.substring(startIndex, endIndex); // TODO this might have an off by one error
    }
    else if (document.selection && document.selection.type != "Control") { // idk what this does...
        text = document.selection.createRange().text;
    }

    // sending message to background.js
    text = text.trim();
    if (text.length > 0) {
        var message = {
            method: "persist-highlight",
            selection: text
        };
        chrome.runtime.sendMessage(message);
    }
});

// listen for messages from background.js
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        // console.log(sender.tab ? "from background script: " + sender.tab.url : "from the extension");
        if (message.method === "updated-highlight-list") {
            if (message && message.data) {
                message.data.forEach((highlight) => {
                    const hl = `<span style='background-color: #e8ce97'>${highlight}</span>`;
                    document.body.innerHTML = document.body.innerHTML.replace(new RegExp(highlight, 'g'), hl);
                });
            }
        }
    }
);