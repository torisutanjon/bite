"use client";

import type { ReactElement, ChangeEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  ArrowRightIcon,
  LightningBoltIcon,
  MixIcon,
} from "@radix-ui/react-icons";

const subtotal = 46.9;
const deliveryFee = 2.99;
const taxAndFees = 4.25;
const total = subtotal + deliveryFee + taxAndFees;

export default function CartOrderSummary(): ReactElement {
  const [promoCode, setPromoCode] = useState("");

  function handlePromoChange(e: ChangeEvent<HTMLInputElement>): void {
    setPromoCode(e.target.value);
  }

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Heading size="4" weight="bold" mb="4">
        Order Summary
      </Heading>

      {/* Pricing */}
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
          <Text size="2" className="text-foreground">
            ${deliveryFee.toFixed(2)}
          </Text>
        </Flex>
        <Flex justify="between">
          <Text size="2" className="text-neutral">
            Tax &amp; Fees
          </Text>
          <Text size="2" className="text-foreground">
            ${taxAndFees.toFixed(2)}
          </Text>
        </Flex>
        <Flex justify="between" mt="2">
          <Text size="4" weight="bold" className="text-foreground">
            Total
          </Text>
          <Text size="4" weight="bold" className="text-foreground">
            ${total.toFixed(2)}
          </Text>
        </Flex>
      </Flex>

      <Separator size="4" my="4" />

      {/* Promo code */}
      <TextField.Root
        variant="soft"
        placeholder="Promo code"
        value={promoCode}
        onChange={handlePromoChange}
        className="bg-gray-50 rounded-xl"
      >
        <TextField.Slot>
          <MixIcon width="14" height="14" className="text-neutral" />
        </TextField.Slot>
        <TextField.Slot side="right">
          <Button size="1" variant="ghost" color="gray" className="rounded-lg">
            Apply
          </Button>
        </TextField.Slot>
      </TextField.Root>

      {/* CTA */}
      <Link href="/checkout" className="block mt-4">
        <Button size="3" color="tomato" className="w-full rounded-full">
          Proceed to Checkout
          <ArrowRightIcon />
        </Button>
      </Link>

      {/* Fine print */}
      <Text
        size="1"
        className="text-neutral text-center block mt-3 leading-relaxed"
      >
        By placing your order, you agree to our{" "}
        <Link href="/terms" className="text-brand hover:underline">
          Terms of Service
        </Link>
      </Text>

      {/* Priority Delivery */}
      <Box className="mt-4 bg-surface-alt rounded-xl p-4 border border-gray-100">
        <Flex gap="3" align="center">
          <Flex
            align="center"
            justify="center"
            className="w-10 h-10 rounded-full bg-brand/20 flex-shrink-0"
          >
            <LightningBoltIcon className="text-brand" width="16" height="16" />
          </Flex>
          <Box>
            <Text size="2" weight="bold" className="text-foreground block">
              Priority Delivery
            </Text>
            <Text size="1" className="text-neutral block mt-0.5">
              Arriving in 15–25 mins
            </Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
