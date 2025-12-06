// src/api/youtubeApi.js
import apiClient from "./apiClient";

/**
 * Call backend to get chapters for a YouTube URL.
 * Returns the JSON from the Express controller:
 * { hasChapters: boolean, chapters: [...] }
 */
export async function fetchYoutubeChapters(url) {
  if (!url || typeof url !== "string") {
    throw new Error("A valid YouTube URL is required");
  }

  const response = await apiClient.post("/youtube/chapters", { url });
  return response.data;
}


/**
 * Download a YouTube video as MP3 (whole video) and save metadata in DB.
 *
 * @param {Object} params
 * @param {string} params.videoId
 * @param {string} params.alias
 * @param {number|null} [params.categoryId]
 * @param {number|null} [params.projectId]
 */
export async function downloadVideoMp3({ videoId, alias, categoryId = null, projectId = null }) {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("A valid videoId is required");
  }
  if (!alias || typeof alias !== "string") {
    throw new Error("A valid alias is required");
  }

  const payload = {
    videoId,
    options: {
      alias,
      categoryId,
      projectId,
    },
  };

  const response = await apiClient.post("youtube/video/download-mp3", payload);
  return response.data;
}

/**
 * Download specific chapters as MP3s and save them in the DB.
 *
 * @param {Object} params
 * @param {string} params.videoId
 * @param {Array}  params.chapters   // [{ id, title, start, end, alias }, ...]
 * @param {string|null} [params.categoryId]
 * @param {string|null} [params.projectId]
 */
export async function downloadChaptersMp3({
  videoId,
  chapters,
  categoryId = null,
  projectId = null,
}) {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("A valid videoId is required");
  }
  if (!Array.isArray(chapters) || chapters.length === 0) {
    throw new Error("At least one chapter is required");
  }

  const payload = {
    videoId,
    payload: {
      chapters: chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        start: ch.start,
        end: ch.end,
        alias: ch.alias,
      })),
      categoryId,
      projectId,
    },
  };

  const res = await apiClient.post("youtube/chapters/download-mp3", payload);
  return res.data;
}