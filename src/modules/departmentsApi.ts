const MINIO_PUBLIC_BASE =
  (import.meta.env.VITE_MINIO_PUBLIC_BASE?.replace(/\/$/, "") as string | undefined) ??
  "http://localhost:9000/test";

export interface Department {
  department_id: number;
  is_deleted: boolean;
  title: string;
  description: string;
  photo_url: string;
  employee_count: number;
  head: string;
  reports_to: string;
  video: string;
  short_description: string;
}

export interface DepartmentApplicationCart {
  has_draft: boolean;
  departments_count: number;
  incomplete_items_count?: number;
  id?: number;
}

export interface DepartmentApplicationJSON {
  department_application_id: number;
  status: string;
  created_at: string;
  creator_login: string;
  moderator_login?: string | null;
  forming_date?: string | null;
  finish_date?: string | null;
  title?: string | null;
  incomplete_items_count: number;
}

export interface DepartmentApplicationItemJSON {
  department_application_id: number;
  department_id: number;
  main_department_id?: number | null;
  sort_order: number;
  role: string;
  salary?: number | null;
}

export interface DepartmentApplicationDetailResponse {
  department_application: DepartmentApplicationJSON;
  items: DepartmentApplicationItemJSON[];
}

export function objectUrlFromKey(key: string): string {
  if (!key) return "";
  return `${MINIO_PUBLIC_BASE}/${key.replace(/^\//, "")}`;
}

export function fallbackImageUrl(): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="100%" height="100%" fill="#e8e8ec"/></svg>',
    )
  );
}

export async function getDepartmentApplicationCart(): Promise<DepartmentApplicationCart> {
  try {
    const res = await fetch("/api/department_application/department_application-cart", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { has_draft: false, departments_count: 0 };
  }
}

export async function getDepartmentApplication(
  id: number,
): Promise<DepartmentApplicationDetailResponse | null> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`/api/department_application/${id}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function listDepartments(params?: { title?: string }): Promise<Department[]> {
  try {
    let path = "/api/departments";
    if (params?.title) {
      const q = new URLSearchParams();
      q.append("Title", params.title);
      path += `?${q.toString()}`;
    }
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getDepartment(id: number): Promise<Department | null> {
  try {
    const res = await fetch(`/api/department/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function addDepartmentToApplication(
  departmentId: number,
): Promise<{ ok: true } | { ok: false; status: number; message?: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { ok: false, status: 401, message: "Войдите в систему, чтобы добавить отдел в заявку." };
  }
  try {
    const res = await fetch(`/api/dep_app_dep/add/${departmentId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok || res.status === 201) return { ok: true };
    let message: string | undefined;
    try {
      const j = (await res.json()) as { error?: string; message?: string };
      message = j.error ?? j.message;
    } catch {
      message = await res.text();
    }
    return { ok: false, status: res.status, message: message || `HTTP ${res.status}` };
  } catch {
    return { ok: false, status: 0, message: "Не удалось выполнить запрос." };
  }
}

export async function editDepartmentInApplication(
  departmentId: number,
  applicationId: number,
  body: {
    direction?: "up" | "down";
    role?: string;
    sort_order?: number;
    salary?: number | null;
  },
): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const res = await fetch(`/api/dep_app_dep/${departmentId}/${applicationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteDepartmentApplication(applicationId: number): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const res = await fetch(
      `/api/department_application/${applicationId}/delete-department_application`,
      {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
