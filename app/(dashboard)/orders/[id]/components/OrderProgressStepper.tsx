import type { ReactElement, Fragment as FragmentType } from "react";
import { Fragment } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { CheckIcon, HomeIcon } from "@radix-ui/react-icons";

function DeliveryRiderIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
    </svg>
  );
}

type StepIcon = "check" | "rider" | "home";

interface Step {
  id: string;
  label: string;
  icon: StepIcon;
  completed: boolean;
  current: boolean;
}

const steps: Step[] = [
  { id: "received", label: "Order Received", icon: "check", completed: true, current: false },
  { id: "preparing", label: "Preparing", icon: "check", completed: true, current: false },
  { id: "delivery", label: "Out for Delivery", icon: "rider", completed: false, current: true },
  { id: "arrived", label: "Arrived", icon: "home", completed: false, current: false },
];

export default function OrderProgressStepper({ orderId }: { orderId: string }): ReactElement {
  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
      {/* Header */}
      <Flex justify="between" align="center" mb="5">
        <Text size="5" weight="bold" className="text-foreground font-accent">
          Order Tracking #{orderId}
        </Text>
        <Flex align="center" gap="2">
          <Box className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <Text size="2" className="text-foreground">Live Tracking</Text>
        </Flex>
      </Flex>

      {/* Steps */}
      <Flex align="start" className="w-full">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isLineActive = step.completed || step.current;

          return (
            <Fragment key={step.id}>
              <Flex direction="column" align="center" gap="1" className="flex-shrink-0">
                <Flex
                  align="center"
                  justify="center"
                  className={`w-10 h-10 rounded-full ${
                    step.completed || step.current
                      ? "bg-brand text-white"
                      : "bg-gray-100 text-neutral"
                  }`}
                >
                  {step.icon === "check" && <CheckIcon width="16" height="16" />}
                  {step.icon === "rider" && <DeliveryRiderIcon />}
                  {step.icon === "home" && <HomeIcon width="16" height="16" />}
                </Flex>
                <Text
                  size="1"
                  weight={step.current ? "bold" : "regular"}
                  className={`whitespace-nowrap ${
                    step.completed || step.current ? "text-brand" : "text-neutral"
                  }`}
                >
                  {step.label}
                </Text>
              </Flex>

              {!isLast && (
                <Box
                  className={`flex-1 h-0.5 mt-5 mx-2 ${
                    isLineActive ? "bg-brand" : "bg-gray-200"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </Flex>
    </Box>
  );
}
