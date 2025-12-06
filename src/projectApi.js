// src/api/metaApi.js
import apiClient from "./apiClient";

export async function fetchProjects() {
  const res = await apiClient.get("/projects");
  return res.data.items; // [{ id, name }, ...]
}