document.addEventListener('DOMContentLoaded', () => {
    const onOffSwitch = document.getElementById('onoff-switch');

    const colorpicker = document.getElementById('colorpicker');
    const colorpickerContainer = document.getElementById('colorpicker-container');
    const colorpickerLabel = document.getElementById('colorpicker-label');

    const highlightListDiv = document.getElementById('highlight-list');

    const clearUrlHighlightsButton = document.getElementById('clear-url-highlights-button');
    const clearAllHighlightsButton = document.getElementById('clear-all-highlights-button');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const message = {
            method: "get-data",
            url: tabs[0].url
        };
        chrome.runtime.sendMessage(message, (response) => {
            // console.log(JSON.stringify(response.data));

            // set on/off switch
            const isHighlighting = response.data && response.data.on ? true : false;
            onOffSwitch.checked = isHighlighting;

            // set colorpicker and label color

            // set highlights list
            if (response.data.highlights.length > 0) {
                highlightListDiv.innerHTML = buildHighlightListHtml(response.data.highlights);
            } else {
                clearUrlHighlightsButton.disabled = true;
            }
        });
    });

    colorpicker.addEventListener('change', () => {
        const highlightColor = colorpicker.value;
        const highlightLabelColor = pickTextColorBasedOnBgColor(highlightColor, getComputedStyle(document.documentElement).getPropertyValue('--white').trim(), getComputedStyle(document.documentElement).getPropertyValue('--black').trim());
        colorpickerContainer.style.backgroundColor = highlightColor;
        colorpickerLabel.style.color = highlightLabelColor;

        // TODO make a call to persist these two values in the json blob
        document.documentElement.style.setProperty('--highlight', highlightColor);
        document.documentElement.style.setProperty('--highlight-label', highlightLabelColor);
        console.log(highlightColor);
    });

    onOffSwitch.addEventListener('change', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const message = {
                method: "onoff-switch",
                value: onOffSwitch.checked,
                url: tabs[0].url
            };
            chrome.runtime.sendMessage(message);
        });
    });

    clearUrlHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearUrlHighlights(tabs[0].url, tabs[0].id);
        });
    });

    clearAllHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearAllLocalStorage(tabs[0].id);
        });
    });
});

// listen for messages from background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log(sender.tab ? "from background script: " + sender.tab.url : "from the extension");
});

function buildHighlightListHtml(highlights) {
    var highlightListHtml = '<ol class="highlight-ol">';
    highlights.forEach((highlight) => {
        const li = `<li class="highlight-li"'>${highlight}</li>`;
        highlightListHtml += li;
    });
    highlightListHtml += '</ol>';
    return highlightListHtml;
}

// HELPERS ---------------------------------------------------------------
function clearUrlHighlights(url, tabId) {
    chrome.storage.local.remove([url], () => {
        if (chrome.runtime.lastError) {
            console.error('Error while trying to remove local storage for:', url, chrome.runtime.lastError);
        }
    });
    chrome.tabs.reload(tabId);
}

function clearAllLocalStorage(tabId) {
    chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
            console.error('Error while trying to remove all local storage', chrome.runtime.lastError);
        }
    });
    chrome.tabs.reload(tabId);
}

function clearLocalStorageForDomain(domain) {
    // TODO
}

// https://stackoverflow.com/a/41491220
function pickTextColorBasedOnBgColor(bgColor, lightColor, darkColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? darkColor : lightColor;
}