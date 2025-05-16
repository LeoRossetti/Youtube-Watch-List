// Injects the "Save to Watch List" button on YouTube video pages and handles SPA navigation

let lastVideoId = null;
let debounceTimeout = null;
let observer = null;

// Extracts the video ID from the current URL
function getVideoIdFromUrl() {
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get('v');
    } catch {
        return null;
    }
}

// Creates the styled Save button
function createSaveButton() {
    const button = document.createElement('button');
    button.id = 'yt-watchlist-save-btn';
    button.title = 'Save to Watch List';
    button.innerHTML = `
        <svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;fill:#fff;">
            <path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6zm0-2h12a4 4 0 0 1 4 4v18l-10-6.667L2 22V6a4 4 0 0 1 4-4z"/>
        </svg>
        <span style="vertical-align:middle;font-size:15px;">Save</span>
    `;
    Object.assign(button.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#b22222',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        padding: '6px 14px',
        fontWeight: '600',
        fontSize: '15px',
        cursor: 'pointer',
        marginLeft: '8px',
        boxShadow: '0 2px 8px #0002',
        transition: 'background 0.2s, transform 0.2s'
    });

    button.onmouseover = () => {
        button.style.background = '#d32f2f';
        button.style.transform = 'scale(1.04)';
    };
    button.onmouseout = () => {
        button.style.background = '#b22222';
        button.style.transform = 'none';
    };

    button.onclick = () => {
        const title = document.title.replace(' - YouTube', '');
        const video = document.querySelector('video');
        const timestamp = video ? Math.floor(video.currentTime) : 0;

        chrome.runtime.sendMessage({
            action: 'saveVideo',
            title,
            timestamp
        }, (response) => {
            if (response && response.status === 'success') {
                button.innerHTML = `
                    <svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;fill:#fff;">
                        <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z"/>
                    </svg>
                    <span style="vertical-align:middle;font-size:15px;">Saved!</span>
                `;
                setTimeout(() => {
                    button.innerHTML = `
                        <svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;fill:#fff;">
                            <path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6zm0-2h12a4 4 0 0 1 4 4v18l-10-6.667L2 22V6a4 4 0 0 1 4-4z"/>
                        </svg>
                        <span style="vertical-align:middle;font-size:15px;">Save</span>
                    `;
                }, 2000);
            }
        });
    };

    return button;
}

// Adds the Save button if on a new video and the container exists
function addSaveButtonIfNeeded() {
    const videoId = getVideoIdFromUrl();
    if (!videoId || videoId === lastVideoId) return;
    lastVideoId = videoId;

    // Remove existing button to prevent duplicates
    const oldBtn = document.getElementById('yt-watchlist-save-btn');
    if (oldBtn) oldBtn.remove();

    // Wait for the buttons container to exist
    function tryInsert() {
        const buttonsContainer = document.querySelector('#top-level-buttons-computed') || document.querySelector('#top-level-buttons');
        if (buttonsContainer) {
            const button = createSaveButton();
            buttonsContainer.appendChild(button);
        } else {
            setTimeout(tryInsert, 300);
        }
    }
    tryInsert();
}

// Observes for DOM changes and SPA navigation
function observeAndAddButton() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(addSaveButtonIfNeeded, 300);
    });

    const target = document.querySelector('ytd-watch-flexy');
    if (target) {
        observer.observe(target, { childList: true, subtree: true });
        addSaveButtonIfNeeded();
    } else {
        setTimeout(observeAndAddButton, 1000);
    }
}

// Listen for YouTube SPA navigation events
window.addEventListener('yt-navigate-finish', () => {
    lastVideoId = null;
    observeAndAddButton();
});

// Initial run
observeAndAddButton();