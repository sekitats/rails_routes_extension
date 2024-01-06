const capitalize = (filename: string) => {
  if (typeof filename !== "string") return filename;
  return (
    filename.charAt(0).toUpperCase() + filename.slice(1).toLocaleLowerCase()
  );
};

export const createPath = (fileType: string, queryResult: any): string => {
  let controller;
  if (typeof queryResult === "string") {
    controller = queryResult;
  } else {
    controller = queryResult.controller;
  }

  if (fileType === "api" || fileType === "controller") {
    return "app/controllers/" + controller.split("#")[0] + `_controller.rb`;
  } else {
    const newUI = controller.match(/ui\/(.*)/);
    const [fileName, action] = (newUI?.[1] ?? controller).split("#");
    return newUI
      ? "app/javascript/packs/components/pages/" +
          fileName +
          `/${capitalize(action)}.vue`
      : "app/views/" +
          fileName +
          // @ts-ignore
          `/${action}.html.${RUBY_TEMPLATE_ENGINE || "slim"}`;
  }
};

export const openInEditor = async (path: string) => {
  // @ts-ignore
  const port = DEV_SERVER_PORT || 3000;
  const url = `http://localhost:${port}/__open-in-editor?file=${path}`;
  await fetch(url);
};
