"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Button, Flex } from "@radix-ui/themes";

const TABS = [
  { id: "all", label: "All" },
  { id: "fast-delivery", label: "Fast Delivery" },
  { id: "top-rated", label: "Top Rated" },
  { id: "under-10", label: "Under $10" },
] as const;

export default function FilterTabs(): ReactElement {
  const [activeTab, setActiveTab] = useState<string>("all");

  return (
    <Flex gap="2" wrap="wrap">
      {TABS.map(({ id, label }) => (
        <Button
          key={id}
          size="2"
          variant={activeTab === id ? "solid" : "outline"}
          color={activeTab === id ? "tomato" : "gray"}
          onClick={() => setActiveTab(id)}
          className="rounded-full"
        >
          {label}
        </Button>
      ))}
    </Flex>
  );
}
