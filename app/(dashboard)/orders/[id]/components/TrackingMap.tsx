import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Flex, Text } from "@radix-ui/themes";
import { HomeIcon } from "@radix-ui/react-icons";

function BikeIcon(): ReactElement {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5 3.5 3.5 0 0 1 8.5 17 3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m9.8-2H19V8.2h-3.2v-1H19V5.5h-5v4.7l-3.3-3.8H8V8h2l3.2 3.8H19v1.7h-5.5l-2.4-2.8-1.5 1.5L12 13.7V17h2v-3.5l2.4-2.7-.6-.8M19 20.5A3.5 3.5 0 0 1 15.5 17 3.5 3.5 0 0 1 19 13.5 3.5 3.5 0 0 1 22.5 17 3.5 3.5 0 0 1 19 20.5M19 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z" />
    </svg>
  );
}

function MapPinIcon(): ReactElement {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 0C6.268 0 0 6.268 0 14c0 9.334 12.222 20.854 13.242 21.789a1 1 0 0 0 1.516 0C15.778 34.854 28 23.334 28 14 28 6.268 21.732 0 14 0z"
        fill="#ef4444"
      />
      <circle cx="14" cy="14" r="5" fill="white" />
    </svg>
  );
}

function ZoomButton({ label }: { label: string }): ReactElement {
  return (
    <Flex
      align="center"
      justify="center"
      className="w-8 h-8 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors select-none"
    >
      <Text size="4" weight="bold" className="text-foreground leading-none">
        {label}
      </Text>
    </Flex>
  );
}

export default function TrackingMap(): ReactElement {
  return (
    <Box className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[4/3]">
      {/* Map image */}
      <Image
        src="https://picsum.photos/seed/aerialcityview/900/675"
        alt="Live delivery map"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay tint */}
      <Box className="absolute inset-0 bg-slate-900/10" />

      {/* Home / destination pin */}
      <Box className="absolute top-[14%] left-[14%]">
        <Flex
          align="center"
          justify="center"
          className="w-9 h-9 bg-brand rounded-full shadow-lg border-2 border-white"
        >
          <HomeIcon className="text-white" width="16" height="16" />
        </Flex>
      </Box>

      {/* Rider bubble */}
      <Box className="absolute top-[44%] left-[30%]">
        <Box className="bg-gray-900 text-white rounded-2xl px-3 py-2 shadow-xl">
          <Flex align="center" gap="2">
            <Flex
              align="center"
              justify="center"
              className="w-6 h-6 bg-brand rounded-full flex-shrink-0"
            >
              <BikeIcon />
            </Flex>
            <Box>
              <Text size="1" weight="bold" className="text-white block">
                Marco
              </Text>
              <Text size="1" className="text-gray-300 block whitespace-nowrap">
                is 6 min away
              </Text>
            </Box>
          </Flex>
        </Box>
        {/* Tail */}
        <Box className="w-3 h-3 bg-gray-900 rotate-45 mx-auto -mt-1.5 rounded-sm" />
      </Box>

      {/* Delivery destination pin */}
      <Box className="absolute top-[50%] left-[48%] -translate-x-1/2 -translate-y-full">
        <MapPinIcon />
      </Box>

      {/* Zoom controls */}
      <Flex
        direction="column"
        gap="1"
        className="absolute bottom-4 left-4"
      >
        <ZoomButton label="+" />
        <ZoomButton label="−" />
      </Flex>
    </Box>
  );
}
