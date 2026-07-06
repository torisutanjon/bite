"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

const links = [
  { href: "/stores", label: "Stores" },
  { href: "/orders", label: "Orders" },
  { href: "/offers", label: "Offers" },
];

export default function MobileNav(): ReactElement {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          color="gray"
          aria-label="Open menu"
          className="sm:hidden"
        >
          <HamburgerMenuIcon width="20" height="20" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {links.map((link) => (
          <DropdownMenu.Item key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
