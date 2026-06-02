import type { ReactNode, ReactElement } from "react";
import DashboardNavbar from "@/app/components/layout/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <>
      <DashboardNavbar />
      {children}
    </>
  );
}
