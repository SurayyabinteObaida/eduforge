const BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("eduforge_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Auth ─────────────────────────────────────────────────
export const api = {
  auth: {
    login: (email, password) =>
      request("/api/auth/login", { method: "POST", body: { email, password } }),
    me: () => request("/api/auth/me"),
  },

  // ─── Courses ────────────────────────────────────────────
  courses: {
    list: () => request("/api/courses"),
    create: (data) => request("/api/courses", { method: "POST", body: data }),
    update: (id, data) => request(`/api/courses/${id}`, { method: "PATCH", body: data }),
    delete: (id) => request(`/api/courses/${id}`, { method: "DELETE" }),

    // Modules
    createModule: (courseId, data) =>
      request(`/api/courses/${courseId}/modules`, { method: "POST", body: data }),
    updateModule: (courseId, moduleId, data) =>
      request(`/api/courses/${courseId}/modules/${moduleId}`, { method: "PATCH", body: data }),
    deleteModule: (courseId, moduleId) =>
      request(`/api/courses/${courseId}/modules/${moduleId}`, { method: "DELETE" }),

    // Lessons
    createLesson: (courseId, moduleId, data) =>
      request(`/api/courses/${courseId}/modules/${moduleId}/lessons`, { method: "POST", body: data }),
    updateLesson: (courseId, moduleId, lessonId, data) =>
      request(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteLesson: (courseId, moduleId, lessonId) =>
      request(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: "DELETE",
      }),
  },

  // ─── Lessons ────────────────────────────────────────────
  lessons: {
    get: (id) => request(`/api/lessons/${id}`),
    saveSlides: (id, data) =>
      request(`/api/lessons/${id}/slides`, { method: "PUT", body: { data } }),
    deleteSlides: (id) => request(`/api/lessons/${id}/slides`, { method: "DELETE" }),

    addResource: (id, data) =>
      request(`/api/lessons/${id}/resources`, { method: "POST", body: data }),
    updateResource: (lessonId, resourceId, data) =>
      request(`/api/lessons/${lessonId}/resources/${resourceId}`, { method: "PATCH", body: data }),
    deleteResource: (lessonId, resourceId) =>
      request(`/api/lessons/${lessonId}/resources/${resourceId}`, { method: "DELETE" }),
  },

  // ─── Students ───────────────────────────────────────────
  students: {
    list: () => request("/api/students"),
    create: (data) => request("/api/students", { method: "POST", body: data }),
    update: (id, data) => request(`/api/students/${id}`, { method: "PATCH", body: data }),
    delete: (id) => request(`/api/students/${id}`, { method: "DELETE" }),
    enroll: (id, courseId) =>
      request(`/api/students/${id}/enroll`, { method: "POST", body: { courseId } }),
    unenroll: (id, courseId) =>
      request(`/api/students/${id}/enroll/${courseId}`, { method: "DELETE" }),
  },

  // ─── AI ─────────────────────────────────────────────────
  ai: {
    generateSlides: (data) =>
      request("/api/ai/slides", { method: "POST", body: data }),
    suggestResources: (topic, courseContext) =>
      request("/api/ai/resources", { method: "POST", body: { topic, courseContext } }),
    generateVisualizer: (data) =>
      request("/api/ai/visualizer", { method: "POST", body: data }),
  },
};
