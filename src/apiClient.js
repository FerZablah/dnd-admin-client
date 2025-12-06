// src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000", // adjust if your backend lives elsewhere
  timeout: 15000,
});

// Optional: add interceptors here (auth headers, logging, etc.)
// apiClient.interceptors.request.use((config) => {
//   return config;
// });

export default apiClient;
