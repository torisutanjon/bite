import type { ReactElement } from "react";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import FoodCard from "@/app/components/ui/FoodCard";

const signatureBites = [
  {
    id: "1",
    name: "Avocado Zen Bowl",
    restaurant: "The Green Lab",
    badge: "Free",
    badgeColor: "green" as const,
    image: "https://picsum.photos/seed/avocadobl/300/400",
  },
  {
    id: "2",
    name: "Molten Lava Cake",
    restaurant: "Dolce Vita",
    image: "https://picsum.photos/seed/lavacake1/300/400",
  },
  {
    id: "3",
    name: "Wok Star Stir-Fry",
    restaurant: "Asian Fusion",
    badge: "Fresh",
    badgeColor: "green" as const,
    image: "https://picsum.photos/seed/stirfry1/300/400",
  },
  {
    id: "4",
    name: "Seaside Grill Platter",
    restaurant: "Oceanic Delights",
    image: "https://picsum.photos/seed/seafood1/300/400",
  },
];

export default function SignatureBitesSection(): ReactElement {
  return (
    <div className="h-[40vh] flex flex-col justify-center overflow-hidden py-8">
      <Container size="4">
        <Box className="px-4">
          <Heading size="6" weight="bold" mb="6">
            Signature Bites
          </Heading>

          {/* Horizontal scroll container */}
          <Flex
            gap="4"
            className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {signatureBites.map((item) => (
              <FoodCard key={item.id} {...item} />
            ))}
          </Flex>
        </Box>
      </Container>
    </div>
  );
}
