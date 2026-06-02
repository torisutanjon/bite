"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Button, Flex } from "@radix-ui/themes";

const TABS = [
  { id: "appetizers", label: "Appetizers" },
  { id: "mains", label: "Mains" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
] as const;

export default function MenuTabs(): ReactElement {
  const [activeTab, setActiveTab] = useState<string>("appetizers");

  function handleTabClick(tabId: string): void {
    setActiveTab(tabId);
    document
      .getElementById(tabId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Flex gap="2" wrap="wrap">
      {TABS.map(({ id, label }) => (
        <Button
          key={id}
          size="2"
          variant={activeTab === id ? "solid" : "soft"}
          color={activeTab === id ? "tomato" : "gray"}
          onClick={() => handleTabClick(id)}
          className="rounded-full"
        >
          {label}
        </Button>
      ))}
    </Flex>
  );
}
