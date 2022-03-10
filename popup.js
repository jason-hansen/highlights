document.addEventListener('DOMContentLoaded', () => {
    var colorpicker = document.getElementById('colorpicker');
    colorpicker.addEventListener('change', () => {
        // document.body.style.backgroundColor = colorpicker.value;
        console.log(colorpicker.value);
    });

    var clearUrlHighlightsButton = document.getElementById('clear-url-highlights-button');
    clearUrlHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearUrlHighlights(tabs[0].url, tabs[0].id);
        });
    });

    var clearAllHighlightsButton = document.getElementById('clear-all-highlights-button');
    clearAllHighlightsButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            clearAllLocalStorage(tabs[0].id);
        });
    });
});

function clearUrlHighlights(url, tabId) {
    chrome.storage.local.remove([url], () => {
        var error = chrome.runtime.lastError;
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
        var error = chrome.runtime.lastError;
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