import { ACTION } from "./constants";

const REQUEST_TIMEOUT = 500;
let timeoutId: number = 0;

let urls: string[] = [];

const handleRequestAdded = (): void => {
  window.clearTimeout(timeoutId);

  // 500ms間リクエストがなければ、リクエスト完了とみなす
  timeoutId = window.setTimeout(() => {
    document.dispatchEvent(new CustomEvent("RequestsCompleted"));
  }, REQUEST_TIMEOUT);
};
const handleRequestCompleted = (): void => {
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.runtime.sendMessage(
    {
      action: ACTION.REQUEST_COMPLETED_FROM_DEVTOOLS,
      urls,
    },
    (_) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        console.log("runtime.lastError", lastError.message);
        return;
      }
    }
  );
  urls = [];
  // });
};
document.addEventListener("RequestAdded", handleRequestAdded);
document.addEventListener("RequestsCompleted", handleRequestCompleted);
chrome.devtools.network.onRequestFinished.addListener((req) => {
  if (req._resourceType === "xhr") {
    urls.push(req.request.url);
    document.dispatchEvent(new CustomEvent("RequestAdded"));
  }
});
