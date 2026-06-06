"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";

interface Recommendation {
  id: string;
  name: string;
  price: number;
  image: string;
}

const recommendations: Recommendation[] = [
  {
    id: "cold-brew",
    name: "Cold Brew Coffee",
    price: 4.5,
    image: "https://picsum.photos/seed/coldbrewcoffee/200/200",
  },
  {
    id: "glazed-donut",
    name: "Glazed Delight",
    price: 3.0,
    image: "https://picsum.photos/seed/glazeddonut/200/200",
  },
  {
    id: "sweet-fries",
    name: "Sweet Potato Fries",
    price: 6.5,
    image: "https://picsum.photos/seed/sweetpotatofries/200/200",
  },
  {
    id: "orange-juice",
    name: "Fresh Orange Juice",
    price: 4.0,
    image: "https://picsum.photos/seed/freshorangejuice/200/200",
  },
];

export default function PairsWellWith(): ReactElement {
  const [added, setAdded] = useState<Set<string>>(new Set());

  function handleAdd(id: string): void {
    setAdded((prev) => new Set([...prev, id]));
  }

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <Heading size="4" weight="bold" mb="4">
        Pairs well with...
      </Heading>

      <Flex gap="4" className="overflow-x-auto pb-1">
        {recommendations.map((item) => (
          <Flex
            key={item.id}
            direction="column"
            className="flex-shrink-0 w-24"
          >
            <Box className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 relative mb-2">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </Box>
            <Text
              size="1"
              weight="bold"
              className="text-foreground block truncate leading-tight"
            >
              {item.name}
            </Text>
            <Text size="1" className="text-brand block mt-0.5">
              ${item.price.toFixed(2)}
            </Text>
            <Button
              size="1"
              variant={added.has(item.id) ? "solid" : "outline"}
              color="tomato"
              className="rounded-full mt-2 w-full"
              onClick={() => handleAdd(item.id)}
              disabled={added.has(item.id)}
            >
              {added.has(item.id) ? "Added" : "+ Add"}
            </Button>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
