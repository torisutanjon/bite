import type { ReactElement } from "react";
import Link from "next/link";
import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";
import { UserIcon } from "@/app/components/ui/icons";

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

export default function Navbar(): ReactElement {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <Container size="4">
        <Flex align="center" justify="between" className="h-16 px-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Text size="5" weight="bold" className="text-brand">
              BiteDash
            </Text>
          </Link>

          {/* Nav Links */}
          <Flex gap="1" align="center">
            <Link
              href="/stores"
              className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Text size="2" weight="medium" className="text-gray-700">
                Stores
              </Text>
            </Link>
            <Box className="h-4 w-px bg-gray-200" />
            <Link
              href="/orders"
              className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Text size="2" weight="medium" className="text-gray-700">
                Orders
              </Text>
            </Link>
            <Box className="h-4 w-px bg-gray-200" />
            <Link
              href="/offers"
              className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Text size="2" weight="medium" className="text-gray-700">
                Offers
              </Text>
            </Link>
          </Flex>

          {/* Actions */}
          <Flex gap="3" align="center">
            <Link
              href="/cart"
              className="flex items-center text-gray-600 hover:text-brand transition-colors"
              aria-label="Cart"
            >
              <CartIcon />
            </Link>
            <Link
              href="/profile"
              className="flex items-center text-gray-600 hover:text-brand transition-colors"
              aria-label="Settings"
            >
              <UserIcon />
            </Link>
          </Flex>
        </Flex>
      </Container>
    </header>
  );
}
