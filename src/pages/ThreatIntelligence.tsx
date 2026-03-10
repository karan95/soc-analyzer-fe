import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Paper, 
  Grid, 
  Stack,
  Progress,
  Table,
  Badge,
  ThemeIcon,
  RingProgress,
  Select,
  ActionIcon,
  Tooltip,
  Center,
  Loader
} from '@mantine/core';
import { 
  IconShieldX, 
  IconTarget,
  IconWorldWww,
  IconSearch,
  IconCalendarEvent
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalIntelligence } from '../hooks/useLogs';

// Safely calculate percentages so 0/0 doesn't crash the UI
const getPercent = (count: number, total: number) => {
  return total > 0 ? (count / total) * 100 : 0;
};

export default function ThreatIntelligence() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string | null>('7d');

  const { data, isLoading } = useGlobalIntelligence(timeRange);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  // Fallbacks in case the db is entirely empty
  const globalStats = data?.globalStats || { totalAnomalies: 0, criticalCount: 0, highCount: 0, mediumCount: 0 };
  const topMaliciousIPs = data?.topMaliciousIPs || [];
  const topTargetedUsers = data?.topTargetedUsers || [];

  return (
    <Container fluid px="xl" py="lg" w="100%">
      <Stack gap="xl">
        {/* PAGE HEADER WITH TIME FILTER */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2} fw={800}>Global Threat Intelligence</Title>
            <Text c="dimmed" size="sm" mt={4} maw={600}>
              Aggregated risk analysis across all ingested proxy and firewall logs.
            </Text>
          </div>
          <Select
            leftSection={<IconCalendarEvent size={16} />}
            value={timeRange}
            onChange={setTimeRange}
            data={[
              { value: '1h', label: 'Last 1 Hour' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
            w={180}
            fw={500}
          />
        </Group>

        {/* TOP LEVEL METRICS */}
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Group gap="sm" mb="md">
                <ThemeIcon color="red" variant="light" size="lg" radius="md">
                  <IconShieldX size={20} />
                </ThemeIcon>
                <Text fw={600}>Global Risk Posture</Text>
              </Group>
              <Group justify="center" mt="md">
                <RingProgress
                  size={120}
                  thickness={12}
                  roundCaps
                  sections={[
                    { value: getPercent(globalStats.criticalCount, globalStats.totalAnomalies), color: 'red' },
                    { value: getPercent(globalStats.highCount, globalStats.totalAnomalies), color: 'orange' },
                    { value: getPercent(globalStats.mediumCount, globalStats.totalAnomalies), color: 'yellow' },
                  ]}
                  label={
                    <Text ta="center" size="xs" fw={700} c="dimmed">
                      {globalStats.totalAnomalies} <br /> Threats
                    </Text>
                  }
                />
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Title order={4} mb="xl">Anomaly Severity Breakdown</Title>
              <Stack gap="sm">
                <div>
                  <Group justify="space-between" mb={5}>
                    <Text size="sm" fw={500}>Critical Threats</Text>
                    <Text size="sm" c="dimmed">{globalStats.criticalCount}</Text>
                  </Group>
                  <Progress value={getPercent(globalStats.criticalCount, globalStats.totalAnomalies)} color="red" size="lg" radius="xl" />
                </div>
                <div>
                  <Group justify="space-between" mb={5}>
                    <Text size="sm" fw={500}>High Threats</Text>
                    <Text size="sm" c="dimmed">{globalStats.highCount}</Text>
                  </Group>
                  <Progress value={getPercent(globalStats.highCount, globalStats.totalAnomalies)} color="orange" size="lg" radius="xl" />
                </div>
                <div>
                  <Group justify="space-between" mb={5}>
                    <Text size="sm" fw={500}>Medium Threats</Text>
                    <Text size="sm" c="dimmed">{globalStats.mediumCount}</Text>
                  </Group>
                  <Progress value={getPercent(globalStats.mediumCount, globalStats.totalAnomalies)} color="yellow" size="lg" radius="xl" />
                </div>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* DETAILED TABLES */}
        <Grid gutter="xl">
          {/* TOP MALICIOUS IPs */}
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Paper withBorder radius="md" shadow="sm" style={{ overflow: 'hidden' }} h="100%">
              <Group p="md" bg="var(--mantine-color-default-hover)" style={{ borderBottom: '1px solid var(--mantine-color-border)' }}>
                <IconWorldWww size={20} color="var(--mantine-color-red-6)" />
                <Title order={5}>Most Frequent Malicious Actors (Server IPs)</Title>
              </Group>
              <Table.ScrollContainer minWidth={500}>
                <Table p="md" verticalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Server IP</Table.Th>
                      <Table.Th>Primary Threat Type</Table.Th>
                      <Table.Th>Events</Table.Th>
                      <Table.Th>Max Severity</Table.Th>
                      <Table.Th ta="right">Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {topMaliciousIPs.map((row: any) => (
                      <Table.Tr key={row.ip}>
                        <Table.Td fw={600}><Text size="sm" ff="monospace">{row.ip}</Text></Table.Td>
                        <Table.Td><Text size="sm">{row.type}</Text></Table.Td>
                        <Table.Td>{row.occurrences}</Table.Td>
                        <Table.Td>
                          <Badge color={row.severity === 'critical' ? 'red' : row.severity === 'high' ? 'orange' : 'yellow'} variant="light">
                            {row.severity.toUpperCase()}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Tooltip label="Investigate IP Logs">
                            {/* Assuming you want to jump to the general logs history page */}
                            <ActionIcon 
                              variant="light" 
                              color="blue"
                              onClick={() => navigate(`/logs/${row.uploadId}?tab=raw&q=${encodeURIComponent(row.ip)}`)}
                            >
                              <IconSearch size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {topMaliciousIPs.length === 0 && (
                       <Table.Tr>
                          <Table.Td colSpan={5}><Text ta="center" py="sm" c="dimmed">No malicious IPs detected in this time range.</Text></Table.Td>
                       </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          </Grid.Col>

          {/* TOP TARGETED USERS */}
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Paper withBorder radius="md" shadow="sm" style={{ overflow: 'hidden' }} h="100%">
              <Group p="md" bg="var(--mantine-color-default-hover)" style={{ borderBottom: '1px solid var(--mantine-color-border)' }}>
                <IconTarget size={20} color="var(--mantine-color-orange-6)" />
                <Title order={5}>Most Targeted Users</Title>
              </Group>
              <Table.ScrollContainer minWidth={300}>
                <Table p="md" verticalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User Identifier</Table.Th>
                      <Table.Th>Department</Table.Th>
                      <Table.Th ta="right">Flagged Incidents</Table.Th>
                      <Table.Th ta="right">Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {topTargetedUsers.map((user: any) => (
                      <Table.Tr key={user.user}>
                        <Table.Td fw={600}><Text size="sm">{user.user}</Text></Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{user.department}</Text></Table.Td>
                        <Table.Td ta="right"><Badge color="red" variant="dot">{user.incidents}</Badge></Table.Td>
                        <Table.Td ta="right">
                          <Tooltip label="Investigate User Logs">
                            <ActionIcon 
                              variant="light" 
                              color="orange"
                              onClick={() => navigate(`/logs/${user.uploadId}?tab=raw&q=${encodeURIComponent(user.user)}`)}
                            >
                              <IconSearch size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {topTargetedUsers.length === 0 && (
                       <Table.Tr>
                          <Table.Td colSpan={4}><Text ta="center" py="sm" c="dimmed">No targeted users detected.</Text></Table.Td>
                       </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}