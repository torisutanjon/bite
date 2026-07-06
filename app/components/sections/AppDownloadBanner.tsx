import type { ReactElement } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";

function AppleIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 814 1000"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 390.7 43.3 190.9 98.1 124.3c38.8-46.5 98.3-75.3 160.7-75.3 54.9 0 100.1 36 133.7 36 31.7 0 81.7-38.5 144.1-38.5 23.3 0 108.2 2.6 168.3 90.7zm-180.3-140.9C580.4 160 578 99 578 97.6c.6-.6 1.2-.6 1.8-.6 28.4 2.6 89.7 37.2 128.5 79.1 33.3 35.9 63.7 94.6 63.7 153.3 0 1.3-.6 2.6-1.2 3.9-3.2.6-6.4 1.3-9.7 1.3-27.2 0-83.4-31-121.8-74.6z" />
    </svg>
  );
}

function PlayStoreIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l2.7 1.5 246.9-246.9v-5.8L47 0zm425.6 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c17.1-9.8 17.1-25.7-.1-35.6l-1.2-.2zm-230.5 135l-65.6 64.5L99.6 512l2.7 1.5c13 7.8 30.7 6.8 44.5-1.2l294-166.2-48-48z" />
    </svg>
  );
}

export default function AppDownloadBanner(): ReactElement {
  return (
    <Box className="px-6 py-10 md:px-10 md:py-16">
      {/* Dark rounded card */}
      <Box className="bg-secondary rounded-3xl overflow-hidden">
        <Container size="4">
          <Grid
            columns={{ initial: "1", md: "2" }}
            gap="9"
            align="center"
            className="px-8 py-12 md:px-12 md:py-16"
          >
            {/* Text content */}
            <Box>
              <Heading
                size={{ initial: "7", md: "8" }}
                className="text-white leading-tight tracking-tight"
              >
                Dash on the go.
              </Heading>
              <Text
                size="3"
                className="mt-4 text-white/70 block leading-relaxed max-w-sm"
              >
                Download the BiteDash app for exclusive offers, real-time
                tracking, and a smoother ordering experience.
              </Text>
              <Flex gap="3" mt="6" wrap="wrap">
                <Button
                  size="3"
                  variant="outline"
                  radius="full"
                  className="!border-white/20 !text-white !bg-white/5 hover:!bg-white/10 gap-2"
                  aria-label="Download on the App Store"
                >
                  <AppleIcon />
                  App Store
                </Button>
                <Button
                  size="3"
                  variant="outline"
                  radius="full"
                  className="!border-white/20 !text-white !bg-white/5 hover:!bg-white/10 gap-2"
                  aria-label="Get it on Google Play"
                >
                  <PlayStoreIcon />
                  Google Play
                </Button>
              </Flex>
            </Box>

            {/* Phone mockup */}
            <Flex align="center" justify="center" className="relative h-64">
              <Box className="relative w-44 h-56">
                <Image
                  src="https://picsum.photos/seed/phonemock/400/600"
                  alt="BiteDash mobile app"
                  fill
                  className="object-cover rounded-3xl shadow-2xl"
                  sizes="176px"
                />
              </Box>
            </Flex>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
