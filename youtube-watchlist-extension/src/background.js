const watchList = [];

// Load watch list from local storage
chrome.storage.local.get(['watchList'], function(result) {
    if (result.watchList) {
        watchList.push(...result.watchList);
    }
});

// Handles saving and updating the watch list in Chrome storage

// Save or update a video in the watch list
function saveVideo(title, timestamp, url) {
    chrome.storage.local.get(['watchList'], (result) => {
        let watchList = result.watchList || [];
        const existingIndex = watchList.findIndex(v => v.url === url);
        if (existingIndex !== -1) {
            watchList[existingIndex].timestamp = timestamp;
        } else {
            watchList.push({ title, timestamp, url });
        }
        chrome.storage.local.set({ watchList });
    });
}

// Add or update the timestamp parameter in the video URL
function addTimestampToUrl(url, timestamp) {
    try {
        const u = new URL(url);
        u.searchParams.set('t', timestamp);
        return u.toString();
    } catch {
        return url;
    }
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveVideo') {
        const url = sender.tab && sender.tab.url
            ? addTimestampToUrl(sender.tab.url, request.timestamp)
            : '';
        saveVideo(request.title, request.timestamp, url);
        sendResponse({ status: 'success' });
    }
});