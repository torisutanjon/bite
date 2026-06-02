import type { ReactElement } from "react";
import Link from "next/link";
import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import NavSearch from "./NavSearch";
import NavLinks from "./NavLinks";

function LocationPinIcon(): ReactElement {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function CartIcon(): ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon(): ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function DashboardNavbar(): ReactElement {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <Container size="4">
        <Flex align="center" gap="4" className="h-16 px-4">
          {/* Logo + Location */}
          <Flex align="center" gap="3" className="flex-shrink-0">
            <Link href="/">
              <Text size="4" weight="bold" className="text-brand">
                BiteDash
              </Text>
            </Link>
            <Flex
              align="center"
              gap="1"
              className="cursor-pointer text-gray-600 hover:text-foreground transition-colors hidden sm:flex"
            >
              <Box className="text-brand">
                <LocationPinIcon />
              </Box>
              <Text size="1" weight="medium" className="text-gray-700 whitespace-nowrap">
                22118 Baker St, London
              </Text>
              <ChevronDownIcon className="text-gray-400" width="12" height="12" />
            </Flex>
          </Flex>

          {/* Search — flex-1 */}
          <NavSearch />

          {/* Nav links */}
          <Flex gap="3" align="center" className="flex-shrink-0">
            <NavLinks />
          </Flex>

          {/* Cart + User */}
          <Flex gap="3" align="center" className="flex-shrink-0">
            <Link
              href="/cart"
              className="relative text-gray-600 hover:text-brand transition-colors"
              aria-label="Cart, 1 item"
            >
              <CartIcon />
              <Flex
                align="center"
                justify="center"
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand rounded-full"
              >
                <Text className="text-white font-bold" style={{ fontSize: "9px", lineHeight: 1 }}>
                  1
                </Text>
              </Flex>
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-brand transition-colors"
              aria-label="Profile"
            >
              <UserIcon />
            </Link>
          </Flex>
        </Flex>
      </Container>
    </header>
  );
}
