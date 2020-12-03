const clipboardList = document.getElementById("clipboard-list");
const searchInput = document.getElementById("search-input");
const cleanButton = document.getElementById("clean-action");
const mergeButton = document.getElementById("merge-action");

// Storage
let list = [];
let filteredList = [];

// Listen to changes in chrome storage and update DOM
chrome.storage.onChanged.addListener(function (changes, namespace) {
    const changedList = changes['clipboardTextList'];
    if (changedList) {
        populateClipboardList(changedList)
    }
});

// Listen to DOM Content Load event and populate list from storage
document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.sync.get(['clipboardTextList'], function (result) {
        list = result.clipboardTextList;
        populateClipboardList(list)
    });
});

// Listen to search input changes and filter list
searchInput.addEventListener("input", function (event) {
    let searchString = event.target.value;
    filteredList = list;
    if (searchString) {
        searchString = searchString.toLowerCase();
        filteredList = list.filter((item) => typeof item === "string" && item.toLowerCase().includes(searchString));
    }
    populateClipboardList(filteredList, searchString);
    toggleMergeButtonState(searchString);
})

// Listen to click on "Remove all" button and clear storage
cleanButton.addEventListener("click", function (event) {
    chrome.storage.sync.set({ clipboardTextList: [] }, function () { });
    populateClipboardList([]);
})

// Listen to click on "Copy all" button and merge list items into one and put in clipboard
mergeButton.addEventListener("click", function (event) {
    if (event.target.textContent === "Copy selected") {
        copyTextToClipboard(filteredList.join("\r\n"));
    } else {
        copyTextToClipboard(list.join("\r\n"));
    }
    showTooltip(event);
})

// Listen to click on list items and copy item content into clipboard
clipboardList.addEventListener("click", function (event) {
    const element = event.target.tagName.toLowerCase() === "span" ? event.target.parentElement : event.target;

    if (element.tagName.toLowerCase() === "p") {
        const textToCopy = element.dataset.fullText ? element.dataset.fullText : element.textContent;
        copyTextToClipboard(textToCopy);
        showTooltip(event);
    }
})

// Render list items with optional search filtering 
function populateClipboardList(list, searchString) {
    // Remove all items
    while (clipboardList.firstChild) clipboardList.removeChild(clipboardList.lastChild);

    // Render new list
    const itemsCount = list.length;
    for (i = 0; i < itemsCount; ++i) {
        renderItem(list[i], searchString)
    }
    const listMaxHeight = Math.min(100, itemsCount * 41);
    clipboardList.style.height = `${listMaxHeight}px`;

}

// Render single item
function renderItem(itemContent, searchString) {
    const listItem = document.createElement('p');

    if (searchString) {
        const matchedIndex = itemContent.toLowerCase().indexOf(searchString);
        const matchedText = matchedIndex > 0 ? `...${itemContent.slice(matchedIndex)}` : itemContent;
        const regEx = new RegExp(searchString, "ig");
        listItem.dataset.fullText = itemContent;
        listItem.innerHTML = matchedText.replace(regEx, `<span>${searchString}</span>`);
    } else {
        listItem.innerHTML = itemContent;
    }
    clipboardList.appendChild(listItem);
}

// Copy provided text into clipboard
function copyTextToClipboard(text) {
    const dummyElement = document.createElement('textarea');
    dummyElement.value = text
    document.body.appendChild(dummyElement);
    dummyElement.select();
    document.execCommand('copy');
    document.body.removeChild(dummyElement);
}

// Show tooltip above provided click event
function showTooltip(event) {
    const tooltip = document.createElement('div');
    const eventX = event.clientX;
    const eventY = event.clientY;
    tooltip.style.left = `${eventX - 24}px`;
    tooltip.style.top = `${eventY - 28}px`;
    tooltip.className = "tooltip_container";
    tooltip.textContent = "Copied!";
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.style.opacity = 0, 500);
    setTimeout(() => document.body.removeChild(tooltip), 1000);
}

// Change merge button label
function toggleMergeButtonState(searchString) {
    mergeButton.textContent = searchString ? "Copy selected" : "Copy all";
}