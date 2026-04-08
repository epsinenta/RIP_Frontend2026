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

export function fallbackImageUrl(): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect width="100%" height="100%" fill="#e8e8ec"/></svg>',
    )
  );
}

export function resolveMediaUrl(key: string): string {
  if (!key) return fallbackImageUrl();
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:") ||
    key.startsWith("data:")
  ) {
    return key;
  }
  return fallbackImageUrl();
}
