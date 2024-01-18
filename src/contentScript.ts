import {
  Route,
  addRoutes,
  normalizeRoutes,
  searchRoutesByPath,
  setApiRoutesToStorage,
} from "./store";
import { openInEditor } from "./path";
import { ACTION } from "./constants";

if (sessionStorage.getItem("urls")) {
  sessionStorage.removeItem("urls");
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.action) {
    case ACTION.INITIALIZE_FROM_POPUP: {
      const res = (await searchRoutesByPath(
        window.location.href.replace(/\/$/, "")
      )) as Route[];
      if (res)
        chrome.runtime.sendMessage({
          action: ACTION.INITIALIZE_FROM_CONTENT,
          value: res[0],
        });
      break;
    }
    case ACTION.REQUEST_COMPLETED_FROM_DEVTOOLS:
      setApiRoutesToStorage(request.urls);
      break;
    case ACTION.OPEN_IN_EDITOR:
      openInEditor(request.value);
      break;
    case ACTION.SAVE_ROUTES_FROM_POPUP:
      const routes = normalizeRoutes(request.value);
      addRoutes(routes);
      break;
    case ACTION.GET_API_ROUTES_FROM_POPUP: {
      if (sessionStorage.getItem("urls")) {
        const urls = sessionStorage.getItem("urls");
        const parsedUrls = urls && JSON.parse(urls);
        sendResponse(parsedUrls);
      }
      break;
    }
    default:
      break;
  }
});
