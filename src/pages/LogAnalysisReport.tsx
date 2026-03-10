import { useState, useEffect, useMemo, memo } from 'react';
import { 
  Box, Title, Text, Group, Paper, Badge, Stack, Grid, RingProgress,
  Button, ThemeIcon, Code, Tabs, Timeline, Collapse, Center, Loader,
  SegmentedControl, Alert, Select, TextInput 
} from '@mantine/core';
import { 
  IconArrowLeft, IconBrain, IconShieldLock, IconServer, IconChevronDown,
  IconChevronUp, IconListDetails, IconClock,
  IconAlertCircle, IconExternalLink, IconUser, IconFilter, IconSearch, IconSortAscending 
} from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import RawLogExplorer from '../components/RawLogExplorer'; 
import { useDebouncedCallback } from "@mantine/hooks";
import { useLogAnalysis, useLogEventsInfinite } from '../hooks/useLogs';

// Helper to determine severity colors
const getSeverityColor = (severity?: any) => {
  if (!severity || typeof severity !== 'string') return 'gray';
  const s = severity.toLowerCase().trim();
  if (s === 'critical') return 'red';
  if (s === 'high') return 'orange';
  if (s === 'medium') return 'yellow';
  if (s === 'low') return 'blue';
  return 'gray';
};

// Helper to extract email
const extractUser = (desc: string) => {
  const match = desc?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  return match ? match[1] : 'Unknown User';
};

const IsolatedTimelineSearch = ({
  onSearchChange,
}: {
  onSearchChange: (val: string) => void;
}) => {
  const [value, setValue] = useState('');

  // Debounce the call to the parent component
  const debouncedPush = useDebouncedCallback((val: string) => {
    onSearchChange(val);
  }, 400);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setValue(val);
    debouncedPush(val);
  };

  return (
    <TextInput 
      placeholder="Search by IP Address..." 
      leftSection={<IconSearch size={16} />}
      value={value}
      onChange={handleChange}
      w={{ base: '100%', sm: 200 }}
      size="sm"
    />
  );
};

// ==========================================
// Timeline Item
// ==========================================
const AnomalyTimelineItem = memo(({ anomaly, jumpToRawLog }: { anomaly: any, jumpToRawLog: (url: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isPending = !anomaly.severity || String(anomaly.severity).toLowerCase() === 'pending';
  const targetUser = extractUser(anomaly.description);

  return (
    <Timeline.Item 
      key={anomaly.id} 
      bullet={<IconShieldLock size={12} />} 
      title={
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Badge color={getSeverityColor(anomaly.severity)} variant={isPending ? 'outline' : 'filled'}>
              {String(anomaly.severity || 'PENDING').toUpperCase()}
            </Badge>
            <Text fw={700} size="lg">{anomaly.category || 'Threat Alert'}</Text>
          </Group>
          {!isPending && anomaly.confidenceScore !== null && anomaly.confidenceScore !== undefined && (
            <Group gap="xs" mr="md" visibleFrom="xs">
              <Text size="xs" c="dimmed" fw={600}>CONFIDENCE</Text>
              <Text size="sm" fw={800} c={getSeverityColor(anomaly.severity)}>
                {anomaly.confidenceScore}%
              </Text>
              <RingProgress
                size={28} thickness={4} roundCaps
                sections={[{ value: anomaly.confidenceScore, color: getSeverityColor(anomaly.severity) }]}
              />
            </Group>
          )}
        </Group>
      }
      color={getSeverityColor(anomaly.severity)}
    >
      <Text size="sm" mt={4}>{anomaly.description || ''}</Text>
      <Text c="dimmed" size="xs" mt={4} mb="sm">
        {anomaly.timestamp ? new Date(anomaly.timestamp).toLocaleString() : 'Unknown Time'}
      </Text>
      
      <Group gap="sm" mb="sm">
        <Button 
          variant="subtle" size="xs" color="gray"
          onClick={() => setIsExpanded(!isExpanded)}
          rightSection={isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
        </Button>
        {anomaly.url && (
          <Button 
            variant="subtle" size="xs" color="blue"
            onClick={() => jumpToRawLog(anomaly.url || anomaly.clientIp)}
            leftSection={<IconExternalLink size={14} />}
          >
            View in Raw Logs
          </Button>
        )}
      </Group>

      <Collapse in={isExpanded}>
        <Paper withBorder p="md" bg="var(--mantine-color-default-hover)" radius="sm" mb="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Stack gap="md">
                <Box>
                  <Group gap="xs" mb="xs">
                    <IconServer size={16} color="var(--mantine-color-blue-6)" />
                    <Text size="sm" fw={700}>AI Forensic Reasoning</Text>
                  </Group>
                  <Text size="sm" lh={1.5} fs={isPending ? 'italic' : 'normal'} c={isPending ? 'dimmed' : 'text'}>
                    {anomaly.reasoning || "Forensic analysis is currently running. Please wait..."}
                  </Text>
                  {anomaly.url && (
                    <Code color="dark" mt="sm" style={{ display: 'block', padding: '8px' }}>
                      Target: {anomaly.url}
                    </Code>
                  )}
                </Box>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Stack align="flex-start" justify="flex-start" h="100%" gap="md">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" size="sm" color="gray"><IconUser size={12} /></ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} style={{ lineHeight: 1 }}>USER ENTITY</Text>
                    <Text size="sm" fw={500} lineClamp={1}>{targetUser}</Text>
                    <Text size="xs" ff="monospace" c="dimmed">{anomaly.clientIp || 'Unknown IP'}</Text>
                  </Box>
                </Group>

                <Group gap="xl">
                  <Box>
                    <Text size="xs" c="dimmed" fw={700} mb={4}>ACTION TAKEN</Text>
                    <Badge color={anomaly.action === 'Blocked' ? 'red' : 'yellow'} variant="light">
                      {anomaly.action || 'Unknown'}
                    </Badge>
                  </Box>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      </Collapse>
    </Timeline.Item>
  );
});


// ==========================================
// MAIN COMPONENT
// ==========================================
export default function LogAnalysisReport() {
  const navigate = useNavigate();
  const { jobId } = useParams(); 
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'insights';
  
  const [sortBy, setSortBy] = useState<string>('severity'); 
  const [severityFilter, setSeverityFilter] = useState<string | null>('all'); 
  
  // Debounced IP Search to prevent API spam while typing
  const [searchIp, setSearchIp] = useState<string>('');

  const { data: report, isLoading: isReportLoading, isError: isReportError } = useLogAnalysis(jobId);

  const { 
    data: eventsData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isFetching 
  } = useLogEventsInfinite(jobId, true, sortBy, searchIp, severityFilter);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const anomalies = useMemo(() => {
    if (!eventsData || !Array.isArray(eventsData.pages)) return [];
    return eventsData.pages.reduce((acc: any[], page: any) => {
      if (page && Array.isArray(page.data)) {
        return acc.concat(page.data);
      }
      return acc;
    }, []);
  }, [eventsData]);

  const detectVelocity = (events: any[]) => {
    if (events.length < 3) return null;
    const firstTime = new Date(events[0].timestamp).getTime();
    const lastTime = new Date(events[events.length - 1].timestamp).getTime();
    const diffInSeconds = Math.abs((lastTime - firstTime) / 1000);
    if (diffInSeconds <= 120) {
      return `${events.length} events in ${Math.round(diffInSeconds)} seconds`;
    }
    return null;
  };

  const handleTabChange = (value: string | null) => {
    setSearchParams((prev) => {
      if (value) prev.set('tab', value);
      else prev.delete('tab');
      if (value !== 'raw') prev.delete('q'); 
      return prev;
    });
  };

  const jumpToRawLog = (searchTerm: string) => {
    setSearchParams((prev) => {
      prev.set('tab', 'raw');
      if (searchTerm) prev.set('q', searchTerm); 
      return prev;
    });
  };

  if (isReportLoading) return <Center h="100vh"><Loader size="xl" /></Center>;
  if (isReportError || !report) return <Center h="100vh"><Text c="red">Failed to load analysis report.</Text></Center>;

  const { analysis, filename, timestamp, status, stats } = report;
  const totalAnomalies = stats?.totalAnomalies ?? anomalies.length;
  const highestSeverity = stats?.highestSeverity ?? 'Pending';
  const velocityWarning = sortBy === 'time' ? detectVelocity(anomalies) : null;

  return (
    <Box w="100%" maw="100%" p={{ base: 'md', md: 'xl' }}>
      <Stack gap="xl" w="100%">
        {/* HEADER */}
        <div>
          <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/logs')} px={0} mb="sm">
            Back to Logs
          </Button>
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2} fw={800}>{filename}</Title>
              <Group gap="sm" mt="xs">
                <Text c="dimmed" size="sm">Job ID: {jobId}</Text>
                <Text c="dimmed" size="sm">•</Text>
                <Text c="dimmed" size="sm">Processed: {new Date(timestamp).toLocaleString()}</Text>
              </Group>
            </div>
            <Badge color={status === 'completed' ? 'green' : 'blue'} size="lg" variant="light">
              {status === 'completed' ? 'Analysis Complete' : 'Processing...'}
            </Badge>
          </Group>
        </div>

        <Tabs value={activeTab} onChange={handleTabChange} color="blue" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="insights" leftSection={<IconBrain size={16} />}>AI Insights & Alerts</Tabs.Tab>
            <Tabs.Tab value="raw" leftSection={<IconListDetails size={16} />}>Raw Log Explorer</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="insights">
            <Box maw={1200} mx="auto" w="100%" pt="md">
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Paper withBorder shadow="sm" radius="md" p="xl" h="100%">
                    <Group gap="sm" mb="md">
                      <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                        <IconBrain size={20} />
                      </ThemeIcon>
                      <Title order={4}>Threat Triage Summary</Title>
                    </Group>
                    <Text size="md" lh={1.6}>{analysis?.summary || "Summary pending..."}</Text>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper withBorder shadow="sm" radius="md" p="xl" h="100%" bg="var(--mantine-color-default-hover)">
                    <Title order={4} mb="lg">Threat Overview</Title>
                    <Group justify="space-between" mb="sm">
                      <Text c="dimmed" fw={500}>Total Alerts</Text>
                      <Badge size="lg" color="red" variant="filled">{totalAnomalies}</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text c="dimmed" fw={500}>Highest Severity</Text>
                      <Badge size="lg" color={getSeverityColor(highestSeverity)} variant="outline">
                        {String(highestSeverity || 'Pending').toUpperCase()}
                      </Badge>
                    </Group>
                  </Paper>
                </Grid.Col>
              </Grid>

              {status === 'processing' && (
                <Alert icon={<IconAlertCircle size={16} />} title="Analysis in Progress" color="blue" mt="xl">
                  The AI is actively analyzing the threats. The timeline will update automatically.
                </Alert>
              )}

              {/* FILTER AND SORT BAR */}
              <Paper withBorder p="sm" radius="md" mt="xl" mb="xl" bg="var(--mantine-color-body)">
                <Group justify="space-between" align="center">
                  <Group gap="sm" align="center">
                    <IconShieldLock size={24} color="var(--mantine-color-red-6)" />
                    <Title order={3} fw={700}>Security Alerts Timeline</Title>
                    {isFetching && <Loader size="xs" color="gray" ml="sm" />}
                  </Group>
                  
                  <Group gap="md">
                    <IsolatedTimelineSearch onSearchChange={setSearchIp} />
                    
                    <Select
                      value={severityFilter}
                      onChange={setSeverityFilter}
                      data={[
                        { value: 'all', label: 'All Severities' },
                        { value: 'critical', label: 'Critical' },
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' },
                      ]}
                      leftSection={<IconFilter size={16} />}
                      w={{ base: '100%', sm: 150 }}
                      size="sm"
                    />

                    <SegmentedControl 
                      value={sortBy} 
                      onChange={setSortBy}
                      size="sm"
                      data={[
                        { label: <Group gap="xs"><IconSortAscending size={14}/> Severity</Group>, value: 'severity' },
                        { label: <Group gap="xs"><IconClock size={14}/> Time</Group>, value: 'time' },
                      ]}
                    />
                  </Group>
                </Group>
              </Paper>
              
              <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-body)">
                {velocityWarning && (
                  <Badge color="red" variant="light" leftSection={<IconClock size={12} />} mb="xl" size="lg">
                    High Velocity Detected: {velocityWarning}
                  </Badge>
                )}

                {/* OPTIMIZATION FIX 2: Fixed layout shift by applying a minHeight wrapper */}
                <Box style={{ minHeight: 400 }}>
                  {anomalies.length === 0 && !isFetchingNextPage ? (
                    <Text c="dimmed" fs="italic">No threats or anomalies found matching your criteria.</Text>
                  ) : (
                    <Timeline active={anomalies.length} bulletSize={24} lineWidth={2}>
                      {anomalies.map((anomaly: any) => (
                        <AnomalyTimelineItem 
                          key={anomaly.id} 
                          anomaly={anomaly} 
                          jumpToRawLog={jumpToRawLog} 
                        />
                      ))}
                    </Timeline>
                  )}
                </Box>

                <div ref={ref} style={{ height: 20, marginTop: 20 }}>
                  {isFetchingNextPage && <Center><Loader size="sm" color="blue" /></Center>}
                </div>
              </Paper>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="raw">
            <Box pt="md">
              <RawLogExplorer jobId={jobId || ''} />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  );
}