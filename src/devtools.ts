const REQUEST_TIMEOUT = 2000;
let timeoutId: number = 0;

const urls: string[] = [];

const handleRequestAdded = (): void => {
  window.clearTimeout(timeoutId);

  // 2秒間リクエストがなければ、リクエスト完了とみなす
  timeoutId = window.setTimeout(() => {
    document.dispatchEvent(new CustomEvent("RequestsCompleted"));
  }, REQUEST_TIMEOUT);
};
const handleRequestCompleted = (): void => {
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.runtime.sendMessage(
    {
      action: "RequestsCompleted",
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
