import {
  type Department,
  type DepartmentApplicationCart,
  type DepartmentApplicationDetailResponse,
} from "./departmentsApi";
import accountingPhoto from "../assets/accounting.jpg";
import accountingVideo from "../assets/accounting.mp4";
import hrPhoto from "../assets/hr_department.jpg";
import hrVideo from "../assets/hr_department.mp4";
import itPhoto from "../assets/it_department.jpg";
import itVideo from "../assets/it_department.mp4";
import procurementPhoto from "../assets/procurement.jpg";
import procurementVideo from "../assets/procurement.mp4";

export const DEPARTMENTS_MOCK: Department[] = [
  {
    department_id: 1,
    is_deleted: false,
    title: "Отдел разработки ПО",
    description:
      "Разработка и сопровождение внутренних информационных систем. Оклады руководителей и ведущих специалистов согласуются в заявках на изменение структуры.",
    photo_url: itPhoto,
    employee_count: 42,
    head: "Иванов И.И.",
    reports_to: "Директор по ИТ",
    video: itVideo,
    short_description: "Backend, frontend, DevOps и тестирование.",
  },
  {
    department_id: 2,
    is_deleted: false,
    title: "Отдел продаж",
    description:
      "Работа с корпоративными клиентами и партнёрами. Премии и фиксированная часть зарплаты отражаются в кадровых заявках.",
    photo_url: procurementPhoto,
    employee_count: 28,
    head: "Петрова А.С.",
    reports_to: "Коммерческий директор",
    video: procurementVideo,
    short_description: "B2B-продажи, сопровождение сделок.",
  },
  {
    department_id: 3,
    is_deleted: false,
    title: "HR и обучение",
    description:
      "Подбор персонала, адаптация и корпоративное обучение. Ведётся учёт штатных единиц и бюджета ФОТ по отделам.",
    photo_url: hrPhoto,
    employee_count: 12,
    head: "Сидорова Е.В.",
    reports_to: "Генеральный директор",
    video: hrVideo,
    short_description: "Кадровый учёт и развитие сотрудников.",
  },
  {
    department_id: 4,
    is_deleted: false,
    title: "Финансовый отдел",
    description:
      "Учёт, планирование и отчётность. Контроль выплат по зарплате и налогам в разрезе департаментов.",
    photo_url: accountingPhoto,
    employee_count: 15,
    head: "Козлов Д.П.",
    reports_to: "Финансовый директор",
    video: accountingVideo,
    short_description: "Бюджетирование и контроль затрат.",
  },
];

export const MOCK_CART: DepartmentApplicationCart = {
  has_draft: true,
  departments_count: 2,
  incomplete_items_count: 0,
  id: 1,
};

export function getMockDepartment(id: number): Department | undefined {
  return DEPARTMENTS_MOCK.find((d) => d.department_id === id);
}

export function filterMockDepartmentsByTitle(title: string): Department[] {
  const t = title.trim().toLowerCase();
  if (!t) return [...DEPARTMENTS_MOCK];
  return DEPARTMENTS_MOCK.filter((d) => d.title.toLowerCase().includes(t));
}

export async function addDepartmentToMockApplication(
  departmentId: number,
): Promise<{ ok: true } | { ok: false; message?: string }> {
  void departmentId;
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true };
}

export const MOCK_APPLICATION_DETAIL: DepartmentApplicationDetailResponse = {
  department_application: {
    department_application_id: 1,
    status: "draft",
    created_at: new Date().toISOString(),
    creator_login: "demo",
    incomplete_items_count: 0,
  },
  items: [
    {
      department_application_id: 1,
      department_id: 1,
      sort_order: 1,
      role: "Головной",
      salary: 250000,
    },
    {
      department_application_id: 1,
      department_id: 2,
      main_department_id: 1,
      sort_order: 2,
      role: "Подчинённый",
      salary: 180000,
    },
  ],
};
