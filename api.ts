const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Request failed");
  return body;
}

export const api = {
  sessions: () => request("/sessions"),
  session: (id: string) => request(`/sessions/${id}`),
  createSession: () => request("/sessions", { method: "POST" }),
  demoData: (id: string) => request(`/sessions/${id}/demo-data`, { method: "POST" }),
  upload: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/sessions/${id}/upload`, { method: "POST", body: form });
  },
  ask: (id: string, question: string) =>
    request(`/sessions/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    })
};
