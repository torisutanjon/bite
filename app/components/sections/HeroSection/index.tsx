import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import SearchBar from "./SearchBar";

export default function HeroSection(): ReactElement {
  return (
    <Box className="relative w-full min-h-[560px] md:min-h-[640px] overflow-hidden">
      {/* Background image */}
      <Image
        src="https://picsum.photos/seed/bitedashhero/1400/600"
        alt="Delicious food spread"
        fill
        className="object-cover"
        priority
      />

      {/* Lighter single-direction scrim */}
      <Box className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Content */}
      <Flex align="center" className="absolute inset-0">
        <Box className="max-w-2xl px-8 md:px-16">
          <Text
            as="span"
            size="2"
            weight="medium"
            className="uppercase tracking-[0.25em] text-white/80 block"
          >
            Order in minutes
          </Text>
          <Heading
            size={{ initial: "8", md: "9" }}
            className="text-white leading-[1.05] tracking-tight mt-4"
          >
            Hunger fulfilled
            <br />
            in one dash
          </Heading>
          <Text
            size={{ initial: "3", md: "4" }}
            className="mt-5 text-white/80 block max-w-md leading-relaxed"
          >
            Order from thousands of restaurants, 10 min kitchens, and unique
            local Markets.
          </Text>
          <SearchBar />
        </Box>
      </Flex>
    </Box>
  );
}
