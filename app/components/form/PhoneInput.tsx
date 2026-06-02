"use client";

import type { ReactElement } from "react";
import { Box, Text, TextField } from "@radix-ui/themes";
import { MobileIcon } from "@radix-ui/react-icons";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  name?: string;
  id?: string;
}

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "+1 (555) 000-0000",
  name,
  id,
}: PhoneInputProps): ReactElement {
  return (
    <Box>
      <TextField.Root
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        name={name}
        id={id}
        size="2"
        color={error ? "red" : undefined}
      >
        <TextField.Slot>
          <MobileIcon />
        </TextField.Slot>
      </TextField.Root>
      {error && (
        <Text as="p" size="1" color="red" className="mt-1">
          {error}
        </Text>
      )}
    </Box>
  );
}
