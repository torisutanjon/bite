import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Flex, Separator, Text } from "@radix-ui/themes";

function PersonIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function LockIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function AddressIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function CardIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
    </svg>
  );
}

function BellIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

export type SettingsPage =
  | "profile"
  | "security"
  | "addresses"
  | "payments"
  | "notifications";

const navItems: Array<{
  id: SettingsPage;
  label: string;
  href: string;
  Icon: () => ReactElement;
}> = [
  { id: "profile", label: "Profile", href: "/profile", Icon: PersonIcon },
  {
    id: "security",
    label: "Security",
    href: "/profile/security",
    Icon: LockIcon,
  },
  {
    id: "addresses",
    label: "Addresses",
    href: "/profile/addresses",
    Icon: AddressIcon,
  },
  {
    id: "payments",
    label: "Payments",
    href: "/profile/payments",
    Icon: CardIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/profile/notifications",
    Icon: BellIcon,
  },
];

export default function SettingsSidebar({
  activePage,
}: {
  activePage: SettingsPage;
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
            src="https://picsum.photos/seed/alexchenprofile/100/100"
            alt="Alex Chen"
            fill
            className="object-cover"
          />
        </Box>
        <Box className="text-center">
          <Text size="1" className="text-neutral block">
            Welcome Back,
          </Text>
          <Text size="2" weight="bold" className="text-brand block">
            Alex Chen
          </Text>
        </Box>
      </Flex>

      <Separator size="4" mb="3" />

      {/* Navigation */}
      <Flex direction="column" gap="1">
        {navItems.map(({ id, label, href, Icon }) => {
          const isActive = id === activePage;
          return (
            <Link key={id} href={href} className="no-underline">
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
                  <Icon />
                </Box>
                <Text size="2" weight={isActive ? "bold" : "regular"}>
                  {label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Flex>
  );
}
