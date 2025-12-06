// src/api/metaApi.js
import apiClient from "./apiClient";

export async function fetchCategories() {
  const res = await apiClient.get("/categories");
  return res.data.items; // [{ id, name }, ...]
}