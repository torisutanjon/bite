import type { ReactElement } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
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
    <Section size="3">
      <Container size="4">
        <Box className="px-4">
          <Text
            as="span"
            size="1"
            weight="medium"
            className="uppercase tracking-[0.2em] text-brand block mb-2"
          >
            Chef&apos;s picks
          </Text>
          <Heading
            size="7"
            weight="medium"
            mb="6"
            className="tracking-tight text-secondary"
          >
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
    </Section>
  );
}
