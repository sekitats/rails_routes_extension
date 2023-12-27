const port = chrome.runtime.connect({ name: "panel" });
chrome.devtools.network.onRequestFinished.addListener((req) => {
  if (req._resourceType === "xhr") {
    console.log(req.request.url);

    // chrome.runtime.sendMessage({
    //   message: "network send",
    //   url: req.request.url,
    // });

    port.postMessage({
      message: "network post",
      url: req.request.url,
    });
    // req.getContent((body) => {
    //   console.log(body);
    // });
  }
});
