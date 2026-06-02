import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Heading, Text } from "@radix-ui/themes";
import SearchBar from "./SearchBar";

export default function HeroSection(): ReactElement {
  return (
    <Box className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background image */}
      <Image
        src="https://picsum.photos/seed/bitedashhero/1400/600"
        alt="Delicious food spread"
        fill
        className="object-cover"
        priority
      />

      {/* Dark gradient overlay */}
      <Box className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/10" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-2xl px-8 md:px-16">
          <Heading
            size={{ initial: "7", md: "9" }}
            className="text-white leading-tight"
          >
            Hunger fulfilled
            <br />
            in one dash
          </Heading>
          <Text
            size={{ initial: "2", md: "3" }}
            className="mt-4 text-white/85 block max-w-md"
          >
            Order from thousands of restaurants, 10 min kitchens, and unique
            local Markets.
          </Text>
          <SearchBar />
        </div>
      </div>
    </Box>
  );
}
