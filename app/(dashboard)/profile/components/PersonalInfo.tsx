"use client";

import type { ReactElement, ChangeEvent } from "react";
import { useState } from "react";
import { Box, Flex, Grid, Text, TextField } from "@radix-ui/themes";

function EditIcon(): ReactElement {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function GlobeIcon(): ReactElement {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

type InputType = "text" | "email" | "tel";

interface FieldData {
  id: string;
  label: string;
  value: string;
  type: InputType;
  editable: boolean;
}

const initialFields: FieldData[] = [
  { id: "name", label: "FULL NAME", value: "Alex Chen", type: "text", editable: true },
  { id: "email", label: "EMAIL ADDRESS", value: "alex.chen@design.com", type: "email", editable: true },
  { id: "phone", label: "PHONE NUMBER", value: "+1 (555) 000-1234", type: "tel", editable: true },
  { id: "language", label: "LANGUAGE & REGION", value: "English (US)", type: "text", editable: false },
];

export default function PersonalInfo(): ReactElement {
  const [fields, setFields] = useState<FieldData[]>(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleEdit(id: string): void {
    setEditingId(id);
  }

  function handleChange(id: string, value: string): void {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  }

  function handleBlur(): void {
    setEditingId(null);
  }

  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Grid columns="2" gap="3">
        {fields.map((field) => {
          const isEditing = editingId === field.id;
          return (
            <Box
              key={field.id}
              className="bg-gray-50 rounded-xl p-4"
            >
              <Text
                size="1"
                className="text-neutral block mb-1.5 tracking-wide uppercase font-medium"
              >
                {field.label}
              </Text>

              {isEditing ? (
                <TextField.Root
                  autoFocus
                  type={field.type}
                  value={field.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(field.id, e.target.value)
                  }
                  onBlur={handleBlur}
                  size="2"
                  variant="soft"
                  className="!bg-white !text-foreground"
                />
              ) : (
                <Flex justify="between" align="center">
                  <Text size="3" weight="bold" className="text-foreground">
                    {field.value}
                  </Text>
                  {field.editable ? (
                    <Box
                      className="text-brand cursor-pointer hover:opacity-75 transition-opacity flex-shrink-0 ml-2"
                      onClick={() => handleEdit(field.id)}
                    >
                      <EditIcon />
                    </Box>
                  ) : (
                    <Box className="text-neutral flex-shrink-0 ml-2">
                      <GlobeIcon />
                    </Box>
                  )}
                </Flex>
              )}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}
