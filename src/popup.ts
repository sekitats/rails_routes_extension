import { ACTION } from "./constants";
import { createPath } from "./path";

const textarea = document.querySelector(".textarea") as HTMLTextAreaElement;
const save = document.getElementById("save") as HTMLButtonElement;

interface Route {
  method: string;
  path: string;
  controller: string;
}

interface Params {
  action: string;
  value?: Route | string;
}
const sendMessageToContent = async (
  params: Params
): Promise<Route[] | string> => {
  const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
  const response = await chrome.tabs.sendMessage(tab.id!, params);
  return response;
};

function createList(routes: string[], root: HTMLDivElement) {
  const div = document.createElement("div");
  const list = document.createElement("ul");
  const li = document.createElement("li");
  const anchor = document.createElement("a");
  routes.forEach((route) => {
    anchor.href = route;
    anchor.textContent = route;
    li.appendChild(anchor);
    list.appendChild(li);
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      sendMessageToContent({ action: ACTION.OPEN_IN_EDITOR, value: route });
    });
    div.appendChild(list);
    root.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await sendMessageToContent({ action: ACTION.INITIALIZE_FROM_POPUP });

  const response = await sendMessageToContent({
    action: ACTION.GET_API_ROUTES_FROM_POPUP,
  });
  if (response) {
    const paths = (response as Route[]).map((res) =>
      createPath("api", res.controller)
    );
    const apiRoot = document.getElementById("api") as HTMLDivElement;
    createList(paths, apiRoot);
  }
});

chrome.runtime.onMessage.addListener(({ action, value }) => {
  if (action === ACTION.INITIALIZE_FROM_CONTENT) {
    const controller = createPath("controller", value.controller);
    const view = createPath("view", value.controller);
    if (controller) {
      const controllerRoot = document.getElementById(
        "controller"
      ) as HTMLDivElement;
      createList([controller], controllerRoot);
    }
    if (view) {
      const viewRoot = document.getElementById("view") as HTMLDivElement;
      createList([view], viewRoot);
    }
  }
});

// config.addEventListener("click", () => {
//   config.classList.toggle("hide");
//   wrapper.classList.toggle("hide");
//   controller.classList.toggle("hide");
//   view.classList.toggle("hide");
// });

const normalizePath = (originalPath: string): string => {
  // パス内のプレースホルダーを ":id" に統一し、formatプレースホルダーを削除する
  const normalizedPath = originalPath
    .replace(/:(?!format)[a-z_]+/g, ":id") // format以外のプレースホルダーを":id"に統一
    .replace(/\(\.:format\)/, ""); // (.format)を削除

  return normalizedPath;
};

const clickCallback = async (action: string, value?: any): Promise<void> => {
  const params = { action, value };
  await sendMessageToContent(params);
};

save.addEventListener("click", async () => {
  const value = textarea.value;
  if (!value) return;

  const uppercaseLineRegex = /^\s+([A-Z]+)\s+(\S+)\s+(.+)$/;
  const lowercaseLineRegex = /^\s+([a-z]+)\s+(\S+)\s+(\S+)\s+(.+)$/;

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
      } else;
    })
    .filter(Boolean);

  await clickCallback(ACTION.SAVE_ROUTES_FROM_POPUP, routes);
  window.close();
});
