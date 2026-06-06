import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Box, Container, Flex } from "@radix-ui/themes";
import AccountSidebar from "./components/AccountSidebar";
import OrdersEmptyState from "./components/OrdersEmptyState";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "BiteDash | Order History",
  description: "View your past orders and track deliveries.",
};

export default function OrdersPage(): ReactElement {
  return (
    <>
      <Box className="min-h-screen bg-surface-alt">
        <Container size="4">
          <Box className="px-4 py-8">
            <Flex gap="5" align="start">
              <AccountSidebar activePage="orders" />
              <Box className="flex-1 min-w-0">
                <OrdersEmptyState />
              </Box>
            </Flex>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
