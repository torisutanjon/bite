"use client";

import type { ReactElement, ReactNode } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";

type RadixButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface ButtonWithLoadingProps extends Omit<RadixButtonProps, "disabled"> {
  isLoading: boolean;
  children: ReactNode;
}

export default function ButtonWithLoading({
  isLoading,
  children,
  ...props
}: ButtonWithLoadingProps): ReactElement {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading && <ReloadIcon className="animate-spin" />}
      {children}
    </Button>
  );
}
