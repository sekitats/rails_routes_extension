import { ACTION } from "./constants.ts";

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === ACTION.REQUEST_COMPLETED_FROM_DEVTOOLS) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, message);
    });
  }
});
