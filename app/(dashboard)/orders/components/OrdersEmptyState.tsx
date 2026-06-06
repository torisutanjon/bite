import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";

function UtensilsIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </svg>
  );
}

function SearchIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function PizzaIcon(): ReactElement {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l9-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

function BurgerIcon(): ReactElement {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 10H4c0-3.31 3.58-6 8-6s8 2.69 8 6zM3 11v2h18v-2H3zm1 3v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3H4z" />
    </svg>
  );
}

function BowlIcon(): ReactElement {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z" />
    </svg>
  );
}

function DessertIcon(): ReactElement {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3.77L11.25 3C9.2 .93 6.32.5 3.82 1.57L8.5 6.25c.39.39.39 1.02 0 1.41L6.96 9.21c-.39.39-1.02.39-1.41 0L.87 4.53C-.2 7.03.23 9.91 2.3 11.98l.02.02c1.79 1.79 4.18 2.49 6.45 2.16L18.5 24l5-5L12 8.7V3.77z" />
    </svg>
  );
}

const categories = [
  {
    id: "pizza",
    label: "Pizza",
    subtitle: "24 Local spots",
    icon: <PizzaIcon />,
  },
  {
    id: "burgers",
    label: "Burgers",
    subtitle: "18 Near you",
    icon: <BurgerIcon />,
  },
  {
    id: "asian",
    label: "Asian",
    subtitle: "12 Top rated",
    icon: <BowlIcon />,
  },
  {
    id: "desserts",
    label: "Desserts",
    subtitle: "Best of today",
    icon: <DessertIcon />,
  },
];

export default function OrdersEmptyState(): ReactElement {
  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
      <Flex direction="column" align="center" gap="5">
        {/* Hero image with tooltip */}
        <Box className="relative w-64 h-52 rounded-2xl overflow-hidden flex-shrink-0">
          <Image
            src="https://picsum.photos/seed/emptydiningtable/400/320"
            alt="Empty dining table"
            fill
            className="object-cover"
            priority
          />

          {/* Hungry tooltip */}
          <Box className="absolute bottom-3 right-3">
            <Flex
              align="center"
              gap="2"
              className="bg-white/96 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm"
            >
              <Flex
                align="center"
                justify="center"
                className="w-6 h-6 rounded-full bg-brand flex-shrink-0"
              >
                <Box className="text-white">
                  <UtensilsIcon />
                </Box>
              </Flex>
              <Box>
                <Text size="1" weight="bold" className="text-foreground block">
                  Hungry?
                </Text>
                <Text
                  size="1"
                  className="text-neutral block whitespace-nowrap"
                >
                  We&apos;ve got you covered.
                </Text>
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Heading + description */}
        <Box className="text-center">
          <Heading
            size="5"
            weight="bold"
            mb="2"
            className="font-accent text-foreground"
          >
            No orders yet
          </Heading>
          <Text
            size="2"
            className="text-neutral block leading-relaxed max-w-sm mx-auto"
          >
            Your kitchen table is waiting for something special. Explore the
            best local flavors and start your first BiteDash experience today.
          </Text>
        </Box>

        {/* CTA button */}
        <Link href="/stores">
          <Button size="3" color="tomato" className="rounded-full px-8 gap-2">
            <SearchIcon />
            Browse Restaurants
          </Button>
        </Link>

        {/* Category chips */}
        <Flex gap="4" justify="center" className="w-full pt-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/stores?category=${cat.id}`}
              className="no-underline"
            >
              <Flex
                direction="column"
                align="center"
                gap="1"
                className="bg-surface-alt rounded-2xl px-4 py-3 min-w-16 cursor-pointer hover:shadow-sm transition-shadow border border-gray-100"
              >
                <Box className="text-brand mb-0.5">{cat.icon}</Box>
                <Text size="2" weight="bold" className="text-foreground whitespace-nowrap">
                  {cat.label}
                </Text>
                <Text size="1" className="text-neutral whitespace-nowrap">
                  {cat.subtitle}
                </Text>
              </Flex>
            </Link>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
