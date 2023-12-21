const INDEXED_DB_NAME = "routes_db";
const STORE_NAME = "routes";
const request = indexedDB.open(INDEXED_DB_NAME, 1);

request.onupgradeneeded = function (event: any) {
  const db = event.target.result;

  // 既存のストアがあれば削除
  if (db.objectStoreNames.contains("routes")) {
    db.deleteObjectStore("routes");
  }

  // 新しいストアを作成
  const objectStore = db.createObjectStore(STORE_NAME, {
    keyPath: "id",
    autoIncrement: true,
  });
  objectStore.createIndex("method", "method", { unique: false });
  objectStore.createIndex("path", "path", { unique: false });
  objectStore.createIndex("controller", "controller", { unique: false });
};

export const queryByPath = async (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    let queryResult: string[] = [];

    const database = request.result;
    const transaction = database.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index("path");

    let query = path.replace(/https?:\/\/[^/]+/, "").replace(/\?.+/, "");

    if (query.match(/\d+/g)) {
      query = query.replace(/\d+/g, ":id");
    }

    console.log("query:", query);

    const keyRange = IDBKeyRange.only(query);

    const cursorRequest = index.openCursor(keyRange);

    cursorRequest.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        // マッチしたデータが見つかった場合の処理
        console.log("Matched route:", cursor.value);
        if (cursor.value) {
          if (cursor.value.method.match(/(POST|PATCH|PUT|DELETE)/)) {
            // do nothing
          } else {
            queryResult.push(cursor.value);
          }
        }
        cursor.continue(); // 次のデータを検索
      } else {
        // マッチするデータがもうない場合の処理
        console.log("No more matching routes.");
      }
      console.log("resolved");

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
  const database = request.result;
  const transaction = database.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  routes.forEach((route) => {
    store.add(route);
  });

  request.onsuccess = function () {
    console.log("Route added successfully");
  };

  request.onerror = function (event: any) {
    console.error("Error adding route: " + event.target.errorCode);
  };
};