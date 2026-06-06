import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";

const orderItems = [
  {
    name: "Truffle Umami Burger",
    modifier: "x1 · Extra Cheese",
    price: 18.5,
    image: "https://picsum.photos/seed/truffleburger/80/80",
  },
  {
    name: "Superfood Kale Salad",
    modifier: "x1 · Balsamic Vinaigrette",
    price: 14.0,
    image: "https://picsum.photos/seed/kalesalad/80/80",
  },
  {
    name: "House Ginger Ale",
    modifier: "x2 · With Ice",
    price: 9.0,
    image: "https://picsum.photos/seed/gingerale/80/80",
  },
];

const subtotal = 41.5;
const serviceFee = 2.49;
const total = subtotal + serviceFee;

export default function CheckoutOrderSummary(): ReactElement {
  return (
    <Flex className="flex-col gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Heading size="4" weight="bold" mb="4">
        Your Order
      </Heading>

      <Flex direction="column" gap="4">
        {orderItems.map((item) => (
          <Flex key={item.name} gap="3" align="center">
            <Box className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </Box>
            <Box className="flex-1 min-w-0">
              <Text
                size="2"
                weight="bold"
                className="text-foreground block truncate"
              >
                {item.name}
              </Text>
              <Text size="1" className="text-neutral block">
                {item.modifier}
              </Text>
            </Box>
            <Text
              size="2"
              weight="medium"
              className="text-foreground flex-shrink-0"
            >
              ${item.price.toFixed(2)}
            </Text>
          </Flex>
        ))}
      </Flex>

      <Separator size="4" my="4" />

      <Flex direction="column" gap="2">
        <Flex justify="between">
          <Text size="2" className="text-neutral">
            Subtotal
          </Text>
          <Text size="2" className="text-foreground">
            ${subtotal.toFixed(2)}
          </Text>
        </Flex>
        <Flex justify="between">
          <Text size="2" className="text-neutral">
            Delivery Fee
          </Text>
          <Text size="2" weight="bold" className="text-brand">
            FREE
          </Text>
        </Flex>
        <Flex justify="between">
          <Text size="2" className="text-neutral">
            Service Fee
          </Text>
          <Text size="2" className="text-foreground">
            ${serviceFee.toFixed(2)}
          </Text>
        </Flex>
        <Flex justify="between" mt="1">
          <Text size="3" weight="bold" className="text-foreground">
            Total
          </Text>
          <Text size="3" weight="bold" className="text-foreground">
            ${total.toFixed(2)}
          </Text>
        </Flex>
      </Flex>

      <Button size="3" color="tomato" className="my-5 w-full rounded-full">
        Place Order
        <ArrowRightIcon />
      </Button>

      <Text
        size="1"
        className="text-neutral text-center block mt-3 leading-relaxed"
      >
        By placing your order, you agree to BiteDash&apos;s{" "}
        <Link href="/terms" className="text-brand hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand hover:underline">
          Privacy Policy
        </Link>
        .
      </Text>
    </Flex>
  );
}
