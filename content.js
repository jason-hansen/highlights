// FRONTEND
var debug = true;
debug ? console.log('Debug printing enabled: content.js') : null;
// debug ? console.log('') : null;

document.addEventListener('DOMContentLoaded', () => {
    const getDataMessage = {
        method: 'get-data',
        url: this.location.href
    };
    chrome.runtime.sendMessage(getDataMessage, (getDataResponse) => {
        document.body.innerHTML = buildHighlightedHtml(getDataResponse.data);
    });
});

window.addEventListener('mouseup', (event) => {
    if (!isTextSelectionRange() || !isTextSelection()) {
        return;
    }

    var highlight = window.getSelection().toString();
    if (!new RegExp(/[a-zA-Z0-9]/, 'g').test(highlight)) {
        return;
    }
    highlight = expandSelectionToWhitespace(highlight, document.body.innerText);
    const highlightHtml = getHtmlForHighlight(highlight, document.body.innerText, document.body.innerHTML);
    const parentElement = getSelectionParentElement();

    // sending message to background.js
    var isHighlightingMessage = {
        method: 'is-highlighting',
        url: this.location.href
    };
    chrome.runtime.sendMessage(isHighlightingMessage, (isHighlightingResponse) => {
        if (isHighlightingResponse.isHighlighting) {
            var persistHighlightMessage = {
                method: 'persist-highlight',
                selection: highlight
            };
            chrome.runtime.sendMessage(persistHighlightMessage, (persistHighlightResponse) => {
                debug ? console.log('persistHighlightResponse:', persistHighlightResponse) : null;
            });
        } else {
            debug ? console.log('Highlighting turned off, not sending highlighted text:' + highlight) : null;
            return;
        }
    });
});

// listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.method === 'highlight-data-updated') {
        debug ? console.log('highlight-data-updated: ' + JSON.stringify(message.data)) : null;
        if (message.data && message.data.on) {
            document.body.innerHTML = buildHighlightedHtml(message.data);
            // return true;
            sendResponse({ response: 'hl is on' });
        } else {
            // it's off, so  don't add any highlights and just refresh it to visually remove them
            window.location.reload();
            sendResponse({ response: 'hl is off' });
        }
    }
});

// HELPERS ------------------------------------------------------------
function buildHighlightedHtml(data) {
    var newHtml = document.body.innerHTML;
    if (data && data.highlights) {
        const highlightStyle = `'color: ${data.highlightLabelColor};background-color: ${data.highlightColor};border-radius: 5px;padding: 2.5px 1.5px;margin: 0px -1.5px;
        '`;
        data.highlights.forEach((highlight) => {
            const highlightHtml = getHtmlForHighlight(highlight, document.body.innerText, document.body.innerHTML);
            const toBeHighlighted = highlightHtml.split(/<[^>]+>\s+(?=<)|<[^>]+>/);

            for (let i = 0; i < toBeHighlighted.length; i++) {
                const highlightPiece = toBeHighlighted[i];
                if (highlightPiece.length > 0) {
                    const hl = `<span style=${highlightStyle}>${highlightPiece}</span>`;
                    // TODO have some sort of bounding index check to not just replace every occurance
                    newHtml = newHtml.replace(new RegExp(highlightPiece, 'g'), hl);
                }
            }
        });
        return newHtml;
    }
}

function getHtmlForHighlight(highlight, text, html) {
    const charsInHiighlight = highlight.length;

    const textStartIndex = text.indexOf(highlight);
    const textEndIndex = textStartIndex + charsInHiighlight;

    // TODO this offset stuff is bc html.indexOf(highlight) doesn't work if it's highlighting something containing an html tag... but it doesn't really work well
    const offset = 3;
    const firstCharsOfHighlight = highlight.slice(0, offset + 1);
    const htmlStartIndex = html.indexOf(firstCharsOfHighlight);
    const htmlEndIndex = getHtmlEndIndex(html, htmlStartIndex, highlight, charsInHiighlight);

    const textHighlight = text.slice(textStartIndex, textEndIndex + 1);
    const htmlHighlight = html.slice(htmlStartIndex, htmlEndIndex + 1);

    return htmlHighlight;
}

function getHtmlEndIndex(html, htmlStartIndex, highlight, charsInHiighlight) {
    var validCharCount = 0;
    var i;
    for (i = htmlStartIndex; i < html.length; i++) {
        var htmlChar = html.charAt(i);

        // if inside of an html tag
        if (htmlChar === '<') {
            while (htmlChar !== '>') {
                htmlChar = html.charAt(++i);
            }
        }
        else { // in the regular text
            if (htmlChar === highlight.charAt(validCharCount)) {
                validCharCount++;
            }
        }

        // if we've accounted for all the highlight chars in the html
        if (charsInHiighlight === validCharCount) {
            break;
        }
    }
    return i;
}

function expandSelectionToWhitespace(text, html) {
    var startIndex = html.indexOf(text);
    var endIndex = startIndex + text.length;
    const isSpaceRegex = new RegExp(/\s/, 'g');
    while (!isSpaceRegex.test(html.charAt(startIndex)) && startIndex > -1) {
        startIndex--;
    }
    while (!isSpaceRegex.test(html.charAt(endIndex)) && endIndex < html.length) {
        endIndex++;
    }
    text = html.substring(startIndex, endIndex);
    return text.trim();
}

function isTextSelection() {
    var parentElement = getSelectionParentElement();
    for (let i = 0; i < parentElement.children.length; i++) {
        const child = parentElement.children[i];
        if (child['tagName'] && (child['tagName'].toUpperCase() === 'INPUT' || child['tagName'].toUpperCase() === 'TEXTAREA')) {
            return false;
        }
    }
    return true;
}

function isTextSelectionRange() {
    return window.getSelection() && window.getSelection().type == 'Range';
}

function getSelectionParentElement() {
    var parentEl = null, sel;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            parentEl = sel.getRangeAt(0).commonAncestorContainer;
            if (parentEl.nodeType != 1) {
                parentEl = parentEl.parentNode;
            }
        }
    } else if ((sel = document.selection) && sel.type != "Control") {
        parentEl = sel.createRange().parentElement();
    }
    return parentEl;
}