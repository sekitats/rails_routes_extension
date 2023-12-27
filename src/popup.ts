import { ACTION } from "./constants";
import { normalizePath } from "./path";
// import { createPath } from "./path";

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
