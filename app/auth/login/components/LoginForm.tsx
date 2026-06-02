"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import Link from "next/link";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import {
  ButtonWithLoading,
  EmailInput,
  PasswordInput,
} from "@/app/components/form";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 814 1000"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 390.7 43.3 190.9 98.1 124.3c38.8-46.5 98.3-75.3 160.7-75.3 54.9 0 100.1 36 133.7 36 31.7 0 81.7-38.5 144.1-38.5 23.3 0 108.2 2.6 168.3 90.7zm-180.3-140.9C580.4 160 578 99 578 97.6c.6-.6 1.2-.6 1.8-.6 28.4 2.6 89.7 37.2 128.5 79.1 33.3 35.9 63.7 94.6 63.7 153.3 0 1.3-.6 2.6-1.2 3.9-3.2.6-6.4 1.3-9.7 1.3-27.2 0-83.4-31-121.8-74.6z" />
    </svg>
  );
}

export default function LoginForm(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleEmailBlur(): void {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsLoading(true);

    try {
      // TODO: replace with Supabase sign-in
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap="4">
          <Box>
            <Text
              as="label"
              htmlFor="email"
              size="2"
              weight="medium"
              className="mb-1 block"
            >
              Email Address
            </Text>
            <EmailInput
              id="email"
              name="email"
              value={email}
              onChange={setEmail}
              onBlur={handleEmailBlur}
              error={emailError}
            />
          </Box>

          <Box>
            <Flex justify="between" align="center" className="mb-1">
              <Text as="label" htmlFor="password" size="2" weight="medium">
                Password
              </Text>
              <Link href="/auth/forgot-password">
                <Text size="2" color="red">
                  Forgot Password?
                </Text>
              </Link>
            </Flex>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={setPassword}
            />
          </Box>

          <ButtonWithLoading
            isLoading={isLoading}
            type="submit"
            variant="solid"
            color="red"
            size="3"
            className="w-full"
          >
            Sign In
          </ButtonWithLoading>
        </Flex>
      </form>

      <Flex align="center" gap="3" my="5">
        <Box className="flex-1 h-px bg-gray-200" />
        <Text size="1" color="gray">
          Or continue with
        </Text>
        <Box className="flex-1 h-px bg-gray-200" />
      </Flex>

      <Flex gap="3" justify="center">
        <Button variant="outline" color="gray" size="3">
          <GoogleIcon />
          Google
        </Button>
        <Button variant="outline" color="gray" size="3">
          <AppleIcon />
          Apple
        </Button>
      </Flex>

      <Text as="p" size="2" align="center" className="mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up">
          <Text size="2" color="red">
            Sign up
          </Text>
        </Link>
      </Text>
    </>
  );
}
