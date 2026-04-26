import { useNavigate } from "react-router-dom";
import ErrorPage from "@/components/ui/ErrorPage";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      code={404}
      onPrimaryAction={() => navigate("/dashboard")}
      onSecondaryAction={() => navigate(-1)}
    />
  );
}
