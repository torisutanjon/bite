import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import FilterSidebar from "./components/FilterSidebar";
import FilterTabs from "./components/FilterTabs";
import FeaturedRestaurantCard from "./components/FeaturedRestaurantCard";
import FeedRestaurantCard from "@/app/components/ui/FeedRestaurantCard";
import RestaurantCard from "@/app/components/ui/RestaurantCard";

export const metadata: Metadata = {
  title: "BiteDash | Home Feed",
  description: "Discover restaurants and food near you.",
};

const featuredRestaurant = {
  name: "The Artisan Hearth",
  description:
    "Experience artisanal stone-baked pizza and handmade pastas with farm-to-table ingredients",
  rating: 4.9,
  deliveryTime: "25-35 min",
  badge: "PROMOTED",
  image: "https://picsum.photos/seed/artisanhearth/800/600",
};

const recommendedOthers = [
  {
    id: "r2",
    name: "Mizu Sushi Bar",
    cuisine: "Japanese",
    rating: 4.7,
    deliveryTime: "20 min",
    image: "https://picsum.photos/seed/mizusushihrec/400/300",
  },
  {
    id: "r3",
    name: "Stack'd Burgers",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "15 min",
    image: "https://picsum.photos/seed/stackdburgrec/400/300",
  },
];

const allRestaurants = [
  {
    id: "1",
    name: "Green Garden Bowls",
    cuisine: "Salads · Bowls · Healthy",
    rating: 4.2,
    deliveryTime: "20-30 min",
    priceLevel: 2,
    badge: "Free Delivery",
    badgeColor: "green" as const,
    image: "https://picsum.photos/seed/greengardenfeed/400/300",
  },
  {
    id: "2",
    name: "Bella Italia Pizza",
    cuisine: "Italian · Pizza · Artisanal",
    rating: 4.9,
    deliveryTime: "30-40 min",
    priceLevel: 3,
    badge: "Free Delivery",
    badgeColor: "green" as const,
    image: "https://picsum.photos/seed/bellaitalfeed/400/300",
  },
  {
    id: "3",
    name: "Siam Spice",
    cuisine: "Thai · Asian · Spicy",
    rating: 4.4,
    deliveryTime: "15-30 min",
    priceLevel: 2,
    badge: "Free Delivery",
    badgeColor: "green" as const,
    image: "https://picsum.photos/seed/siamspicefeed/400/300",
  },
];

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}): Promise<ReactElement> {
  // Params available for future server-side filtering
  await searchParams;

  return (
    <Flex className="min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <Box className="w-56 flex-shrink-0 border-r border-gray-100 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
        <FilterSidebar />
      </Box>

      {/* Main content */}
      <Box className="flex-1 min-w-0 p-6 lg:p-8">
        {/* Recommended for you */}
        <Box mb="8">
          <Flex justify="between" align="end" mb="5">
            <Box>
              <Heading size="5" weight="bold">
                Recommended for you
              </Heading>
              <Text size="2" className="text-neutral mt-1 block">
                Hand-picked flavors based on your recent orders.
              </Text>
            </Box>
            <Link href="/stores">
              <Text
                size="2"
                weight="medium"
                className="text-brand hover:text-brand-dark transition-colors whitespace-nowrap"
              >
                View All →
              </Text>
            </Link>
          </Flex>

          {/* Featured + 2 stacked cards */}
          <Flex gap="3">
            <Box className="flex-[3]">
              <FeaturedRestaurantCard {...featuredRestaurant} />
            </Box>
            <Flex direction="column" gap="3" className="flex-[2]">
              {recommendedOthers.map((r) => (
                <RestaurantCard key={r.id} {...r} />
              ))}
            </Flex>
          </Flex>
        </Box>

        {/* All Restaurants */}
        <Box>
          <Heading size="5" weight="bold" mb="4">
            All Restaurants
          </Heading>
          <Box mb="4">
            <FilterTabs />
          </Box>
          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
            {allRestaurants.map((restaurant) => (
              <FeedRestaurantCard key={restaurant.id} {...restaurant} />
            ))}
          </Grid>
        </Box>
      </Box>
    </Flex>
  );
}
