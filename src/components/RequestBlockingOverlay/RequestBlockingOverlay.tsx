import { Spinner } from "react-bootstrap";
import "./RequestBlockingOverlay.css";

export default function RequestBlockingOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="request-blocking-overlay" aria-busy="true" aria-live="polite">
      <Spinner animation="border" role="presentation" />
    </div>
  );
}
