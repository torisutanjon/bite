import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

const mains = [
  {
    id: "1",
    name: "Signature Wagyu Burger",
    price: 26.0,
    description:
      "M5+ Wagyu beef, truffle brie, onion jam, and hand-cut triple cooked chips.",
    badge: "Recommended",
    badgeColor: "orange" as const,
    image: "https://picsum.photos/seed/wagyuburg/300/300",
  },
  {
    id: "2",
    name: "Miso Glazed Salmon",
    price: 32.0,
    description:
      "Atlantic salmon, ginger miso glaze, sesame asparagus, and jasmine rice.",
    badge: "Healthy Choice",
    badgeColor: "green" as const,
    image: "https://picsum.photos/seed/misosal/300/300",
  },
];

export default function MainsList(): ReactElement {
  return (
    <Box>
      <Heading size="4" weight="bold" mb="4">
        Mains
      </Heading>
      <Flex direction="column" gap="3">
        {mains.map((item) => (
          <Box
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <Flex gap="4" align="start">
              {/* Thumbnail */}
              <Box className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </Box>

              {/* Content */}
              <Box className="flex-1 min-w-0">
                <Flex justify="between" align="start">
                  <Text size="3" weight="bold" className="text-foreground">
                    {item.name}
                  </Text>
                  <Text
                    size="3"
                    weight="bold"
                    className="text-brand flex-shrink-0 ml-4"
                  >
                    ${item.price.toFixed(2)}
                  </Text>
                </Flex>
                <Text
                  size="1"
                  className="text-neutral block mt-1 leading-relaxed line-clamp-2"
                >
                  {item.description}
                </Text>
                <Flex align="center" justify="between" mt="2">
                  {item.badge && (
                    <Badge color={item.badgeColor} variant="soft" size="1">
                      {item.badge}
                    </Badge>
                  )}
                  <IconButton
                    size="2"
                    color="tomato"
                    variant="solid"
                    className="!rounded-full ml-auto"
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <PlusIcon width="14" height="14" />
                  </IconButton>
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
