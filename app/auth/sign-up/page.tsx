import type { ReactElement } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import SignUpForm from "./components/SignUpForm";

export const metadata = {
  title: "Create Account | BiteDash",
  description: "Create your BiteDash account and start ordering.",
};

export default function SignUpPage(): ReactElement {
  return (
    <Flex className="min-h-screen">
      {/* Left panel — replace Box with next/image once food photography is ready */}
      <Box
        className="hidden md:flex w-1/2 relative flex-col p-10 overflow-hidden"
        style={{ background: "#f5ede6" }}
      >
        {/* Bottom tagline card */}
        <Box className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <Heading
            size="7"
            weight="bold"
            className="mb-2 leading-snug text-stone-900"
          >
            Elevate your dining
            <br />
            experience.
          </Heading>
          <Text size="2" className="text-stone-600">
            Join BiteDash today and unlock access to the city&apos;s finest
            kitchens, delivered with surgical precision and modern style.
          </Text>
        </Box>
      </Box>

      {/* Right panel */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        className="flex-1 px-8 py-12"
      >
        <Box className="w-full max-w-md">
          <Heading size="4" weight="bold" color="red" mb="2">
            BiteDash
          </Heading>
          <Heading size="7" weight="bold" mb="1">
            Create your account
          </Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Join the dash for the best food in town.
          </Text>

          <SignUpForm />
        </Box>
      </Flex>
    </Flex>
  );
}
