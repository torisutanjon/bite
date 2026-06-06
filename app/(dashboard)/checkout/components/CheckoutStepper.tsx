import type { ReactElement } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";

const steps = [
  { number: 1, label: "Address" },
  { number: 2, label: "Payment" },
  { number: 3, label: "Review" },
];

export default function CheckoutStepper({
  currentStep = 2,
}: {
  currentStep?: number;
}): ReactElement {
  return (
    <Flex align="center" justify="center" className="py-10">
      {steps.map((step, index) => {
        const isActive = step.number <= currentStep;
        const isLast = index === steps.length - 1;
        const nextIsActive = !isLast && steps[index + 1].number <= currentStep;

        return (
          <Flex key={step.number} align="center">
            <Flex direction="column" align="center" gap="1">
              <Flex
                align="center"
                justify="center"
                className={`w-9 h-9 rounded-full ${
                  isActive ? "bg-brand" : "bg-gray-200"
                }`}
              >
                <Text
                  size="2"
                  weight="bold"
                  className={isActive ? "text-white" : "text-gray-400"}
                >
                  {step.number}
                </Text>
              </Flex>
              <Text
                size="1"
                weight="medium"
                className={isActive ? "text-brand" : "text-neutral"}
              >
                {step.label}
              </Text>
            </Flex>
            {!isLast && (
              <Box
                className={`h-px w-24 mx-3 mb-5 ${
                  nextIsActive ? "bg-brand" : "bg-gray-200"
                }`}
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}
