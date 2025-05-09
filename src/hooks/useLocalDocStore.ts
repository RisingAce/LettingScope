import { useCallback } from "react";
import { set, get, del, keys, update } from "idb-keyval";

export interface LocalDocMeta {
  key: string;
  name: string;
  date: string;
}

export function useLocalDocStore() {
  // Save a file
  const saveDoc = useCallback(async (file: File) => {
    const key = `doc-${Date.now()}-${file.name}`;
    await set(key, file);
    return key;
  }, []);

  // Get a file by key
  const getDoc = useCallback(async (key: string): Promise<Blob | undefined> => {
    return await get(key);
  }, []);

  // List all docs (returns meta info, not blobs)
  const listDocs = useCallback(async (): Promise<LocalDocMeta[]> => {
    const allKeys = await keys();
    return allKeys
      .filter((k) => typeof k === "string" && k.startsWith("doc-"))
      .map((k) => {
        const [_, date, ...nameParts] = (k as string).split("-");
        return {
          key: k as string,
          name: nameParts.join("-"),
          date: new Date(Number(date)).toLocaleString(),
        };
      });
  }, []);

  // Delete a file
  const deleteDoc = useCallback(async (key: string) => {
    await del(key);
  }, []);

  // Clear all docs
  const clearAllDocs = useCallback(async () => {
    const allKeys = await keys();
    await Promise.all(
      allKeys.filter((k) => typeof k === "string" && k.startsWith("doc-")).map((k) => del(k))
    );
  }, []);

  // Get a preview URL for a blob
  const getPreviewUrl = useCallback((blob: Blob) => {
    return URL.createObjectURL(blob);
  }, []);

  return {
    saveDoc,
    getDoc,
    listDocs,
    deleteDoc,
    clearAllDocs,
    getPreviewUrl,
  };
}
