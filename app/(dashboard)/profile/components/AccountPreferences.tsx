"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Box, Flex, Separator, Switch, Text } from "@radix-ui/themes";

interface Preference {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

const preferenceList: Preference[] = [
  {
    id: "marketing",
    label: "Marketing Emails",
    description: "Receive personalized offers and promotions.",
    defaultValue: true,
  },
  {
    id: "sms",
    label: "Order Tracking SMS",
    description: "Get real-time updates on your delivery.",
    defaultValue: true,
  },
  {
    id: "darkMode",
    label: "Dark Mode",
    description: "Toggle light and dark interface themes.",
    defaultValue: false,
  },
];

type PreferenceState = Record<string, boolean>;

const initialState: PreferenceState = Object.fromEntries(
  preferenceList.map((p) => [p.id, p.defaultValue])
);

export default function AccountPreferences(): ReactElement {
  const [prefs, setPrefs] = useState<PreferenceState>(initialState);

  function toggle(id: string, checked: boolean): void {
    setPrefs((prev) => ({ ...prev, [id]: checked }));
  }

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Text size="4" weight="bold" className="text-foreground font-accent block mb-4">
        Account Preferences
      </Text>

      <Flex direction="column" gap="0">
        {preferenceList.map((pref, index) => (
          <Box key={pref.id}>
            {index > 0 && <Separator size="4" my="3" />}
            <Flex justify="between" align="center">
              <Box>
                <Text size="2" weight="bold" className="text-foreground block">
                  {pref.label}
                </Text>
                <Text size="1" className="text-neutral block mt-0.5">
                  {pref.description}
                </Text>
              </Box>
              <Switch
                checked={prefs[pref.id]}
                onCheckedChange={(checked) => toggle(pref.id, checked)}
                color="tomato"
                className="flex-shrink-0 ml-4"
              />
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
