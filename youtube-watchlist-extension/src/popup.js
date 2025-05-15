document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('watch-list');
    const clearBtn = document.getElementById('clear-list');

    function renderList(watchList) {
        if (watchList.length === 0) {
            list.innerHTML = '<li>No videos saved.</li>';
            return;
        }
        list.innerHTML = '';
        watchList.forEach((video, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${video.url || '#'}" target="_blank">
                    ${video.title}
                </a>
                <span class="timestamp">${formatTime(video.timestamp)}</span>
                <button class="remove-btn" title="Remove">&#10005;</button>
            `;
            // Remove button logic
            li.querySelector('.remove-btn').onclick = () => {
                chrome.storage.local.get(['watchList'], (result) => {
                    const updatedList = (result.watchList || []).filter((v, i) => i !== idx);
                    chrome.storage.local.set({ watchList: updatedList }, () => renderList(updatedList));
                });
            };
            list.appendChild(li);
        });
    }

    chrome.storage.local.get(['watchList'], (result) => {
        renderList(result.watchList || []);
    });

    clearBtn.onclick = () => {
        chrome.storage.local.set({ watchList: [] }, () => {
            renderList([]);
        });
    };
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

// CSS for .remove-btn should be placed inside a <style> tag in popup.html, not in this JS file.