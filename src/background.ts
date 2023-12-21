import { addRoutes } from "./store";

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "storeRoutes") {
    console.log(message.value);
    addRoutes(message.value);
  }

  if (message.action === "RequestsCompleted") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, message);
    });
  }
  // await chrome.runtime.sendMessage({
  //   message: "from network",
  //   url: message.url,
  // });
});

chrome.contextMenus.create(
  {
    id: "Rails Routes",
    title: "Rails Routes",
    contexts: ["page"],
  },
  () => chrome.runtime.lastError
);
chrome.contextMenus.create(
  {
    parentId: "Rails Routes",
    title: "api controller",
    contexts: ["page"],
    id: "api",
  },
  () => chrome.runtime.lastError
);
chrome.contextMenus.create(
  {
    parentId: "Rails Routes",
    title: "page controller",
    contexts: ["page"],
    id: "controller",
  },
  () => chrome.runtime.lastError
);
chrome.contextMenus.create(
  {
    parentId: "Rails Routes",
    title: "view or vue",
    contexts: ["page"],
    id: "view",
  },
  () => chrome.runtime.lastError
);

chrome.contextMenus.onClicked.addListener(function (clickData) {
  console.log(clickData.menuItemId);
  if (clickData.menuItemId === "api") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, {
        action: "api",
      });
    });
  } else if (clickData.menuItemId === "controller") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, {
        action: "controller",
      });
    });
  } else if (clickData.menuItemId === "view") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, {
        action: "view",
      });
    });
  }
});
