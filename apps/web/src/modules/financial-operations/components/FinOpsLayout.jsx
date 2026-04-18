import { Outlet } from "react-router-dom";
import OfflineBanner from "@/modules/financial-operations/components/OfflineBanner";

export default function FinOpsLayout() {
  return (
    <div className="flex flex-col min-h-0 min-w-0">
      <div className="mb-4 empty:hidden flex-none">
        <OfflineBanner />
      </div>
      <div className="flex-1 min-h-0 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
