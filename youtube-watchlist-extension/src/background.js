const watchList = [];

// Load watch list from local storage
chrome.storage.local.get(['watchList'], function(result) {
    if (result.watchList) {
        watchList.push(...result.watchList);
    }
});

// Save video to watch list
function saveVideo(title, timestamp, url) {
    chrome.storage.local.get(['watchList'], function(result) {
        let watchList = result.watchList || [];
        // Check if the video already exists (by URL)
        const existingIndex = watchList.findIndex(v => v.url === url);
        if (existingIndex !== -1) {
            // Update timestamp if already exists
            watchList[existingIndex].timestamp = timestamp;
        } else {
            // Add new entry
            watchList.push({ title, timestamp, url });
        }
        chrome.storage.local.set({ watchList });
    });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveVideo') {
        // sender.tab.url gives the current tab's URL
        const url = sender.tab && sender.tab.url
            ? addTimestampToUrl(sender.tab.url, request.timestamp)
            : '';
        saveVideo(request.title, request.timestamp, url);
        sendResponse({ status: 'success' });
    }
});

function addTimestampToUrl(url, timestamp) {
    // Add or update the 't' parameter in the URL
    const u = new URL(url);
    u.searchParams.set('t', timestamp);
    return u.toString();
}