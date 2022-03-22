// FRONTEND
document.addEventListener('DOMContentLoaded', () => {
    const getDataMessage = {
        method: "get-data",
        url: this.location.href
    };
    chrome.runtime.sendMessage(getDataMessage, (getDataResponse) => {
        document.body.innerHTML = buildHighlightedHtml(getDataResponse.data);
    });
});

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
        var isHighlightingMessage = {
            method: "is-highlighting",
            url: this.location.href
        };
        chrome.runtime.sendMessage(isHighlightingMessage, (isHighlightingResponse) => {
            if (isHighlightingResponse.isHighlighting) {
                var persistHighlightMessage = {
                    method: "persist-highlight",
                    selection: text
                };
                chrome.runtime.sendMessage(persistHighlightMessage, (persistHighlightResponse) => {
                    // console.log('persistHighlightResponse:', persistHighlightResponse);
                });
            } else {
                return;
            }
        });
    }
});

// listen for messages from background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.method === 'highlight-data-updated') {
        document.body.innerHTML = buildHighlightedHtml(message.data);
        // return true;
        sendResponse({ response: 'thanks!' });
    }
});

// HELPERS ------------------------------------------------------------
function buildHighlightedHtml(data) {
    var newHtml = document.body.innerHTML;
    const highlightStyle = `'
                color: ${data.highlightLabelColor};
                background-color: ${data.highlightColor};
                border-radius: 5px;
                padding: 2.5px 1.5px;
                margin: 0px -1.5px;
                '`;
    data.highlights.forEach((highlight) => {
        const hl = `<span style=${highlightStyle}>${highlight}</span>`;
        newHtml = newHtml.replace(new RegExp(highlight, 'g'), hl);
    });
    return newHtml;
}

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