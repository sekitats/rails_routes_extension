const INDEXED_DB_NAME = "routes_db";
const STORE_NAME = "routes";
let db: IDBDatabase;

let storedUrls: string[] = [];

function createDb() {
  const openReq = indexedDB.open(INDEXED_DB_NAME, 1);

  openReq.onupgradeneeded = function (event: IDBVersionChangeEvent) {
    console.log("onupgradeneeded");
  };

  openReq.onsuccess = function (event) {
    const target = event.target as IDBOpenDBRequest;
    db = target?.result as IDBDatabase;

    // 既存のストアがあれば削除
    if (db.objectStoreNames.contains(STORE_NAME)) {
      db.deleteObjectStore(STORE_NAME);
    }

    // 新しいストアを作成
    const objectStore = db.createObjectStore(STORE_NAME, {
      keyPath: "id",
      autoIncrement: true,
    });
    // objectStore.createIndex("method", "method", { unique: false });
    // objectStore.createIndex("path", "path", { unique: false });
    // objectStore.createIndex("controller", "controller", { unique: false });
  };

  openReq.onerror = function (event) {
    console.error("IndexedDBのオープンに失敗しました。");
  };
}

createDb();

export const searchRoutesByPath = async (path: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    let queryResult: string[] = [];

    const transaction = db.transaction([STORE_NAME], "readonly");
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

/*
 * add Routes
 */
export const addRoutes = (
  routes: {
    method: string;
    path: string;
    rest: string[];
    controller: string;
  }[]
) => {
  const openReq = indexedDB.open(INDEXED_DB_NAME, 1);
  openReq.onsuccess = function (event) {
    const target = event.target as IDBOpenDBRequest;
    const db = target?.result as IDBDatabase;

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    routes.forEach((route) => {
      store.add(route);
    });
  };
};

export async function setApiRoutesToStorage(urls: string[]) {
  const uniqueUrls = Array.from(new Set(urls));
  const res = await Promise.all(
    uniqueUrls.map((url) => searchRoutesByPath(url))
  );
  storedUrls = [...storedUrls, ...res.flatMap((r) => r)];
  sessionStorage.setItem("urls", JSON.stringify(storedUrls));
}
