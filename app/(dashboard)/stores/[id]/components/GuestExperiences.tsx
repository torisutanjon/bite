import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { StarFilledIcon } from "@radix-ui/react-icons";

const reviews = [
  {
    id: "1",
    name: "Sarah J.",
    rating: 5,
    avatar: "https://picsum.photos/seed/sarahjreview/100/100",
    review:
      "The Wagyu burger was absolutely divine. Best delivery experience I've had in a long time. Arrived hot and perfectly cooked!",
  },
  {
    id: "2",
    name: "Michael Chen",
    rating: 4,
    avatar: "https://picsum.photos/seed/michelchenrev/100/100",
    review:
      "Excellent scallops. Presentation was still great despite being delivered. A bit on the pricey side but well worth it.",
  },
];

function StarRating({ rating }: { rating: number }): ReactElement {
  return (
    <Flex gap="0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarFilledIcon
          key={i}
          width="12"
          height="12"
          className={i < rating ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </Flex>
  );
}

export default function GuestExperiences(): ReactElement {
  return (
    <Box>
      <Heading size="4" weight="bold" mb="4">
        Guest Experiences
      </Heading>
      <Flex
        gap="4"
        className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <Box
            key={review.id}
            className="bg-indigo-50 rounded-2xl p-4 min-w-[260px] max-w-[300px] flex-shrink-0"
          >
            <Flex gap="3" align="center" mb="3">
              <Box className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </Box>
              <Box>
                <Text size="2" weight="bold" className="text-foreground block">
                  {review.name}
                </Text>
                <StarRating rating={review.rating} />
              </Box>
            </Flex>
            <Text size="1" className="text-neutral leading-relaxed block">
              &ldquo;{review.review}&rdquo;
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
