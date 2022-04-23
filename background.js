// BACKEND
var debug = true;
debug ? console.log('Debug printing enabled: background.js') : null;
// debug ? console.log('') : null;

const highlights = {};

// run the content.js script when the page is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isDoneLoading(changeInfo.status) && isValidHttp(tab.url)) {
        // startup the content.js
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    }
});

// listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(sender.tab ? 'from a content script: ' + sender.tab.url : 'from the extension');

    // HANDLE MESSAGES FROM CONTENT ---------------------------------------
    if (message.method === 'get-data') {
        chrome.storage.local.get([message.url], (result) => {
            result[message.url] ??= { on: undefined, highlights: [] };
            var urlPackage = result[message.url];
            sendResponse({ data: urlPackage });
        });
        return true;
    }

    if (message.method === 'is-highlighting') {
        chrome.storage.local.get([message.url], (result) => {
            result[message.url] ??= initializeDefaultData(undefined);
            var urlPackage = result[message.url];
            sendResponse({ isHighlighting: urlPackage.on ? urlPackage.on : false });
        });
        return true;
    }

    if (message.method === 'persist-highlight') {
        const url = sender.tab.url;
        const newSelection = message.selection;

        // add to local storage
        chrome.storage.local.get([url], (result) => {
            result[url] ??= initializeDefaultData(undefined);
            var highlightsFromStorage = result[url].highlights;

            // add if highlight isn't there
            if (!highlightsFromStorage.includes(newSelection)) {
                highlightsFromStorage.push(newSelection);
            } else {
                // remove if highlight already exists
                const index = highlightsFromStorage.indexOf(newSelection);
                if (index > -1) {
                    highlightsFromStorage.splice(index, 1);
                }
            }
            chrome.storage.local.set({ [url]: { ...result[url], highlights: highlightsFromStorage } }, () => {
                sendResponse({ value: 'persited!' });
            });
        });
        return true; // async
    }

    // HANDLE MESSAGES FROM POPUP -----------------------------------------
    if (message.method === 'onoff-switch') {
        chrome.storage.local.get([message.url], (result) => {
            result[message.url] ??= initializeDefaultData(undefined);
            var urlPackage = result[message.url];
            urlPackage.on = message.value;
            chrome.storage.local.set({ [message.url]: urlPackage }, () => {
                sendResponse({ value: message.value });
            });
        });
        return true;
    }

    if (message.method === 'persist-highlight-color-info') {
        const url = message.url;

        // add to local storage
        chrome.storage.local.get([url], (result) => {
            result[url] ??= initializeDefaultData(true);
            result[url].highlightColor = message.highlightColor;
            result[url].highlightLabelColor = message.highlightLabelColor;

            chrome.storage.local.set({ [url]: result[url] }, () => {
                sendResponse({ data: result[url] });
            });
        });
        return true; // async
    }

    if (message.method === 'clear-highlights-for-url') {
        const url = message.url;
        const tabId = message.tabId;

        chrome.storage.local.get([url], (result) => {
            result[url] ??= initializeDefaultData(undefined);
            result[url].highlights = [];
            chrome.storage.local.set({ [url]: result[url] }, () => {
                sendResponse({ value: 'cleared highlights for url!'});
            });
        });
        return true; // async
    }

    if (message.method === 'clear-all-info') {
        chrome.storage.local.clear(() => {
            sendResponse({ value: 'cleared all info!'});
        });
        return true; // async
    }
});

// listen for changes to local storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        // console.log(`key: ${key}`);
        // console.log(`Local storage key: ${key}, old value:\n${JSON.stringify(oldValue, null, 2)}`);
        // console.log(`Local storage key: ${key}, new value:\n${JSON.stringify(newValue, null, 2)}`);
        debug ? console.log('diff of old state and new state:', diff(oldValue, newValue)) : null;

        // send new value to frontend to do the highlighting
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var dataUpdatedMessage = {
                method: 'highlight-data-updated',
                data: newValue
            };
            if (tabs.length > 0) {
                // console.log('sending updated values to content.js:');
                chrome.tabs.sendMessage(tabs[0].id, dataUpdatedMessage, (response) => {
                    // console.log(response);
                    if (newValue && !newValue.on) {
                        chrome.tabs.reload(tabs[0].id); // have to  refresh here rather than in content.js because chrome.tabs isn't accessable there
                    }
                });
                return true;
            }
        });
    }
});

// HELPERS ---------------------------------------------------------------
function initializeDefaultData(isOn) {
    return {
        on: isOn,
        highlights: [],
        highlightColor: '#e7cd97',
        highlightLabelColor: '#000000'
    };
}

// https://stackoverflow.com/a/8432188
function diff(obj1, obj2) {
    const result = {};
    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
        if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
            result[key] = obj2[key];
        }
        if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
            const value = diff(obj1[key], obj2[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        }
    });
    return result;
}

function isDoneLoading(status) {
    return status === 'complete';
}

function isValidHttp(url) {
    return /^http/.test(url);
}