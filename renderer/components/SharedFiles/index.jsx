import {
  Divider,
  Text,
  createStyles,
  Card,
  Group,
  Avatar,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },
}));

export default function SharedFiles() {
    const { classes } = useStyles();

    return (
      <>
        <Text size="xl" weight={500} mb={15}>
          Sent Files:
        </Text>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <Card withBorder padding="lg" radius="md" className={classes.card}>
            <div className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card">
              Hello World
            </div>

            <Group mt="lg">
              <Avatar
                src={"https://avatars.githubusercontent.com/u/45114019?v=4"}
                radius="sm"
              />
              <div>
                <Text fz="xs" c="dimmed">
                  Sent to:
                </Text>
                <Text fw={500}>Lebyy</Text>
                <Text fz="xs" c="dimmed">
                  lebyy@lebyy.me
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder padding="lg" radius="md" className={classes.card}>
            <div className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card">
              Hello World
            </div>

            <Group mt="lg">
              <Avatar
                src={"https://avatars.githubusercontent.com/u/45114019?v=4"}
                radius="sm"
              />
              <div>
                <Text fz="xs" c="dimmed">
                  Sent to:
                </Text>
                <Text fw={500}>Lebyy</Text>
                <Text fz="xs" c="dimmed">
                  lebyy@lebyy.me
                </Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="lg" radius="md" className={classes.card}>
            <div className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card">
              Hello World
            </div>

            <Group mt="lg">
              <Avatar
                src={"https://avatars.githubusercontent.com/u/45114019?v=4"}
                radius="sm"
              />
              <div>
                <Text fz="xs" c="dimmed">
                  Sent to:
                </Text>
                <Text fw={500}>Lebyy</Text>
                <Text fz="xs" c="dimmed">
                  lebyy@lebyy.me
                </Text>
              </div>
            </Group>
          </Card>
        </div>

        <Divider mb={15} />

        <Text size="xl" weight={500} mb={15}>
          Received Files:
        </Text>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <Card withBorder padding="lg" radius="md" className={classes.card}>
            <div className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card">
              Hello World
            </div>

            <Group mt="lg">
              <Avatar
                src={"https://avatars.githubusercontent.com/u/45114019?v=4"}
                radius="sm"
              />
              <div>
                <Text fz="xs" c="dimmed">
                  Received from:
                </Text>
                <Text fw={500}>Lebyy</Text>
                <Text fz="xs" c="dimmed">
                  lebyy@lebyy.me
                </Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="lg" radius="md" className={classes.card}>
            <div className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card">
              Hello World
            </div>

            <Group mt="lg">
              <Avatar
                src={"https://avatars.githubusercontent.com/u/45114019?v=4"}
                radius="sm"
              />
              <div>
                <Text fz="xs" c="dimmed">
                  Received from:
                </Text>
                <Text fw={500}>Lebyy</Text>
                <Text fz="xs" c="dimmed">
                  lebyy@lebyy.me
                </Text>
              </div>
            </Group>
          </Card>
          <Card withBorder padding="lg" radius="md" className={classes.card}>
            <div className="flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800 card">
              Hello World
            </div>

            <Group mt="lg">
              <Avatar
                src={"https://avatars.githubusercontent.com/u/45114019?v=4"}
                radius="sm"
              />
              <div>
                <Text fz="xs" c="dimmed">
                  Received from:
                </Text>
                <Text fw={500}>Lebyy</Text>
                <Text fz="xs" c="dimmed">
                  lebyy@lebyy.me
                </Text>
              </div>
            </Group>
          </Card>
        </div>
      </>
    );
};