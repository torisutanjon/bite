import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Box, Container, Flex } from "@radix-ui/themes";
import CheckoutStepper from "./components/CheckoutStepper";
import DeliveryAddressSection from "./components/DeliveryAddressSection";
import PaymentMethodSection from "./components/PaymentMethodSection";
import CheckoutOrderSummary from "./components/CheckoutOrderSummary";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "BiteDash | Checkout",
  description: "Complete your order and choose a delivery address and payment method.",
};

export default function CheckoutPage(): ReactElement {
  return (
    <>
      <Box className="min-h-screen bg-surface-alt">
        <Container size="4">
          <Box className="px-4">
            <CheckoutStepper currentStep={2} />

            <Flex gap="6" align="start" className="pb-16">
              {/* Left: address + payment */}
              <Flex direction="column" gap="5" className="flex-1 min-w-0">
                <DeliveryAddressSection />
                <PaymentMethodSection />
              </Flex>

              {/* Right: order summary (sticky) */}
              <Box className="w-72 flex-shrink-0 sticky top-20">
                <CheckoutOrderSummary />
              </Box>
            </Flex>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
