import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Box, Container, Flex } from "@radix-ui/themes";
import OrderProgressStepper from "./components/OrderProgressStepper";
import TrackingMap from "./components/TrackingMap";
import DeliveryPanel from "./components/DeliveryPanel";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "BiteDash | Order Tracking",
  description: "Track your order in real-time.",
};

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const { id } = await params;

  return (
    <>
      {/* Accent bar */}
      <Box className="h-1 bg-blue-400 w-full" />

      <Box className="min-h-screen bg-white">
        <Container size="4">
          <Box className="px-4 py-6">
            <OrderProgressStepper orderId={id} />

            <Flex gap="5" mt="5" align="start" className="pb-12">
              {/* Map — wider */}
              <Box className="flex-[3] min-w-0">
                <TrackingMap />
              </Box>

              {/* Info panel — narrower */}
              <Box className="flex-[2] flex-shrink-0">
                <DeliveryPanel />
              </Box>
            </Flex>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
