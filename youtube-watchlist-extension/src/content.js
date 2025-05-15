function addSaveButton() {
    if (document.getElementById('yt-watchlist-save-btn')) return;

    // Create button
    const button = document.createElement('button');
    button.id = 'yt-watchlist-save-btn';
    button.title = 'Save to Watch List';
    button.innerHTML = `
        <svg height="20" width="20" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;fill:#fff;">
            <path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2H6zm0-2h12a4 4 0 0 1 4 4v18l-10-6.667L2 22V6a4 4 0 0 1 4-4z"/>
        </svg>
        <span style="vertical-align:middle;font-size:15px;">Save</span>
    `;
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.gap = '4px';
    button.style.background = '#b22222'; // darker red
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '20px';
    button.style.padding = '6px 14px';
    button.style.fontWeight = '600';
    button.style.fontSize = '15px';
    button.style.cursor = 'pointer';
    button.style.marginLeft = '8px';
    button.style.boxShadow = '0 2px 8px #0002';
    button.style.transition = 'background 0.2s, transform 0.2s';

    button.onmouseover = () => {
        button.style.background = '#d32f2f'; // slightly lighter dark red for hover
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

    // Placement: next to Like/Dislike/Share buttons
    const buttonsContainer = document.querySelector('#top-level-buttons-computed') || document.querySelector('#top-level-buttons');
    if (buttonsContainer) {
        buttonsContainer.appendChild(button);
    } else {
        document.body.appendChild(button);
    }
}

// Run when the page loads or changes
setTimeout(addSaveButton, 2000);