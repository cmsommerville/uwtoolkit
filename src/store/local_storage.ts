import localforage from "localforage";

export const db = localforage.createInstance({
  name: "UW-Assignments",
  driver: localforage.INDEXEDDB,
  storeName: "uw_assignments",
});
