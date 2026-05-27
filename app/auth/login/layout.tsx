import type { ReactElement, ReactNode } from "react";

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
