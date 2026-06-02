import type { ReactElement } from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import {
  CookieIcon,
  CardStackIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";

const features = [
  {
    id: "discover",
    icon: <CookieIcon width="24" height="24" aria-hidden="true" />,
    title: "Discover Your Craving",
    description:
      "Explore thousands of menus from the best local restaurants and unique local Markets.",
  },
  {
    id: "checkout",
    icon: <CardStackIcon width="24" height="24" aria-hidden="true" />,
    title: "Seamless Checkout",
    description:
      "Pay securely with Apple Pay, Google Pay, or your saved cards in just one tap.",
  },
  {
    id: "delivery",
    icon: <LightningBoltIcon width="24" height="24" aria-hidden="true" />,
    title: "Lightning Delivery",
    description:
      "Track your dash in real-time. Your meal travels from the kitchen to your table.",
  },
];

export default function FeaturesSection(): ReactElement {
  return (
    <Section size="3" className="bg-surface-alt">
      <Container size="4">
        <Box className="px-4">
          <Heading size="7" align="center" weight="bold">
            Simple, Fast, Delicious
          </Heading>

          <Grid columns={{ initial: "1", sm: "3" }} gap="8" className="mt-12">
            {features.map((feature) => (
              <Flex
                key={feature.id}
                direction="column"
                align="center"
                className="text-center"
              >
                {/* Icon circle */}
                <Flex
                  align="center"
                  justify="center"
                  className="w-16 h-16 rounded-full bg-orange-100 text-brand"
                >
                  {feature.icon}
                </Flex>

                <Heading size="4" weight="bold" mt="4">
                  {feature.title}
                </Heading>
                <Text size="2" className="text-gray-500 mt-2 leading-relaxed">
                  {feature.description}
                </Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      </Container>
    </Section>
  );
}
