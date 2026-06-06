"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Button, Flex, Text } from "@radix-ui/themes";

function CameraIcon(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
    </svg>
  );
}

export default function ProfilePicture(): ReactElement {
  return (
    <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <Flex align="center" gap="5">
        {/* Avatar with camera overlay */}
        <Box className="relative flex-shrink-0">
          <Box className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50">
            <Image
              src="https://picsum.photos/seed/alexchenfull/200/200"
              alt="Alex Chen"
              fill
              className="object-cover"
            />
          </Box>
          {/* Camera button */}
          <Flex
            align="center"
            justify="center"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand text-white shadow-md cursor-pointer hover:bg-brand/90 transition-colors border-2 border-white"
          >
            <CameraIcon />
          </Flex>
        </Box>

        {/* Info + actions */}
        <Box>
          <Text size="3" weight="bold" className="text-foreground block mb-1">
            Profile Picture
          </Text>
          <Text size="2" className="text-neutral block mb-3">
            JPG, GIF or PNG. Max size of 800K.
          </Text>
          <Flex align="center" gap="3">
            <Button size="2" color="tomato" className="rounded-full">
              Upload New Photo
            </Button>
            <Text
              size="2"
              className="text-neutral cursor-pointer hover:text-foreground transition-colors"
            >
              Remove
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
