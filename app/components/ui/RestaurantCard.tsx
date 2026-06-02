import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { StarFilledIcon } from "@radix-ui/react-icons";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  badge?: string;
  badgeColor?: "orange" | "green" | "blue" | "amber" | "red";
  image: string;
  featured?: boolean;
}

export default function RestaurantCard({
  name,
  cuisine,
  rating,
  deliveryTime,
  badge,
  badgeColor = "orange",
  image,
  featured = false,
}: RestaurantCardProps): ReactElement {
  return (
    <Box
      className={`relative overflow-hidden rounded-2xl w-full ${
        featured ? "h-[380px]" : "h-[180px]"
      }`}
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover"
        sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "25vw"}
      />

      {/* Gradient overlay */}
      <Box className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Badge */}
      {badge && (
        <Box className="absolute top-3 left-3">
          <Badge color={badgeColor} variant="solid" size="1">
            {badge}
          </Badge>
        </Box>
      )}

      {/* Info */}
      <Box className="absolute bottom-0 left-0 right-0 p-4">
        <Text
          size={featured ? "4" : "2"}
          weight="bold"
          className="block text-white leading-snug"
        >
          {name}
        </Text>
        <Flex gap="2" align="center" mt="1" wrap="wrap">
          <Text size="1" className="text-white/70">
            {cuisine}
          </Text>
          <Box className="h-3 w-px bg-white/30" />
          <Flex align="center" gap="1">
            <StarFilledIcon
              className="text-yellow-400"
              width="11"
              height="11"
            />
            <Text size="1" weight="medium" className="text-white">
              {rating}
            </Text>
          </Flex>
          <Box className="h-3 w-px bg-white/30" />
          <Text size="1" className="text-white/70">
            {deliveryTime}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
