"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Box, IconButton, Text, TextField } from "@radix-ui/themes";
import {
  EyeNoneIcon,
  EyeOpenIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  name?: string;
  id?: string;
}

export default function PasswordInput({
  value,
  onChange,
  error,
  placeholder = "••••••••",
  name,
  id,
}: PasswordInputProps): ReactElement {
  const [show, setShow] = useState(false);

  return (
    <Box>
      <TextField.Root
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        name={name}
        id={id}
        size="2"
        color={error ? "red" : undefined}
      >
        <TextField.Slot>
          <LockClosedIcon />
        </TextField.Slot>
        <TextField.Slot side="right">
          <IconButton
            type="button"
            variant="ghost"
            color="gray"
            size="1"
            onClick={() => setShow((prev) => !prev)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeNoneIcon /> : <EyeOpenIcon />}
          </IconButton>
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
