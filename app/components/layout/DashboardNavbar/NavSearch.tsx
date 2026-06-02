"use client";

import type { KeyboardEvent, ReactElement } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function NavSearch(): ReactElement {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/stores?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <TextField.Root
      variant="soft"
      size="2"
      placeholder="Search for burgers, sushi, or pasta..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      className="flex-1 max-w-md !bg-gray-100 !rounded-full"
      aria-label="Search restaurants"
    >
      <TextField.Slot>
        <MagnifyingGlassIcon className="text-gray-400" width="16" height="16" />
      </TextField.Slot>
    </TextField.Root>
  );
}
