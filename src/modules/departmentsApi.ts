import { publicApiAxios } from "./apiAxios";

function resolveMinioBase(): string {
  const runtime =
    (typeof window !== "undefined" &&
    "__RUNTIME_MINIO_BASE__" in window &&
    typeof (window as Window & { __RUNTIME_MINIO_BASE__?: string }).__RUNTIME_MINIO_BASE__ === "string"
      ? (window as Window & { __RUNTIME_MINIO_BASE__?: string }).__RUNTIME_MINIO_BASE__
      : "") || "";
  const env = (import.meta.env.VITE_MINIO_PUBLIC_BASE as string | undefined) ?? "";
  return (runtime || env).replace(/\/$/, "") || "http://localhost:9000/test";
}

const MINIO_PUBLIC_BASE = resolveMinioBase();

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
  short_description_en?: string;
}

export function departmentClipDescription(d: Department): string {
  const en = d.short_description_en?.trim();
  if (en) return en;
  return "Corporate department unit.";
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

export async function listDepartments(params?: { title?: string }): Promise<Department[]> {
  try {
    const r = await publicApiAxios.get<Department[]>("/departments", {
      params: params?.title ? { Title: params.title } : undefined,
      headers: { Accept: "application/json" },
    });
    return r.data ?? [];
  } catch {
    return [];
  }
}

export async function getDepartment(id: number): Promise<Department | null> {
  try {
    const r = await publicApiAxios.get<Department>(`/department/${id}`, {
      headers: { Accept: "application/json" },
    });
    return r.data ?? null;
  } catch {
    return null;
  }
}
