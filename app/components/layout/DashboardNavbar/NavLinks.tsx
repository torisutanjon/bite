"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Text } from "@radix-ui/themes";

const NAV_LINKS = [
  { href: "/stores", label: "Browse" },
  { href: "/orders", label: "Orders" },
  { href: "/offers", label: "Offers" },
] as const;

export default function NavLinks(): ReactElement {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center h-16 border-b-2 px-1 transition-colors ${
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-gray-600 hover:text-foreground"
            }`}
          >
            <Text size="2" weight={isActive ? "bold" : "medium"}>
              {label}
            </Text>
          </Link>
        );
      })}
    </>
  );
}
