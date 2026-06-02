import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Flex, IconButton, Text } from "@radix-ui/themes";
import {
  StarFilledIcon,
  ClockIcon,
  HeartIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

interface FeedRestaurantCardProps {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  priceLevel: number;
  badge?: string;
  badgeColor?: "green" | "orange" | "blue" | "tomato";
  image: string;
}

export default function FeedRestaurantCard({
  name,
  cuisine,
  rating,
  deliveryTime,
  priceLevel,
  badge,
  badgeColor = "green",
  image,
}: FeedRestaurantCardProps): ReactElement {
  return (
    <Box className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image */}
      <Box className="relative h-40">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        {badge && (
          <Box className="absolute top-2.5 left-2.5">
            <Badge color={badgeColor} variant="solid" size="1">
              {badge}
            </Badge>
          </Box>
        )}
        <Box className="absolute top-2.5 right-2.5">
          <IconButton
            size="1"
            variant="soft"
            className="!bg-white/90 !text-gray-500 !rounded-full"
            aria-label={`Save ${name}`}
          >
            <HeartIcon width="13" height="13" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box className="p-3">
        <Text size="2" weight="bold" className="block text-foreground">
          {name}
        </Text>
        <Text size="1" className="block text-neutral mt-0.5">
          {cuisine}
        </Text>

        <Flex align="center" justify="between" mt="2">
          <Flex align="center" gap="3">
            <Flex align="center" gap="1">
              <StarFilledIcon className="text-yellow-400" width="11" height="11" />
              <Text size="1" weight="medium" className="text-foreground">
                {rating}
              </Text>
            </Flex>
            <Flex align="center" gap="1">
              <ClockIcon className="text-neutral" width="11" height="11" />
              <Text size="1" className="text-neutral">
                {deliveryTime}
              </Text>
            </Flex>
            <Text size="1" className="text-neutral">
              {"$".repeat(priceLevel)}
            </Text>
          </Flex>
          <IconButton
            size="2"
            color="tomato"
            variant="solid"
            className="!rounded-full"
            aria-label={`Add ${name} to cart`}
          >
            <PlusIcon width="14" height="14" />
          </IconButton>
        </Flex>
      </Box>
    </Box>
  );
}
