// Listen to copy event and save it to chrome storage
document.addEventListener('copy', function (e) {
    navigator.clipboard.readText().then(
        clipboardText => {
            clipboardText = clipboardText.trim();
            if (clipboardText !== "") {
                chrome.storage.sync.get(['clipboardTextList'], function (result) {
                    const clipboardTextList = result.clipboardTextList ? [clipboardText, ...result.clipboardTextList] : [clipboardText];
                    chrome.storage.sync.set({ clipboardTextList }, function () { });
                });
            }
        }
    );
}, false);
