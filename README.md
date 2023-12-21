# rails_routes

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.11. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.



- content script では chrome tabs query は使えない
- background では sender.tab.id で取得できる
- background は window は使えない
- 

```js
// background との通信
const port = chrome.runtime.connect({ name: "contentScript" });
port.postMessage({ message: "hello from contentScript" });
port.onMessage.addListener((response) => {
  console.log(response);
});
const contentPort = chrome.runtime.connect({ name: "contentScript" });
```


## connect で通信する

```js
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message, { sender }) => {
    port.postMessage("hi there from background");
  });
});
```

## script を注入する


script 使うには permission に　"scriptiong"
https://stackoverflow.com/questions/65476451/cannot-read-property-executescript-of-undefined


```js
// scriptを挿入して、その中では window が使える。
chrome.scripting
  .executeScript({
    target: { tabId: sender.tab.id },
    files: ["script.bundle.js"],
    // func: window.alert(sender.tab.id),
  })
  .then(() => console.log("script injected"));
```

## DevTools のパネルを使う

```js
chrome.devtools.panels.create(
  "Rails Routes", // パネルの名前
  "", // アイコン画像を指定できる
  "./panel.html", // パネルで表示されるhtml
  () => {
    chrome.devtools.network.onRequestFinished.addListener((req) => {
      // await req.getContent(); // ファイルの中身を取得できる
      if (req._resourceType === "xhr") {
        urls.push(req.request.url);
        document.dispatchEvent(new CustomEvent("RequestAdded"));
      }
    });
  }
);
```