import type { ReactElement } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import RestaurantCard from "@/app/components/ui/RestaurantCard";

const featuredRestaurant = {
  id: "1",
  name: "A'rtipizza Pizzeria",
  cuisine: "Italian Cuisine",
  rating: 4.8,
  deliveryTime: "12 min",
  badge: "Top Rated" as const,
  badgeColor: "orange" as const,
  image: "https://picsum.photos/seed/artipizza/600/800",
};

const nearbyRestaurants = [
  {
    id: "2",
    name: "Sakura Zen",
    cuisine: "Japanese",
    rating: 4.6,
    deliveryTime: "18 min",
    badge: "Quick Delivery",
    badgeColor: "blue" as const,
    image: "https://picsum.photos/seed/sakurazu/400/300",
  },
  {
    id: "3",
    name: "Sauce Classico",
    cuisine: "Italian",
    rating: 4.5,
    deliveryTime: "20 min",
    image: "https://picsum.photos/seed/saucecla/400/300",
  },
  {
    id: "4",
    name: "The Burger Studio",
    cuisine: "American",
    rating: 4.7,
    deliveryTime: "15 min",
    image: "https://picsum.photos/seed/burgers1/400/300",
  },
  {
    id: "5",
    name: "Bullet Delivery",
    cuisine: "Fusion",
    rating: 4.4,
    deliveryTime: "10 min",
    badge: "Quick Delivery",
    badgeColor: "blue" as const,
    image: "https://picsum.photos/seed/fusion11/400/300",
  },
];

export default function PopularNearbySection(): ReactElement {
  return (
    <Section size="3">
      <Container size="4">
        <Box className="px-4">
          {/* Header */}
          <Flex justify="between" align="end" mb="7">
            <Box>
              <Text
                as="span"
                size="1"
                weight="medium"
                className="uppercase tracking-[0.2em] text-brand block mb-2"
              >
                Nearby
              </Text>
              <Heading
                size="7"
                weight="medium"
                className="tracking-tight text-secondary"
              >
                Popular Nearby
              </Heading>
              <Text size="2" className="text-neutral mt-2 block">
                The trending flavors in your neighborhood right now.
              </Text>
            </Box>
            <Link href="/stores">
              <Text
                size="2"
                weight="medium"
                className="text-brand hover:text-brand-dark transition-colors"
              >
                View all
              </Text>
            </Link>
          </Flex>

          {/* Grid: large featured card left, 2×2 grid right */}
          <Flex gap="5" className="flex-col sm:flex-row">
            <Box className="sm:w-3/5">
              <RestaurantCard {...featuredRestaurant} featured />
            </Box>
            <Grid columns="2" gap="4" className="sm:w-2/5">
              {nearbyRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </Grid>
          </Flex>
        </Box>
      </Container>
    </Section>
  );
}
