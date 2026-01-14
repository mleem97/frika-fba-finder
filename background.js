// background.js - FBA Finder Service Worker (Manifest V3)

// Amazon orange color for badge
const BADGE_COLOR = '#FF9900';

// Set badge background color on install/startup
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
});

// Also set on startup (in case service worker was inactive)
chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateBadge') {
        const count = message.count;
        const tabId = sender.tab?.id;

        if (tabId) {
            // If count is 0, hide badge by setting empty text
            const badgeText = count > 0 ? count.toString() : '';
            
            chrome.action.setBadgeText({
                text: badgeText,
                tabId: tabId
            });
        }
    }
    
    // Return true to indicate we'll send a response asynchronously (if needed)
    return true;
});
