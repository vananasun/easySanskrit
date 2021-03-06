let Util = require('util.js');
let MessageBus = require('message-bus.js');

noplugin = (typeof SIMPLYSANSKRIT_NOPLUGIN !== 'undefined');
g_messageBus = new MessageBus(noplugin);


romanShowed = false;

// Check for commands (hotkeys)
g_messageBus.addCommandListener(command => { if (noplugin) return;

    // Don't bother with any command but the toggle roman hotkey
    if (command !== "toggle-show-roman") return;

    // Toggle wheter roman is displayed
    romanShowed = !romanShowed;

    // Send message to content script in current tab that we toggle roman
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'show-roman', showRoman: romanShowed },
            function(response) {}
        );
    });

    return Promise.resolve('');

});

// Dictionary lookup handler
g_messageBus.addMessageListener((request, sender, sendResponse) => {
    if (request.action !== "lookupSanskrit") return;

    // fetch the page contents of the dictionary
    fetch(request.url)
        .then(r => { return r.text() })
        .then(d => {
            sendResponse({ 'body': d, 'word': request.word });
        })
        .catch(error => {/*console.warn(error)*/});

    return true; // will respond asynchronously
});
