import type { ReactElement } from "react";
import { Box, Button, Flex, Text } from "@radix-ui/themes";

export default function DangerZone(): ReactElement {
  return (
    <Box className="bg-white rounded-2xl border border-red-200 p-5">
      <Flex justify="between" align="center">
        <Box>
          <Text
            size="4"
            weight="bold"
            className="text-red-600 font-accent block mb-1"
          >
            Deactivate Account
          </Text>
          <Text size="2" className="text-neutral block max-w-sm">
            Once you delete your account, there is no going back. Please be
            certain.
          </Text>
        </Box>
        <Button
          size="2"
          color="tomato"
          className="rounded-full flex-shrink-0 ml-6"
        >
          Delete Account
        </Button>
      </Flex>
    </Box>
  );
}
