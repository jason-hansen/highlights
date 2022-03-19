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
            method: "is-highlighting",
            url: this.location.href
        };
        chrome.runtime.sendMessage(message, (response) => {
            if (response.isHighlighting) {
                var message = {
                    method: "persist-highlight",
                    selection: text
                };
                chrome.runtime.sendMessage(message);
            } else {
                console.log('highlighting is "off" for this url: "' + text + '"');
                return;
            }
        });
    }
});

// listen for messages from background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        // console.log(sender.tab ? "from background script: " + sender.tab.url : "from the extension");
        var highlightColor = getComputedStyle(document.documentElement).getPropertyValue('--highlight').trim();
        highlightColor = highlightColor ? highlightColor : '#e7cd97';

        if (message.method === "updated-highlight-list") {
            if (message && message.data && message.data.highlights) {
                message.data.highlights.forEach((highlight) => {
                    const hl = `<span style='background-color: ${highlightColor}; padding-top: 2.5px; padding-bottom: 2.5px;'>${highlight}</span>`;
                    document.body.innerHTML = document.body.innerHTML.replace(new RegExp(highlight, 'g'), hl);
                });
            }
        }
    }
);

// HELPERS ---------------------------------------------------------------
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