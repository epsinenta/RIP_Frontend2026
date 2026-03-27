import { type Department, type DepartmentApplicationDetailResponse } from "./departmentsApi";

export const DEPARTMENTS_MOCK: Department[] = [
  {
    department_id: 1,
    is_deleted: false,
    title: "Отдел разработки ПО",
    description:
      "Разработка и сопровождение внутренних информационных систем. Оклады руководителей и ведущих специалистов согласуются в заявках на изменение структуры.",
    photo_url: "huawei.jpg",
    employee_count: 42,
    head: "Иванов И.И.",
    reports_to: "Директор по ИТ",
    video: "dept-1.mp4",
    short_description: "Backend, frontend, DevOps и тестирование.",
  },
  {
    department_id: 2,
    is_deleted: false,
    title: "Отдел продаж",
    description:
      "Работа с корпоративными клиентами и партнёрами. Премии и фиксированная часть зарплаты отражаются в кадровых заявках.",
    photo_url: "phone.jpg",
    employee_count: 28,
    head: "Петрова А.С.",
    reports_to: "Коммерческий директор",
    video: "dept-2.mp4",
    short_description: "B2B-продажи, сопровождение сделок.",
  },
  {
    department_id: 3,
    is_deleted: false,
    title: "HR и обучение",
    description:
      "Подбор персонала, адаптация и корпоративное обучение. Ведётся учёт штатных единиц и бюджета ФОТ по отделам.",
    photo_url: "tefal.jpg",
    employee_count: 12,
    head: "Сидорова Е.В.",
    reports_to: "Генеральный директор",
    video: "dept-3.mp4",
    short_description: "Кадровый учёт и развитие сотрудников.",
  },
  {
    department_id: 4,
    is_deleted: false,
    title: "Финансовый отдел",
    description:
      "Учёт, планирование и отчётность. Контроль выплат по зарплате и налогам в разрезе департаментов.",
    photo_url: "krups.jpg",
    employee_count: 15,
    head: "Козлов Д.П.",
    reports_to: "Финансовый директор",
    video: "dept-4.mp4",
    short_description: "Бюджетирование и контроль затрат.",
  },
];

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
