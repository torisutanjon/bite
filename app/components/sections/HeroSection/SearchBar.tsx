"use client";

import type { KeyboardEvent, ReactElement } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function SearchBar(): ReactElement {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSearch(): void {
    const trimmed = address.trim();
    if (trimmed) {
      router.push(`/stores?address=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <Flex
      align="center"
      className="mt-9 max-w-xl rounded-full bg-white p-1.5 shadow-lg"
    >
      <TextField.Root
        variant="soft"
        size="3"
        placeholder="Enter delivery address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 !bg-transparent !shadow-none !border-0 !outline-none !rounded-none"
        aria-label="Delivery address"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon
            className="text-gray-400"
            width="18"
            height="18"
          />
        </TextField.Slot>
      </TextField.Root>
      <Button
        size="2"
        color="tomato"
        onClick={handleSearch}
        className="rounded-full cursor-pointer"
        radius="full"
      >
        Find Food
      </Button>
    </Flex>
  );
}
