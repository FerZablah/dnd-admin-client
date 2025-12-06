import React, { useEffect, useState } from "react";

function ProjectSelect({ value, onChange }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError("");

        // Change this URL if your backend is mounted under /api or another path
        const res = await fetch("http://localhost:3000/layouts/projects");
        if (!res.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await res.json();
        // data = { projects: ["Project A", "Project B", ...] }
        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
        setError("Error loading projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      <option value="" disabled>
        Select a project
      </option>
      {projects.map((projectName) => (
        <option key={projectName} value={projectName}>
          {projectName}
        </option>
      ))}
    </select>
  );
}

export default ProjectSelect;
