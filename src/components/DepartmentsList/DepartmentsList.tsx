import "./DepartmentsList.css";
import DepartmentCard from "../DepartmentCard/DepartmentCard";
import { type Department } from "../../modules/departmentsApi";

export default function DepartmentsList({ departments }: { departments: Department[] }) {
  return (
    <div className="container">
      {departments.map((department) => (
        <DepartmentCard key={department.department_id} department={department} />
      ))}
    </div>
  );
}
