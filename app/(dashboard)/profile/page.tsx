import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import SettingsSidebar from "./components/SettingsSidebar";
import ProfilePicture from "./components/ProfilePicture";
import PersonalInfo from "./components/PersonalInfo";
import AccountPreferences from "./components/AccountPreferences";
import DangerZone from "./components/DangerZone";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
  title: "BiteDash | Settings",
  description: "Manage your profile and account preferences.",
};

export default function SettingsPage(): ReactElement {
  return (
    <>
      <Box className="min-h-screen bg-surface-alt">
        <Container size="4">
          <Box className="px-4 py-8">
            <Flex gap="5" align="start">
              <SettingsSidebar activePage="profile" />

              <Flex direction="column" gap="4" className="flex-1 min-w-0">
                {/* Header */}
                <Box>
                  <Heading
                    size="6"
                    weight="bold"
                    className="font-accent text-foreground"
                  >
                    Profile Settings
                  </Heading>
                  <Text size="2" className="text-neutral block mt-1">
                    Manage your personal information and account preferences.
                  </Text>
                </Box>

                <ProfilePicture />
                <PersonalInfo />
                <AccountPreferences />
                <DangerZone />
              </Flex>
            </Flex>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
