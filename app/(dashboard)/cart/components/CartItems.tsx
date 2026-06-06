"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { Box, Button, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";

interface CartItemData {
  id: string;
  name: string;
  modifier: string;
  unitPrice: number;
  qty: number;
  image: string;
}

const initialItems: CartItemData[] = [
  {
    id: "truffle-burger",
    name: "Truffle Umami Burger",
    modifier: "Extra Swiss Cheese, No Pickles",
    unitPrice: 18.5,
    qty: 1,
    image: "https://picsum.photos/seed/truffleburger/160/160",
  },
  {
    id: "quinoa-bowl",
    name: "Zesty Quinoa Power Bowl",
    modifier: "Tahini Dressing",
    unitPrice: 14.2,
    qty: 2,
    image: "https://picsum.photos/seed/quinoabowl/160/160",
  },
];

export default function CartItems(): ReactElement {
  const [items, setItems] = useState<CartItemData[]>(initialItems);

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  function updateQty(id: string, delta: number): void {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function clearCart(): void {
    setItems([]);
  }

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <Flex justify="between" align="center" mb="5">
        <Heading size="5" weight="bold">
          Your Cart{" "}
          <Text size="5" className="text-neutral font-normal">
            ({totalQty} {totalQty === 1 ? "Item" : "Items"})
          </Text>
        </Heading>
        <Button
          variant="ghost"
          color="tomato"
          size="1"
          onClick={clearCart}
          className="gap-1"
        >
          <TrashIcon width="13" height="13" />
          Clear Cart
        </Button>
      </Flex>

      {items.length === 0 ? (
        <Text size="2" className="text-neutral block text-center py-8">
          Your cart is empty.
        </Text>
      ) : (
        <Flex direction="column" gap="5">
          {items.map((item) => (
            <Flex
              key={item.id}
              gap="4"
              align="start"
              className="border-l-2 border-dashed border-indigo-200 pl-5"
            >
              {/* Circular image */}
              <Box className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </Box>

              {/* Content */}
              <Box className="flex-1 min-w-0">
                <Flex justify="between" align="start" gap="2">
                  <Box>
                    <Text
                      size="3"
                      weight="bold"
                      className="text-foreground block"
                    >
                      {item.name}
                    </Text>
                    <Text size="2" className="text-neutral block mt-0.5">
                      {item.modifier}
                    </Text>
                  </Box>
                  <Text
                    size="3"
                    weight="bold"
                    className="text-brand flex-shrink-0"
                  >
                    ${(item.unitPrice * item.qty).toFixed(2)}
                  </Text>
                </Flex>

                <Flex justify="between" align="center" mt="3">
                  {/* Qty controls */}
                  <Flex align="center" gap="3">
                    <IconButton
                      size="1"
                      variant="outline"
                      color="tomato"
                      className="rounded-full"
                      onClick={() => updateQty(item.id, -1)}
                      disabled={item.qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon width="10" height="10" />
                    </IconButton>
                    <Text
                      size="2"
                      weight="bold"
                      className="text-foreground w-4 text-center"
                    >
                      {item.qty}
                    </Text>
                    <IconButton
                      size="1"
                      color="tomato"
                      className="rounded-full"
                      onClick={() => updateQty(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon width="10" height="10" />
                    </IconButton>
                  </Flex>

                  {/* Special request */}
                  <Flex
                    align="center"
                    gap="1"
                    className="cursor-pointer text-neutral hover:text-foreground transition-colors"
                  >
                    <Pencil1Icon width="11" height="11" />
                    <Text size="1">Add special request</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
}
