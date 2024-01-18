import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ACTION } from "./constants";
import { createPath } from "./path";
import { Route } from "./store";

// @ts-ignore
const domain = DOMAIN_NAME || "http://localhost:3000";
const root = createRoot(document.getElementById("root")!);

interface Props {
  paths: string[];
  onClickPath: (path: string) => void;
}
const PathList: React.FC<Props> = (props) => {
  const { paths, onClickPath } = props;
  if (paths.length <= 0) return null;
  return (
    <ul>
      {paths.map((path) => (
        <li key={path}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault;
              onClickPath(path);
            }}
          >
            {path}
          </a>
        </li>
      ))}
    </ul>
  );
};

interface Params {
  action: string;
  value?: string;
}
const sendMessageToContent = async (
  params: Params
): Promise<Route[] | string> => {
  const [tab] = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  const res = await chrome.tabs.sendMessage(tab.id!, params);
  return res;
};

const App: React.FC = () => {
  const [isShown, toggleTextarea] = useState<boolean>(false);
  const [textareaValue, setTextareaValue] = useState<string>("");
  const [apiPaths, setApiPaths] = useState<string[]>([]);
  const [controllerPaths, setControllerPaths] = useState<string[]>([]);
  const [viewPaths, setViewPaths] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      await sendMessageToContent({ action: ACTION.INITIALIZE_FROM_POPUP });

      const res = (await sendMessageToContent({
        action: ACTION.GET_API_ROUTES_FROM_POPUP,
      })) as Route[];
      if (res) {
        const paths = res.map((res) => createPath("api", res.controller));
        setApiPaths(paths);
      }
    })();

    chrome.runtime.onMessage.addListener(({ action, value }) => {
      if (action === ACTION.INITIALIZE_FROM_CONTENT) {
        const controller = createPath("controller", value.controller);
        const view = createPath("view", value.controller);
        if (controller) setControllerPaths([controller]);
        if (view) setViewPaths([view]);
      }
    });
  }, []);

  const handleClickConfig = () => {
    toggleTextarea(!isShown);
  };

  const handleChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleClickSave = async () => {
    if (!textareaValue) return;
    await sendMessageToContent({
      action: ACTION.SAVE_ROUTES_FROM_POPUP,
      value: textareaValue,
    });
    window.close();
  };

  return (
    <div className="wrapper">
      <div className="header">
        <h1>Open In Editor</h1>
        <a
          className="config"
          href="#"
          style={{ textAlign: "right", display: "block" }}
          onClick={handleClickConfig}
        >
          設定
        </a>
      </div>
      {isShown ? (
        <div className="textarea__wrapper">
          <textarea
            className="textarea"
            value={textareaValue}
            placeholder="Paste Rails routes here."
            onChange={handleChangeTextarea}
          ></textarea>
          <button className="button__save" onClick={handleClickSave}>
            保存
          </button>
        </div>
      ) : (
        <div>
          <div className="api__wrapper">
            {apiPaths.length > 0 && <p>api controller</p>}
            <PathList
              paths={apiPaths}
              onClickPath={(path) => {
                sendMessageToContent({
                  action: ACTION.OPEN_IN_EDITOR,
                  value: path,
                });
              }}
            />
          </div>
          <div className="controller__wrapper">
            {controllerPaths.length > 0 && <p>controller</p>}
            <PathList
              paths={controllerPaths}
              onClickPath={(path) => {
                sendMessageToContent({
                  action: ACTION.OPEN_IN_EDITOR,
                  value: path,
                });
              }}
            />
          </div>
          <div className="view__wrapper">
            {viewPaths.length > 0 && <p>view</p>}
            <PathList
              paths={viewPaths}
              onClickPath={(path) => {
                sendMessageToContent({
                  action: ACTION.OPEN_IN_EDITOR,
                  value: path,
                });
              }}
            />
          </div>
          <hr />
          <div className="link">
            <a href={domain + "rails/info/routes"} target="_blank">
              Rails routes
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

root.render(<App />);
