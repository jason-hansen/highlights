// BACKEND
const highlights = {};

// run the content.js script when the page is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isDoneLoading(changeInfo.status) && isValidHttp(tab.url)) {
        // startup the content.js
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        // send existing highlights to content.js
        chrome.storage.local.get([tab.url], function (result) {
            if (result[tab.url] && result[tab.url].on) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const url = tabs[0].url;
                    chrome.storage.local.get([url], function (result) {
                        result[url] ??= [];
                        var message = {
                            method: 'updated-highlight-list',
                            data: result[url]
                        };
                        if (tabs.length > 0) {
                            // console.log('sending to tab:', JSON.stringify(message.data));
                            chrome.tabs.sendMessage(tabs[0].id, message);
                        } else {
                            // console.log('sending to popup:', JSON.stringify(message.data));
                            chrome.runtime.sendMessage(message);
                        }
                    });
                });
            } else {
                return;
            }
        });
    }
});

// listen for messages from content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log(sender.tab ? "from a content script: " + sender.tab.url : "from the extension");

    // message method: persist-highlight
    if (message.method === "persist-highlight") {
        const url = sender.tab.url;
        const newSelection = message.selection;

        // add to local storage
        chrome.storage.local.get([url], function (result) {
            result[url] ??= { on: true, highlights: [] };
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
            chrome.storage.local.set({ [url]: { ...result[url], highlights: highlightsFromStorage } });
        });
        return true; // async
    }

    if (message.method === 'onoff-switch') {
        chrome.storage.local.get([message.url], function (result) {
            result[message.url] ??= { on: undefined, highlights: [] };
            var urlPackage = result[message.url];
            urlPackage.on = message.value;
            chrome.storage.local.set({ [message.url]: urlPackage }, () => {
                sendResponse({ value: message.value });
            });
        });
        return true;
    }

    if (message.method === 'is-highlighting') {
        chrome.storage.local.get([message.url], function (result) {
            result[message.url] ??= { on: undefined, highlights: [] };
            var urlPackage = result[message.url];
            sendResponse({ isHighlighting: urlPackage.on ? urlPackage.on : false });
        });
        return true;
    }

    if (message.method === 'get-data') {
        chrome.storage.local.get([message.url], function (result) {
            result[message.url] ??= { on: undefined, highlights: [] };
            var urlPackage = result[message.url];
            sendResponse({ data: urlPackage });
        });
        return true;
    }
});

// listen for changes to local storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Local storage updated:`
            + `\n\tkey: ${key}`
            + `\n\told value: ${JSON.stringify(oldValue)}`
            + `\n\tnew value: ${JSON.stringify(newValue)}`);

        // hacky fix
        if (newValue == undefined || newValue == null || newValue == true || newValue == false) {
            newValue = [];
        }
        // send new value to frontend to do the highlighting
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var message = {
                method: 'updated-highlight-list',
                data: newValue
            };
            if (tabs.length > 0) {
                // console.log('sending to tab:', JSON.stringify(message.data));
                chrome.tabs.sendMessage(tabs[0].id, message);
                chrome.tabs.reload(tabs[0].id); // have to  refresh here rather than in content.js because chrome.tabs isn't accessable there
                return true;
            }
            // not necessary because you can't update while having the popup open... so this code will never be called
            // else {
            //     console.log('sending to popup:', JSON.stringify(message.data));
            //     chrome.runtime.sendMessage(message);
            //     return true;
            // }
        });
    }
});

// HELPERS ---------------------------------------------------------------
function isDoneLoading(status) {
    return status === 'complete';
}

function isValidHttp(url) {
    return /^http/.test(url);
}

function addValueToKey(key, value) {
    highlights[key] ??= []; // logical nullish only assigns if x is nullish
    if (!highlights[key].includes(value)) {
        highlights[key].push(value);
    }
}