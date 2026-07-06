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
    <Section size="4" className="bg-surface-alt">
      <Container size="4">
        <Box className="px-4">
          <Flex direction="column" align="center" className="text-center">
            <Text
              as="span"
              size="1"
              weight="medium"
              className="uppercase tracking-[0.2em] text-brand mb-2"
            >
              How it works
            </Text>
            <Heading
              size="7"
              weight="medium"
              align="center"
              className="tracking-tight text-secondary"
            >
              Simple, Fast, Delicious
            </Heading>
          </Flex>

          <Grid columns={{ initial: "1", sm: "3" }} gap="8" className="mt-14">
            {features.map((feature) => (
              <Flex
                key={feature.id}
                direction="column"
                align="center"
                className="text-center"
              >
                {/* Icon circle — restrained */}
                <Flex
                  align="center"
                  justify="center"
                  className="w-14 h-14 rounded-full bg-white text-brand shadow-sm ring-1 ring-neutral/10"
                >
                  {feature.icon}
                </Flex>

                <Heading size="4" weight="medium" mt="5" className="text-secondary">
                  {feature.title}
                </Heading>
                <Text size="2" className="text-neutral mt-2 leading-relaxed max-w-xs">
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
