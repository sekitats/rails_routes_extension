import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ACTION } from "./constants";
import { createPath } from "./path";

const root = createRoot(document.getElementById("root")!);

interface Route {
  method: string;
  path: string;
  controller: string;
}
interface Params {
  action: string;
  value?: Route | string;
}

type Props = {
  paths: string[];
  onClickPath: (path: string) => void;
};
const PathList = (props: Props) => {
  const { paths, onClickPath } = props;
  if (paths.length <= 0) return null;
  return (
    <ul>
      {paths.map((path) => (
        <li>
          <a
            href={path}
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

const App = () => {
  const [isShown, toggleTextarea] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const [apiPaths, setApiPaths] = useState<string[]>([]);
  const [controllerPaths, setControllerPaths] = useState<string[]>([]);
  const [viewPaths, setViewPaths] = useState<string[]>([]);

  const sendMessageToContent = async (
    params: Params
  ): Promise<Route[] | string> => {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    const response = await chrome.tabs.sendMessage(tab.id!, params);
    return response;
  };

  useEffect(() => {
    (async () => {
      await sendMessageToContent({ action: ACTION.INITIALIZE_FROM_POPUP });

      const response = await sendMessageToContent({
        action: ACTION.GET_API_ROUTES_FROM_POPUP,
      });
      if (response) {
        const paths = (response as Route[]).map((res) =>
          createPath("api", res.controller)
        );
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

  const handleClickSave = () => {
    if (!textareaValue) return;
    // TODO: 保存処理
    window.close();
  };

  return (
    <div className="wrapper">
      <div className="header">
        <h1>rails routes</h1>
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
              paths={controllerPaths}
              onClickPath={(path) => {
                sendMessageToContent({
                  action: ACTION.OPEN_IN_EDITOR,
                  value: path,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

root.render(<App />);
