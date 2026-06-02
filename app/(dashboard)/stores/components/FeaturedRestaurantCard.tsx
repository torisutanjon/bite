import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { StarFilledIcon, ClockIcon } from "@radix-ui/react-icons";

interface FeaturedRestaurantCardProps {
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  image: string;
  badge?: string;
}

export default function FeaturedRestaurantCard({
  name,
  description,
  rating,
  deliveryTime,
  image,
  badge,
}: FeaturedRestaurantCardProps): ReactElement {
  return (
    <Box className="relative overflow-hidden rounded-2xl h-full min-h-[280px]">
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 60vw"
        priority
      />
      {/* Gradient */}
      <Box className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {/* Promoted badge */}
      {badge && (
        <Box className="absolute top-4 left-4">
          <Badge color="tomato" variant="solid" size="1">
            {badge}
          </Badge>
        </Box>
      )}

      {/* Bottom content */}
      <Box className="absolute bottom-0 left-0 right-0 p-5">
        <Text size="5" weight="bold" className="block text-white leading-snug">
          {name}
        </Text>
        <Text size="2" className="block text-white/70 mt-1.5 line-clamp-2 max-w-xs">
          {description}
        </Text>
        <Flex gap="2" mt="3">
          <Flex
            align="center"
            gap="1"
            className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1"
          >
            <StarFilledIcon className="text-yellow-400" width="12" height="12" />
            <Text size="1" weight="medium" className="text-white">
              {rating}
            </Text>
          </Flex>
          <Flex
            align="center"
            gap="1"
            className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1"
          >
            <ClockIcon className="text-white/80" width="12" height="12" />
            <Text size="1" className="text-white">
              {deliveryTime}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
