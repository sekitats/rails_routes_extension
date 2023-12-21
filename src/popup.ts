// const config = document.getElementById("config");
// const wrapper = document.querySelector(".textarea__wrapper");
const textarea = <HTMLTextAreaElement>document.querySelector(".textarea");
const save = <HTMLButtonElement>document.getElementById("save");
// const controller = document.getElementById("controller");
// const view = document.getElementById("view");

interface Route {
  method: string;
  path: string;
  controller: string;
}

const clickCallback = (action: string, value: Partial<Route[]>): void => {
  const params = { action, value };
  chrome.runtime.sendMessage(params);
};

// config.addEventListener("click", () => {
//   config.classList.toggle("hide");
//   wrapper.classList.toggle("hide");
//   controller.classList.toggle("hide");
//   view.classList.toggle("hide");
// });

// controller.addEventListener("click", async () => {
//   await clickCallback("controller");
// });

// view.addEventListener("click", async () => {
//   await clickCallback("view");
// });

const uppercaseLineRegex = /^\s+([A-Z]+)\s+(\S+)\s+(.+)$/;
const lowercaseLineRegex = /^\s+([a-z]+)\s+(\S+)\s+(\S+)\s+(.+)$/;

const normalizePath = (originalPath: string): string => {
  // パス内のプレースホルダーを ":id" に統一し、formatプレースホルダーを削除する
  const normalizedPath = originalPath
    .replace(/:(?!format)[a-z_]+/g, ":id") // format以外のプレースホルダーを":id"に統一
    .replace(/\(\.:format\)/, ""); // (.format)を削除

  return normalizedPath;
};

save.addEventListener("click", async () => {
  const value = textarea.value;
  if (!value) {
    return;
    // await clickCallback("storeRoutes", 'get "/" => "home#index"');
  }

  const lines = value.split("\n").filter(Boolean);
  const routes = lines
    .map((line: string) => {
      if (line.match(uppercaseLineRegex)) {
        const match1 = line.match(uppercaseLineRegex);
        if (!match1) return undefined;
        let [, method, path, controller] = match1;
        return {
          method,
          path: normalizePath(path),
          controller,
        };
      } else if (line.match(lowercaseLineRegex)) {
        const match2 = line.match(lowercaseLineRegex);
        if (!match2) return undefined;
        let [, , method, path, controller] = match2;
        return {
          method,
          path: normalizePath(path),
          controller,
        };
      } else undefined;
    })
    .filter(Boolean);

  clickCallback("storeRoutes", routes);
  window.close();
});
