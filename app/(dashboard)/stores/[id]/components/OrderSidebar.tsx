import type { ReactElement } from "react";
import { Box, Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { LightningBoltIcon } from "@radix-ui/react-icons";

const orderItems = [
  { name: "Wagyu Burger", qty: 1, price: 26.0 },
  { name: "Truffle Arancini", qty: 1, price: 14.5 },
];

const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
const deliveryTax = 2.99;
const total = subtotal + deliveryTax;

export default function OrderSidebar(): ReactElement {
  return (
    <Box>
      {/* Order card */}
      <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <Heading size="4" weight="bold" mb="4">
          Your Order
        </Heading>

        {/* Items */}
        <Flex direction="column" gap="3">
          {orderItems.map((item) => (
            <Flex key={item.name} justify="between" align="center">
              <Text size="2" className="text-foreground">
                {item.qty}x {item.name}
              </Text>
              <Text size="2" weight="medium" className="text-foreground">
                ${(item.price * item.qty).toFixed(2)}
              </Text>
            </Flex>
          ))}
        </Flex>

        <Separator size="4" my="4" />

        {/* Totals */}
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
              Delivery Tax
            </Text>
            <Text size="2" className="text-foreground">
              ${deliveryTax.toFixed(2)}
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

        <Button
          size="3"
          color="tomato"
          className="mt-5 w-full rounded-full"
        >
          Checkout Now
        </Button>
      </Box>

      {/* Join Pro banner */}
      <Box className="mt-4 bg-secondary rounded-2xl p-4">
        <Flex gap="3" align="center">
          <Flex
            align="center"
            justify="center"
            className="w-10 h-10 rounded-full bg-brand/20 flex-shrink-0"
          >
            <LightningBoltIcon className="text-brand" width="18" height="18" />
          </Flex>
          <Box>
            <Text size="2" weight="bold" className="text-white block">
              Join Pro
            </Text>
            <Text size="1" className="text-white/60 block mt-0.5 leading-relaxed">
              Get unlimited free delivery on all orders over $20.
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
