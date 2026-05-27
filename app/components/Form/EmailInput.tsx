"use client";

import type { ReactElement } from "react";
import { Box, Text, TextField } from "@radix-ui/themes";
import { EnvelopeClosedIcon } from "@radix-ui/react-icons";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  name?: string;
  id?: string;
}

export default function EmailInput({
  value,
  onChange,
  onBlur,
  error,
  placeholder = "name@example.com",
  name,
  id,
}: EmailInputProps): ReactElement {
  return (
    <Box>
      <TextField.Root
        type="email"
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
          <EnvelopeClosedIcon />
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
