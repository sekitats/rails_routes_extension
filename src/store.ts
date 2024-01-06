const INDEXED_DB_NAME = "routes_db";
const STORE_NAME = "routes";
const openReq = indexedDB.open(INDEXED_DB_NAME, 1);

let storedUrls: string[] = [];

export interface Route {
  method: string;
  path: string;
  controller: string;
}

openReq.onupgradeneeded = function (event: IDBVersionChangeEvent) {
  // 既存のストアがあれば削除
  // if (idb.objectStoreNames.contains(STORE_NAME)) {
  //   idb.deleteObjectStore(STORE_NAME);
  // }

  const target = event.target as IDBOpenDBRequest;
  const db = target?.result as IDBDatabase;

  // 新しいストアを作成
  const objectStore = db.createObjectStore(STORE_NAME, {
    keyPath: "id",
    autoIncrement: true,
  });
  objectStore.createIndex("path", "path", { unique: false });
};

export const searchRoutesByPath = async (path: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    let queryResult: string[] = [];

    const transaction = openReq.result.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index("path");

    let query = path.replace(/https?:\/\/[^/]+/, "").replace(/\?.+/, "");

    if (query.match(/\/(\d+)/g)) {
      query = query.replace(/\/(\d+)/g, "/:id");
    }

    const keyRange = IDBKeyRange.only(query);

    const cursorRequest = index.openCursor(keyRange);

    cursorRequest.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        // マッチしたデータが見つかった場合の処理
        console.log(
          "%cMatched route:",
          "color:#00d0aa;font-weight:bold;",
          cursor.value
        );
        if (cursor.value) {
          queryResult.push(cursor.value);
        }
        cursor.continue(); // 次のデータを検索
      } else {
        // マッチするデータがもうない場合の処理
        // console.log("No more matching routes.");
      }
      resolve(queryResult);
    };

    cursorRequest.onerror = function (event: any) {
      console.error("Error searching for route:", event.target.errorCode);
      reject();
    };
  });
};

const normalizePath = (originalPath: string): string => {
  // パス内のプレースホルダーを ":id" に統一し、formatプレースホルダーを削除する
  const normalizedPath = originalPath
    .replace(/:(?!format)[a-z_]+/g, ":id") // format以外のプレースホルダーを":id"に統一
    .replace(/\(\.:format\)/, ""); // (.format)を削除

  return normalizedPath;
};

export const normalizeRoutes = (value: string): Route[] => {
  const uppercaseLineRegex = /^\s+([A-Z]+)\s+(\S+)\s+(.+)/;
  const lowercaseLineRegex = /^\s+(\S+)\s+([A-Z]+)\s+(\S+)\s+(.+)/;
  const lines = value.split("\n").filter((l) => !!l);
  const routes = lines.map((line: string) => {
    if (line.match(uppercaseLineRegex)) {
      const match1 = line.match(uppercaseLineRegex);
      if (!match1) return undefined;
      let [, method, path, controller] = match1;
      return {
        method,
        path: normalizePath(path),
        controller: controller.replace(/\s{.*}/, ""),
      };
    } else if (line.match(lowercaseLineRegex)) {
      const match2 = line.match(lowercaseLineRegex);
      if (!match2) return undefined;
      let [, , method, path, controller] = match2;
      return {
        method,
        path: normalizePath(path),
        controller: controller.replace(/\s{.*}/, ""),
      };
    }
    return undefined;
  });

  return routes.filter(Boolean) as Route[];
};

/*
 * add Routes
 */
export const addRoutes = (routes: Route[]) => {
  const db = openReq.result;
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  routes.forEach((route) => {
    store.add(route);
  });
};

export async function setApiRoutesToStorage(urls: string[]) {
  const uniqueUrls = Array.from(new Set(urls));
  const res = await Promise.all(
    uniqueUrls.map((url) => searchRoutesByPath(url))
  );
  storedUrls = [...storedUrls, ...res.flatMap((r) => r)];
  sessionStorage.setItem("urls", JSON.stringify(storedUrls));
}
