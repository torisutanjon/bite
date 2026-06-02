import type { Metadata } from "next";
import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { ClockIcon, HeartIcon, StarFilledIcon } from "@radix-ui/react-icons";
import MenuTabs from "./components/MenuTabs";
import AppetizersGrid from "./components/AppetizersGrid";
import MainsList from "./components/MainsList";
import OrderSidebar from "./components/OrderSidebar";
import GuestExperiences from "./components/GuestExperiences";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "BiteDash | Restaurant Details",
  description:
    "Artisanal fusion cuisine crafted with locally sourced organic ingredients.",
};

function ShareIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  await params;

  return (
    <>
      {/* Hero — full bleed */}
      <Box className="relative h-64 md:h-72 overflow-hidden">
        <Image
          src="https://picsum.photos/seed/urbanbistrohero/1400/500"
          alt="The Urban Bistro & Grill interior"
          fill
          className="object-cover"
          priority
        />
        <Box className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        {/* Badge */}
        <Box className="absolute top-4 left-4 md:left-8">
          <Badge color="tomato" variant="solid" size="1">
            Gourmet Selection
          </Badge>
        </Box>

        {/* Title */}
        <Box className="absolute bottom-10 left-4 right-4 md:left-8">
          <Heading
            size={{ initial: "6", md: "8" }}
            className="text-white leading-tight"
          >
            The Urban Bistro & Grill
          </Heading>
          <Text size="2" className="text-white/75 mt-2 block max-w-lg">
            Artisanal fusion cuisine crafted with locally sourced organic
            ingredients and a modern culinary twist.
          </Text>
        </Box>
      </Box>

      <Container size="4">
        <Box className="px-4 md:px-6 pb-12">
          {/* Stats bar — floats up over hero */}
          <Box className="-mt-6 relative z-10">
            <Box className="bg-white rounded-2xl shadow-lg px-5 py-4">
              <Flex justify="between" align="center" wrap="wrap" gap="4">
                <Flex gap="5" align="center">
                  {/* Rating */}
                  <Flex align="center" gap="1.5">
                    <StarFilledIcon
                      className="text-yellow-400"
                      width="18"
                      height="18"
                    />
                    <Text size="3" weight="bold" className="text-foreground">
                      4.8
                    </Text>
                    <Text size="1" className="text-neutral">
                      (2.5k+)
                    </Text>
                  </Flex>

                  <Box className="w-px h-8 bg-gray-200" />

                  {/* Delivery */}
                  <Flex align="center" gap="1.5">
                    <ClockIcon className="text-neutral" width="18" height="18" />
                    <Box>
                      <Badge color="green" variant="soft" size="1">
                        Included
                      </Badge>
                      <Text size="2" weight="medium" className="block text-foreground mt-0.5">
                        25–35 min
                      </Text>
                    </Box>
                  </Flex>

                  <Box className="w-px h-8 bg-gray-200" />

                  {/* Min order */}
                  <Box>
                    <Text size="1" className="text-neutral block">
                      Min Order
                    </Text>
                    <Text size="2" weight="bold" className="text-foreground">
                      $15.00
                    </Text>
                  </Box>
                </Flex>

                <Flex gap="2" align="center">
                  <Button
                    size="2"
                    variant="outline"
                    color="gray"
                    className="rounded-full gap-1.5"
                  >
                    <HeartIcon width="14" height="14" />
                    Favorite
                  </Button>
                  <Button size="2" color="tomato" className="rounded-full gap-1.5">
                    <ShareIcon />
                    Share
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Box>

          {/* Menu + Order */}
          <Flex gap="6" mt="6" align="start">
            {/* Left column: menu content */}
            <Box className="flex-1 min-w-0">
              <MenuTabs />

              <Box id="appetizers" className="mt-6 scroll-mt-20">
                <AppetizersGrid />
              </Box>

              <Box id="mains" className="mt-10 scroll-mt-20">
                <MainsList />
              </Box>

              <Box id="guest-experiences" className="mt-10 scroll-mt-20">
                <GuestExperiences />
              </Box>
            </Box>

            {/* Right column: order sidebar */}
            <Box className="w-72 flex-shrink-0 sticky top-20 hidden lg:block">
              <OrderSidebar />
            </Box>
          </Flex>
        </Box>
      </Container>

      <Footer />
    </>
  );
}
