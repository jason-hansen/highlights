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
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const domain = tabs[0].url;
            chrome.storage.local.get([domain], function (result) {
                result[domain] ??= [];
                var message = {
                    method: 'updated-highlight-list',
                    data: result[domain]
                };
                chrome.tabs.sendMessage(tabs[0].id, message);
            });
        });
    }
});

// listen for messages from content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log(sender.tab ? "from a content script: " + sender.tab.url : "from the extension");
    // message method: persist-highlight
    if (message.method === "persist-highlight") {
        const domain = sender.tab.url;
        const newSelection = message.selection;

        // add to local storage
        chrome.storage.local.get([domain], function (result) {
            result[domain] ??= [];
            var highlightsFromStorage = result[domain];

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
            chrome.storage.local.set({ [domain]: highlightsFromStorage });
        });
        return true; // async
    }
});

// listen for changes to local storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(`Local Storage Updated:`
            + `\n\tkey: ${key}`
            + `\n\tnew value: ${newValue}`
            + `\n\told value: ${oldValue}`);

        // send new value to frontend to do the highlighting
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var message = {
                method: 'updated-highlight-list',
                data: newValue
            };
            chrome.tabs.sendMessage(tabs[0].id, message);
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