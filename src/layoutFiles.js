// layoutFiles.js

// Recursively collect { fieldPath, file } for all imageFile / bgVideoFile / videoFile
export function collectFilesFromLayout(layout) {
  const result = [];

  function walk(node, currentPath) {
    if (!node || typeof node !== "object") return;

    // Handle imageFile -> imgSrc
    if (node.imageFile instanceof File && currentPath) {
      const fieldPath = `${currentPath}.imgSrc`;
      result.push({ fieldPath, file: node.imageFile });
    }

    // Handle bgVideoFile -> bgVideoSrc
    if (node.bgVideoFile instanceof File && currentPath) {
      const fieldPath = `${currentPath}.bgVideoSrc`;
      result.push({ fieldPath, file: node.bgVideoFile });
    }

    // Handle videoFile -> videoSrc
    if (node.videoFile instanceof File && currentPath) {
      const fieldPath = `${currentPath}.videoSrc`;
      result.push({ fieldPath, file: node.videoFile });
    }

    // Recurse into children
    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        const childPath = currentPath
          ? `${currentPath}[${index}]`
          : `[${index}]`;
        walk(item, childPath);
      });
    } else {
      for (const key of Object.keys(node)) {
        // don't recurse into the file fields themselves
        if (key === "imageFile" || key === "bgVideoFile" || key === "videoFile") {
          continue;
        }

        const child = node[key];
        const childPath = currentPath ? `${currentPath}.${key}` : key;
        walk(child, childPath);
      }
    }
  }

  walk(layout, ""); // root
  return result;
}
