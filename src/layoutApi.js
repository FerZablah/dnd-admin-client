import { collectFilesFromLayout } from "./layoutFiles";

export async function uploadLayout(layout, projectName) {
  const formData = new FormData();

  // 1) Serialize layout but remove the file references
  const layoutJson = JSON.stringify(layout, (key, value) => {
    if (key === "imageFile" || key === "bgVideoFile" || key === "videoFile") {
      return undefined; // File cannot go in JSON
    }
    return value;
  });

  formData.append("layout", layoutJson);
  formData.append("projectName", projectName)
  // 2) Collect files and map them to field paths
  const files = collectFilesFromLayout(layout);

  files.forEach(({ fieldPath, file }) => {
    const fieldName = `file:${fieldPath}`; // e.g. file:columns[0].rows[0].content.imgSrc
    formData.append(fieldName, file);
  });

  // 3) Send to backend
  const res = await fetch("http://localhost:3000/layouts", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to upload layout");
  }

  return data;
}
