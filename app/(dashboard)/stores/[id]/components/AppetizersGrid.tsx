import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

const appetizers = [
  {
    id: "1",
    name: "Truffle Arancini",
    price: 14.5,
    description:
      "Wild mushroom risotto balls with black truffle oil and roasted garlic aioli dip.",
    badge: "POPULAR",
    image: "https://picsum.photos/seed/trufflearan/400/300",
  },
  {
    id: "2",
    name: "Seared Scallops",
    price: 18.0,
    description:
      "Hand dived scallops, cauliflower purée, crispy pancetta, and citrus glaze.",
    image: "https://picsum.photos/seed/searedscall/400/300",
  },
];

export default function AppetizersGrid(): ReactElement {
  return (
    <Box>
      <Heading size="4" weight="bold" mb="4">
        Appetizers
      </Heading>
      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        {appetizers.map((item) => (
          <Box
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          >
            {/* Image */}
            <Box className="relative h-44">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              {item.badge && (
                <Box className="absolute top-3 left-3">
                  <Badge color="tomato" variant="solid" size="1">
                    {item.badge}
                  </Badge>
                </Box>
              )}
            </Box>

            {/* Content */}
            <Box className="p-4">
              <Flex justify="between" align="start">
                <Text size="3" weight="bold" className="text-foreground">
                  {item.name}
                </Text>
                <Text size="3" weight="bold" className="text-brand flex-shrink-0 ml-2">
                  ${item.price.toFixed(2)}
                </Text>
              </Flex>
              <Text size="1" className="text-neutral block mt-1.5 leading-relaxed">
                {item.description}
              </Text>
              <Button
                size="2"
                variant="outline"
                color="gray"
                className="mt-3 w-full rounded-full gap-1.5"
              >
                <PlusIcon width="13" height="13" />
                Add to Cart
              </Button>
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
