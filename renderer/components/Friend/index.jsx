import {
  Avatar,
  Text,
  Paper,
  Container,
  useMantineTheme,
  rem,
} from "@mantine/core";
const PRIMARY_COL_HEIGHT = rem(300);

import UploadFriend from "../UploadFriend";

export default function Friend({ friend }) {
  const theme = useMantineTheme();
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - ${theme.spacing.md} / 2)`;

  return (
    <Container my="md">
      <Paper
        radius="md"
        withBorder
        p="lg"
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        })}
      >
        <Avatar src={friend.profileURL} size={120} radius={120} mx="auto" />
        <Text ta="center" fz="lg" weight={500} mt="md">
          {friend.name}
        </Text>
        <Text ta="center" c="dimmed" fz="sm">
          {friend.email}
        </Text>

        <UploadFriend friendEmail={friend.email} height={SECONDARY_COL_HEIGHT} />
      </Paper>
    </Container>
  );
}
