import type { ReactElement } from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import LoginForm from "./components/LoginForm";

export const metadata = {
  title: "Sign In | BiteDash",
  description: "Sign in to your BiteDash account.",
};

export default function LoginPage(): ReactElement {
  return (
    <Flex className="min-h-screen">
      {/* Left panel — swap Box for next/image once food photography is ready */}
      <Box
        className="hidden md:flex w-1/2 flex-col justify-between p-10 text-white overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #2c1810 0%, #1a0d07 100%)",
        }}
      >
        <Heading size="5" weight="bold">
          BiteDash
        </Heading>
        <Box>
          <Heading size="7" weight="bold" className="mb-3 leading-snug">
            Your cravings, delivered
            <br />
            with speed and style.
          </Heading>
          <Text size="3" className="text-white/70">
            Join thousands of foodies enjoying the freshest bites
            <br />
            from top-rated local restaurants.
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
          <Heading size="7" weight="bold" mb="1">
            Welcome back
          </Heading>
          <Text as="p" size="2" color="gray" mb="6">
            Please enter your details to sign in.
          </Text>

          <LoginForm />
        </Box>
      </Flex>
    </Flex>
  );
}
