import { ACTION } from "./constants.ts";
import { addRoutes } from "./store.ts";

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === ACTION.SAVE_ROUTES_FROM_CONTENT) {
    console.log(message.value);
    addRoutes(message.value);
  }

  if (message.action === ACTION.REQUEST_COMPLETED_FROM_DEVTOOLS) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, message);
    });
  }
});
