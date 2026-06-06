"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";

function WalletIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 12V22H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <rect x="14" y="10" width="8" height="6" rx="1" />
      <circle cx="17" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CreditCardIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function AppleIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PaypalIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    </svg>
  );
}

type PaymentId = "credit-card" | "apple-pay" | "paypal";

interface PaymentMethod {
  id: PaymentId;
  label: string;
  description: string | null;
  icon: ReactElement;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit-card",
    label: "Credit Card",
    description: "•••• •••• •••• 4242",
    icon: <CreditCardIcon />,
  },
  {
    id: "apple-pay",
    label: "Apple Pay",
    description: null,
    icon: <AppleIcon />,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: null,
    icon: <PaypalIcon />,
  },
];

export default function PaymentMethodSection(): ReactElement {
  const [selected, setSelected] = useState<PaymentId>("credit-card");

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Flex align="center" gap="2" mb="4">
        <Box className="text-brand">
          <WalletIcon />
        </Box>
        <Heading size="4" weight="bold">
          Payment Method
        </Heading>
      </Flex>

      <Flex direction="column" gap="3">
        {paymentMethods.map((method) => (
          <Flex
            key={method.id}
            align="center"
            justify="between"
            onClick={() => setSelected(method.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              selected === method.id
                ? "border-brand bg-orange-50"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <Flex align="center" gap="3">
              <Box
                className={
                  selected === method.id ? "text-brand" : "text-neutral"
                }
              >
                {method.icon}
              </Box>
              <Box>
                <Text size="2" weight="bold" className="text-foreground">
                  {method.label}
                </Text>
                {method.description && (
                  <Text size="1" className="text-neutral block tracking-widest">
                    {method.description}
                  </Text>
                )}
              </Box>
            </Flex>
            {selected === method.id && (
              <CheckCircledIcon
                className="text-brand flex-shrink-0"
                width="18"
                height="18"
              />
            )}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
