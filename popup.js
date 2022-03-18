var isHighlightingOn;
chrome.storage.local.get(['isHighlighting'], function (result) {
    isHighlightingOn = result.isHighlighting ? true : false;
    console.log("on load, isHighlightingOn:", isHighlightingOn);
});

document.addEventListener('DOMContentLoaded', () => {
    const colorpicker = document.getElementById('colorpicker');
    const colorpickerContainer = document.getElementById('colorpicker-container');
    const colorpickerLabel = document.getElementById('colorpicker-label');

    colorpicker.addEventListener('change', () => {
        const highlightColor = colorpicker.value;
        const highlightLabelColor =
            pickTextColorBasedOnBgColor(
                highlightColor,
                getComputedStyle(document.documentElement).getPropertyValue('--white').trim(),
                getComputedStyle(document.documentElement).getPropertyValue('--black').trim());
        colorpickerContainer.style.backgroundColor = highlightColor;
        colorpickerLabel.style.color = highlightLabelColor;

        // TODO persist these?
        document.documentElement.style.setProperty('--highlight', highlightColor);
        document.documentElement.style.setProperty('--highlight-label', highlightLabelColor);
        console.log(highlightColor);
    });

    var onOffSwitch = document.getElementById('onoff-switch');
    onOffSwitch.checked = isHighlightingOn;
    onOffSwitch.addEventListener('change', () => {
        var message = {
            method: "onoff-switch",
            value: onOffSwitch.checked
        };
        chrome.runtime.sendMessage(message, (response) => {
            chrome.storage.local.get(['isHighlighting'], function (result) {
                onOffSwitch.checked = result.isHighlighting;
            });
        });
    });

    const clearUrlHighlightsButton = document.getElementById('clear-url-highlights-button');
    clearUrlHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearUrlHighlights(tabs[0].url, tabs[0].id);
        });
    });

    const clearAllHighlightsButton = document.getElementById('clear-all-highlights-button');
    clearAllHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearAllLocalStorage(tabs[0].id);
        });
    });
});

// listen for messages from background.js
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        // console.log(sender.tab ? "from background script: " + sender.tab.url : "from the extension");
        if (message.method === "updated-highlight-list") {
            if (message && message.data) {
                console.log(message.data);
            }
        }
    }
);

// HELPERS ---------------------------------------------------------------
function isHighlightingOn() {
    chrome.storage.local.get(['isHighlighting'], function (result) {
        console.log(result.isHighlighting);
        return result.isHighlighting ? true : false;
    });
}

function clearUrlHighlights(url, tabId) {
    chrome.storage.local.remove([url], () => {
        const error = chrome.runtime.lastError;
        if (error) {
            console.error('Error while trying to remove local storage for:', url, error);
        } else {
            console.log('Local storage for url:', url);
        }
    });
    chrome.tabs.reload(tabId);
}

function clearAllLocalStorage(tabId) {
    chrome.storage.local.clear(() => {
        const error = chrome.runtime.lastError;
        if (error) {
            console.error('Error while trying to remove all local storage', error);
        } else {
            console.log('All local storage was removed');
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