document.addEventListener('DOMContentLoaded', () => {
    const onOffSwitch = document.getElementById('onoff-switch');

    const colorpicker = document.getElementById('colorpicker');
    const colorpickerContainer = document.getElementById('colorpicker-container');
    const colorpickerLabel = document.getElementById('colorpicker-label');

    const highlightListDiv = document.getElementById('highlight-list');

    const clearUrlHighlightsButton = document.getElementById('clear-url-highlights-button');
    const clearAllHighlightsButton = document.getElementById('clear-all-highlights-button');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const getDataMessage = {
            method: "get-data",
            url: tabs[0].url
        };
        chrome.runtime.sendMessage(getDataMessage, (getDataResponse) => {
            // set on/off switch
            const isHighlighting = getDataResponse.data.on ? true : false;
            onOffSwitch.checked = isHighlighting;

            // set colorpicker and label color
            colorpickerContainer.style.backgroundColor = getDataResponse.data.highlightColor;
            colorpickerLabel.style.color = getDataResponse.data.highlightLabelColor;

            // set highlights list
            if (getDataResponse.data.highlights.length > 0) {
                highlightListDiv.innerHTML = buildHighlightListHtml(getDataResponse.data.highlights);
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

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const persistHighlightColorMessage = {
                method: "persist-highlight-color-info",
                highlightColor: highlightColor,
                highlightLabelColor: highlightLabelColor,
                url: tabs[0].url
            };
            chrome.runtime.sendMessage(persistHighlightColorMessage);
        });
    });

    onOffSwitch.addEventListener('change', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const onOffValueMessage = {
                method: "onoff-switch",
                value: onOffSwitch.checked,
                url: tabs[0].url
            };
            chrome.runtime.sendMessage(onOffValueMessage);
        });
    });

    clearUrlHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearUrlHighlights(tabs[0].url);
        });
    });

    clearAllHighlightsButton.addEventListener('click', () => {
        clearAllInfo();
    });
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
function clearUrlHighlights(url) {
    const clearHighlightsForUrlMessage = {
        method: 'clear-highlights-for-url',
        url: url
    };
    chrome.runtime.sendMessage(clearHighlightsForUrlMessage, (clearHighlightsForUrlMessage) => {
        window.location.reload(); // TODO this reloads the popup, not the tab...
        console.log(clearHighlightsForUrlMessage);
    });
}

function clearAllInfo() {
    const clearAllInfoMessage = {
        method: 'clear-all-info'
    };
    chrome.runtime.sendMessage(clearAllInfoMessage, (clearAllInfoResponse) => {
        window.location.reload(); // TODO this reloads the popup, not the tab...
        console.log(clearAllInfoResponse);
    });
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