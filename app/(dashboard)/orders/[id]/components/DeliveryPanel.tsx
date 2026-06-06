import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Button, Flex, Separator, Text } from "@radix-ui/themes";
import { StarFilledIcon } from "@radix-ui/react-icons";

function ChatIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function PhoneIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

function EBikeIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2M5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5S3.1 13.5 5 13.5 8.5 15.1 8.5 17 6.9 20.5 5 20.5M19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5M14.3 7.1L11 10.4v2.6c1.1.8 2.3 1.6 3.5 2.1V17h2v-3c0-.6-.2-1.1-.7-1.4L14.3 11l2.6-2.6L14.3 7.1zM9.9 7H7.5L6 10h2.5l1.4-3z" />
    </svg>
  );
}

const orderItems = [
  { label: "1x Truffle Burger Deluxe", price: 18.9 },
  { label: "1x Parmesan Fries", price: 6.5 },
];

const total = orderItems.reduce((sum, item) => sum + item.price, 0);

export default function DeliveryPanel(): ReactElement {
  return (
    <Flex direction="column" gap="4">
      {/* Estimated Delivery */}
      <Box className="relative overflow-hidden bg-brand rounded-2xl p-5">
        {/* Decorative arc */}
        <Box className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-[10px] border-white/15 pointer-events-none" />
        <Box className="absolute -right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-[8px] border-white/10 pointer-events-none" />

        <Text size="1" className="text-white/75 block tracking-wide uppercase">
          Estimated Delivery
        </Text>
        <Text
          size="8"
          weight="bold"
          className="text-white block mt-1 font-accent"
        >
          12–18 mins
        </Text>
      </Box>

      {/* Rider Card */}
      <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {/* Rider info */}
        <Flex align="center" gap="3" mb="4">
          <Box className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 relative ring-2 ring-brand/20">
            <Image
              src="https://picsum.photos/seed/marcorossidriver/100/100"
              alt="Marco Rossi"
              fill
              className="object-cover"
            />
          </Box>
          <Box>
            <Text size="3" weight="bold" className="text-foreground block">
              Marco Rossi
            </Text>
            <Flex align="center" gap="1" mt="1">
              <StarFilledIcon
                className="text-yellow-400"
                width="13"
                height="13"
              />
              <Text size="1" className="text-neutral">
                4.9 (1,200+ deliveries)
              </Text>
            </Flex>
          </Box>
        </Flex>

        {/* Vehicle */}
        <Box className="bg-gray-50 rounded-xl p-3 mb-4">
          <Text size="1" className="text-neutral block mb-1.5">
            Vehicle
          </Text>
          <Flex align="center" gap="2">
            <Box className="text-brand">
              <EBikeIcon />
            </Box>
            <Text size="2" weight="medium" className="text-foreground">
              Electric e-Bike
            </Text>
          </Flex>
        </Box>

        {/* Action buttons */}
        <Flex gap="3" align="center">
          <Button size="2" color="tomato" className="flex-1 rounded-full gap-2">
            <ChatIcon />
            Live Chat
          </Button>
          <Flex
            align="center"
            justify="center"
            className="w-10 h-10 rounded-full border-2 border-gray-200 cursor-pointer hover:border-brand hover:text-brand transition-colors flex-shrink-0 text-neutral"
          >
            <PhoneIcon />
          </Flex>
        </Flex>
      </Box>

      {/* Order Items */}
      <Box className="bg-blue-50 rounded-2xl p-4">
        <Text size="2" weight="bold" className="text-foreground block mb-3">
          Order Items
        </Text>

        <Flex direction="column" gap="2">
          {orderItems.map((item) => (
            <Flex key={item.label} justify="between" align="center">
              <Text size="2" className="text-foreground">
                {item.label}
              </Text>
              <Text size="2" className="text-foreground">
                ${item.price.toFixed(2)}
              </Text>
            </Flex>
          ))}
        </Flex>

        <Separator size="4" my="3" />

        <Flex justify="between" align="center">
          <Text size="3" weight="bold" className="text-foreground">
            Total
          </Text>
          <Text size="3" weight="bold" className="text-brand">
            ${total.toFixed(2)}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}
