"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Separator,
  Slider,
  Text,
} from "@radix-ui/themes";

const CATEGORIES = [
  { id: "all", label: "All Cuisines", emoji: "🍽️" },
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "sushi", label: "Sushi", emoji: "🍣" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
] as const;

const PRICE_OPTIONS = ["$", "$$", "$$$"] as const;

export default function FilterSidebar(): ReactElement {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePrice, setActivePrice] = useState("$$");
  const [rating45, setRating45] = useState(false);
  const [rating40, setRating40] = useState(true);
  const [deliveryTime, setDeliveryTime] = useState([45]);

  return (
    <Box className="py-5 px-3 h-full">
      {/* Categories */}
      <Text
        size="1"
        weight="bold"
        className="text-neutral uppercase tracking-widest px-2"
      >
        Categories
      </Text>

      <Flex direction="column" gap="1" mt="3">
        {CATEGORIES.map((cat) => (
          <Flex
            key={cat.id}
            align="center"
            gap="2"
            className={`cursor-pointer rounded-xl px-2 py-2 transition-colors ${
              activeCategory === cat.id
                ? "bg-brand text-white"
                : "hover:bg-gray-50 text-foreground"
            }`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Flex
              align="center"
              justify="center"
              className={`w-8 h-8 rounded-lg text-base flex-shrink-0 ${
                activeCategory === cat.id ? "bg-white/20" : "bg-gray-100"
              }`}
            >
              <Text>{cat.emoji}</Text>
            </Flex>
            <Text
              size="2"
              weight={activeCategory === cat.id ? "medium" : "regular"}
            >
              {cat.label}
            </Text>
          </Flex>
        ))}
      </Flex>

      <Separator size="4" my="5" />

      {/* Filters */}
      <Text
        size="1"
        weight="bold"
        className="text-neutral uppercase tracking-widest px-2"
      >
        Filters
      </Text>

      {/* Price Range */}
      <Box mt="4" className="px-1">
        <Text size="1" weight="medium" className="text-foreground">
          Price Range
        </Text>
        <Flex gap="2" mt="2">
          {PRICE_OPTIONS.map((price) => (
            <Button
              key={price}
              size="1"
              variant={activePrice === price ? "solid" : "outline"}
              color={activePrice === price ? "tomato" : "gray"}
              onClick={() => setActivePrice(price)}
              className="flex-1"
            >
              {price}
            </Button>
          ))}
        </Flex>
      </Box>

      {/* Rating */}
      <Box mt="5" className="px-1">
        <Text size="1" weight="medium" className="text-foreground">
          Rating
        </Text>
        <Flex direction="column" gap="2" mt="2">
          <Text as="label" size="1">
            <Flex as="span" gap="2" align="center">
              <Checkbox
                size="1"
                checked={rating45}
                onCheckedChange={(v) => setRating45(v === true)}
              />
              4.5+ Very Good
            </Flex>
          </Text>
          <Text as="label" size="1">
            <Flex as="span" gap="2" align="center">
              <Checkbox
                size="1"
                checked={rating40}
                onCheckedChange={(v) => setRating40(v === true)}
              />
              4.0+ Good
            </Flex>
          </Text>
        </Flex>
      </Box>

      {/* Delivery Time */}
      <Box mt="5" className="px-1">
        <Flex justify="between" align="center">
          <Text size="1" weight="medium" className="text-foreground">
            Delivery Time
          </Text>
          <Text size="1" className="text-neutral">
            {deliveryTime[0]} min
          </Text>
        </Flex>
        <Box mt="3">
          <Slider
            size="1"
            color="tomato"
            value={deliveryTime}
            onValueChange={setDeliveryTime}
            min={10}
            max={60}
            step={5}
          />
        </Box>
      </Box>
    </Box>
  );
}
