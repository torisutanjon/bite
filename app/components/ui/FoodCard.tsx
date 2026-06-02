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
    <Box className="relative w-48 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
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
            <Badge color={badgeColor} variant="solid" size="1">
              {badge}
            </Badge>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box className="p-3">
        <Text
          size="2"
          weight="bold"
          className="block text-gray-900 leading-snug"
        >
          {name}
        </Text>
        <Text size="1" className="text-gray-500 mt-0.5 block">
          {restaurant}
        </Text>
      </Box>
    </Box>
  );
}
