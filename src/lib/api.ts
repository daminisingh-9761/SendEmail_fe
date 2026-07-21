import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mailjob_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const authApi = {
  googleLogin: (payload: { id_token?: string; code?: string }) =>
    api.post("/auth/google", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};


export const resumeApi = {
  list: () => api.get("/resumes").then((r) => r.data),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post("/resumes", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  setDefault: (id: string) => api.patch(`/resumes/${id}/default`).then((r) => r.data),
};


export const jobApi = {
  extract: (payload: { type: "text" | "file" | "url"; text?: string; url?: string; file?: File }) => {
    if (payload.type === "file" && payload.file) {
      const form = new FormData();
      form.append("file", payload.file);
      return api.post("/jobs/extract-file", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data);
    }
    return api.post("/jobs/extract", payload).then((r) => r.data);
  },
  generateEmail: (payload: { jobId: string; resumeId?: string }) =>
    api.post("/jobs/generate-email", payload).then((r) => r.data),
};


export const applicationApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) => 
    api.get("/applications", { params }).then((r) => r.data),
  bulkDelete: (ids: string[]) => 
    api.delete("/applications", { data: { ids } }).then((r) => r.data),
  get: (id: string) => api.get(`/applications/${id}`).then((r) => r.data),
  send: (id: string, payload: { recipientEmail: string; subject: string; body: string }) =>
    api.post(`/applications/${id}/send`, payload).then((r) => r.data),
  resend: (id: string) => api.post(`/applications/${id}/resend`).then((r) => r.data),
  followUp: (id: string) => api.post(`/applications/${id}/follow-up`).then((r) => r.data),
  regenerate: (id: string) => api.post(`/applications/${id}/regenerate`).then((r) => r.data),
  edit: (id: string, payload: { instruction: string }) => api.post(`/applications/${id}/edit`, payload).then((r) => r.data),
};
