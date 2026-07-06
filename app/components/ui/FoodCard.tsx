import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Text } from "@radix-ui/themes";

interface FoodCardProps {
  name: string;
  restaurant: string;
  badge?: string;
  badgeColor?: "orange" | "green" | "blue" | "amber" | "red";
  image: string;
}

export default function FoodCard({
  name,
  restaurant,
  badge,
  badgeColor = "green",
  image,
}: FoodCardProps): ReactElement {
  return (
    <Box className="relative w-48 flex-shrink-0 overflow-hidden rounded-2xl bg-white border border-neutral/15">
      {/* Image */}
      <Box className="relative h-52">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="192px"
        />
        {badge && (
          <Box className="absolute top-2 right-2">
            <Badge color={badgeColor} variant="solid" size="1" radius="full">
              {badge}
            </Badge>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box className="p-4">
        <Text size="2" weight="medium" className="block text-secondary leading-snug">
          {name}
        </Text>
        <Text size="1" className="text-neutral mt-1 block">
          {restaurant}
        </Text>
      </Box>
    </Box>
  );
}
