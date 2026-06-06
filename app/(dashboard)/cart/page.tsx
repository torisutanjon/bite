import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Box, Container, Flex } from "@radix-ui/themes";
import CartItems from "./components/CartItems";
import PairsWellWith from "./components/PairsWellWith";
import CartOrderSummary from "./components/CartOrderSummary";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "BiteDash | Shopping Cart",
  description: "Review your cart items and proceed to checkout.",
};

export default function CartPage(): ReactElement {
  return (
    <>
      <Box className="min-h-screen bg-surface-alt">
        <Container size="4">
          <Box className="px-4 py-8">
            <Flex gap="6" align="start">
              {/* Left: cart items + recommendations */}
              <Flex direction="column" gap="5" className="flex-1 min-w-0">
                <CartItems />
                <PairsWellWith />
              </Flex>

              {/* Right: order summary (sticky) */}
              <Box className="w-72 flex-shrink-0 sticky top-20">
                <CartOrderSummary />
              </Box>
            </Flex>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
