import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Flex, Separator, Text } from "@radix-ui/themes";
import { HomeIcon } from "@radix-ui/react-icons";

function NavHistoryIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  );
}

function NavHeartIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function NavWalletIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

function NavSupportIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  );
}

export type NavPage = "home" | "orders" | "favorites" | "wallet" | "support";

const navItems: Array<{ id: NavPage; label: string; href: string }> = [
  { id: "home", label: "Home", href: "/" },
  { id: "orders", label: "Past Orders", href: "/orders" },
  { id: "favorites", label: "Favorites", href: "/favorites" },
  { id: "wallet", label: "Wallet", href: "/wallet" },
  { id: "support", label: "Support", href: "/support" },
];

function NavIcon({ id }: { id: NavPage }): ReactElement {
  if (id === "orders") return <NavHistoryIcon />;
  if (id === "favorites") return <NavHeartIcon />;
  if (id === "wallet") return <NavWalletIcon />;
  if (id === "support") return <NavSupportIcon />;
  return <HomeIcon width="16" height="16" />;
}

export default function AccountSidebar({
  activePage,
}: {
  activePage: NavPage;
}): ReactElement {
  return (
    <Flex
      direction="column"
      className="w-44 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20"
    >
      {/* User info */}
      <Flex direction="column" align="center" gap="2" mb="4">
        <Box className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src="https://picsum.photos/seed/bitedashprofile/100/100"
            alt="User profile"
            fill
            className="object-cover"
          />
        </Box>
        <Box className="text-center">
          <Text size="1" className="text-neutral block">
            Welcome Back,
          </Text>
          <Text size="2" weight="bold" className="text-foreground block">
            Ready to eat?
          </Text>
        </Box>
      </Flex>

      <Separator size="4" mb="3" />

      {/* Navigation */}
      <Flex direction="column" gap="1" className="flex-1">
        {navItems.map((item) => {
          const isActive = item.id === activePage;
          return (
            <Link key={item.id} href={item.href} className="no-underline">
              <Flex
                align="center"
                gap="2"
                className={`px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-neutral hover:bg-gray-50 hover:text-foreground"
                }`}
              >
                <Box className="flex-shrink-0">
                  <NavIcon id={item.id} />
                </Box>
                <Text size="2" weight={isActive ? "bold" : "regular"}>
                  {item.label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>

      <Separator size="4" mt="3" mb="3" />

      <Link href="/stores" className="block">
        <Button color="tomato" size="2" className="w-full rounded-full">
          Order Now
        </Button>
      </Link>
    </Flex>
  );
}
