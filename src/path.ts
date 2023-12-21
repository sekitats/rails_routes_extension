// @ts-ignore
if (!PROJECT_PATH) {
  throw new Error("PROJECT_PATH is not defined");
}
// @ts-ignore
const projectRoot = PROJECT_PATH;
const VSCODE_PATH = "vscode://file";
const PAGES_PATH = "app/javascript/packs/components/pages";
const API_V1_PATH = "app/controllers/api/v1";
const CONTROLLER_PATH = "app/controllers";
const VIEWS_PATH = "app/views";

export const createPath = (
  fileType: string,
  queryResult: { controller: string }
) => {
  const { controller } = queryResult;

  if (fileType === "api") {
    const path =
      VSCODE_PATH +
      projectRoot +
      API_V1_PATH +
      controller.split("#")[0] +
      `_controller.rb`;
    return path;
  } else if (fileType === "controller") {
    const path =
      VSCODE_PATH +
      projectRoot +
      CONTROLLER_PATH +
      controller.split("#")[0] +
      `_controller.rb`;
    return path;
  } else if (fileType === "view" || fileType === "vue") {
    const newUI = controller.match(/ui\/(.*)/);

    const [fileName, action] = (newUI?.[1] ?? controller).split("#");
    const path = newUI
      ? projectRoot + PAGES_PATH + fileName + `/${action}.vue`
      : projectRoot + VIEWS_PATH + fileName + `/${action}.html.slim`;

    return VSCODE_PATH + path;
  }
};
