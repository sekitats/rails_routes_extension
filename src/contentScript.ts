import { queryByPath } from "./store";
import { createPath } from "./path";

async function searchApiController(urls: string[]) {}

async function storeApiRoutes(urls: string[]) {
  console.log("%cRequestsCompleted", "color:#00d0aa;font-weight:bold;", urls);
  // alert(urls.join(""));
  // await queryByPath();

  const res = await Promise.all(urls.flatMap((url) => queryByPath(url)));
  // console.log(res);

  // const routes = res.flat();
  // addRoutes(routes);
  sessionStorage.removeItem("urls");
  sessionStorage.setItem("urls", JSON.stringify(urls));
}

async function searchController() {
  const res = await queryByPath(window.location.href);
  if (res) {
    const path = createPath("controller", { controller: res[0] });
    window.location.assign(path);
  }
}

async function searchView() {
  const res = await queryByPath(window.location.href);
  if (res) {
    const path = createPath("view", { controller: res[0] });
    window.location.assign(path);
  }
}

function saveRoutes(value: any) {
  chrome.runtime.sendMessage({ action: "storeRoutes", value });
}

chrome.runtime.onMessage.addListener((request) => {
  switch (request.action) {
    case "RequestsCompleted":
      storeApiRoutes(request.urls);
      break;
    case "controller":
      searchController();
      break;
    case "view":
      searchView();
      break;
    case "storeRoutes":
      saveRoutes(request.value);
      break;
    default:
      break;
  }
});
