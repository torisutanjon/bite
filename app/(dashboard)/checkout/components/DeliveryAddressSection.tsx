"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { HomeIcon } from "@radix-ui/react-icons";

function LocationPinIcon(): ReactElement {
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

function OfficeBuildingIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm2 2h4v2H7V7zm0 4h4v2H7v-2zm0 4h4v2H7v-2zm6-8h2v10h-2V7z" />
    </svg>
  );
}

type AddressType = "home" | "office";

const addresses: {
  id: string;
  type: string;
  icon: AddressType;
  line1: string;
  line2: string;
}[] = [
  {
    id: "home",
    type: "Home",
    icon: "home",
    line1: "123 Culinary Way, Apartment 4B",
    line2: "San Francisco, CA 94103",
  },
  {
    id: "office",
    type: "Office",
    icon: "office",
    line1: "456 Tech Plaza, Suite 1200",
    line2: "San Francisco, CA 94105",
  },
];

export default function DeliveryAddressSection(): ReactElement {
  const [selected, setSelected] = useState("home");

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="2">
          <Box className="text-brand">
            <LocationPinIcon />
          </Box>
          <Heading size="4" weight="bold">
            Delivery Address
          </Heading>
        </Flex>
        <Button variant="ghost" color="tomato" size="1">
          Change
        </Button>
      </Flex>

      <Flex gap="4">
        {/* Address cards */}
        <Flex direction="column" gap="3" className="flex-1 min-w-0">
          {addresses.map((addr) => (
            <Box
              key={addr.id}
              onClick={() => setSelected(addr.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selected === addr.id
                  ? "border-brand bg-orange-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <Flex align="center" gap="2" mb="1">
                <Box
                  className={
                    selected === addr.id ? "text-brand" : "text-neutral"
                  }
                >
                  {addr.icon === "home" ? (
                    <HomeIcon width="14" height="14" />
                  ) : (
                    <OfficeBuildingIcon />
                  )}
                </Box>
                <Text size="2" weight="bold" className="text-foreground">
                  {addr.type}
                </Text>
              </Flex>
              <Text size="1" className="text-neutral block leading-relaxed">
                {addr.line1}
              </Text>
              <Text size="1" className="text-neutral block">
                {addr.line2}
              </Text>
            </Box>
          ))}
        </Flex>

        {/* Map preview */}
        <Box className="flex-1 rounded-2xl overflow-hidden bg-slate-600 relative min-h-[160px]">
          <Image
            src="https://picsum.photos/seed/sfcitymap/400/320"
            alt="Delivery location map"
            fill
            className="object-cover opacity-75 mix-blend-luminosity"
          />
          {/* Map pin overlay */}
          <Flex
            align="center"
            justify="center"
            className="absolute inset-0 pointer-events-none"
          >
            <Box className="w-6 h-6 bg-brand rounded-full border-4 border-white shadow-lg" />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
