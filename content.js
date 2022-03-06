// FRONTEND
window.addEventListener("mouseup", function (event) {
    var text = "";
    if (isTextSelectionRange()) {
        text = window.getSelection().toString();
        if (!new RegExp(/[a-zA-Z0-9]/, 'g').test(text)) {
            return;
        }
        text = expandSelectionToWhitespace(text, document.body.innerText);
    }
    // idk what this does...
    // else if (window.getSelection() && window.getSelection().type != "Control") {
    //     text = window.getSelection().addRange(text.length);
    // }

    // sending message to background.js
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

function expandSelectionToWhitespace(text, html) {
    var startIndex = document.body.innerText.indexOf(text);
    var endIndex = startIndex + text.length;
    const isSpaceRegex = new RegExp(/\s/, 'g');
    while (!isSpaceRegex.test(document.body.innerText.charAt(startIndex)) && startIndex > -1) {
        startIndex--;
    }
    while (!isSpaceRegex.test(document.body.innerText.charAt(endIndex)) && endIndex < document.body.innerText.length) {
        endIndex++;
    }
    text = document.body.innerText.substring(startIndex, endIndex);
    return text.trim();
}

function isTextSelectionRange() {
    return window.getSelection() && window.getSelection().type == 'Range';
}