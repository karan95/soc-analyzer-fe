import { useState, useEffect } from 'react';
import { 
  Paper, 
  Group, 
  TextInput, 
  Table, 
  Text, 
  Badge, 
  Center, 
  Pagination,
  Tooltip,
  Stack,
  Loader
} from '@mantine/core';
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useRawLogsPaginated } from '../hooks/useLogs';

interface RawLogExplorerProps {
  jobId: string;
}

export default function RawLogExplorer({ jobId }: RawLogExplorerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(urlQuery);
  
  // FIX 1: Track if the user is actively typing to prevent React Router from overriding the input
  const [isTyping, setIsTyping] = useState(false);

  // 1. Deep Link Sync: ONLY update local input if the URL changes externally AND the user isn't typing
  useEffect(() => {
    if (!isTyping && urlQuery !== searchInput) {
      setSearchInput(urlQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, isTyping]);

  // 2. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const currentQ = prev.get('q') || '';
        if (currentQ !== searchInput) {
          if (searchInput) prev.set('q', searchInput);
          else prev.delete('q');
          setPage(1); 
        }
        return prev;
      }, { replace: true }); 
    }, 500); // FIX 1: Increased debounce to 500ms for smoother API calls
    
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]); 

  const { data, isFetching } = useRawLogsPaginated(jobId, page, 20, urlQuery);

  const logs = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalRecords = data?.totalRecords || 0;

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Paper withBorder shadow="sm" radius="md" w="100%" style={{ overflow: 'hidden' }}>
      {/* FIX 2: Added wrap="wrap" and flex properties so the search bar isn't crushed on mobile */}
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-border)' }} wrap="wrap">
        <Group gap="sm" style={{ flexGrow: 1, flexBasis: '300px' }}>
          <TextInput
            placeholder="Search URL, IP, User, UA, or Threat..."
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            onFocus={() => setIsTyping(true)}   // Tracks focus
            onBlur={() => setIsTyping(false)}   // Drops focus
            style={{ flexGrow: 1 }}             // Allows input to stretch dynamically
            w={{ base: '100%', sm: 'auto' }}
          />
          {isFetching && <Loader size="xs" color="gray" />}
        </Group>
        <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {totalRecords.toLocaleString()} events found
        </Text>
      </Group>

      <Table.ScrollContainer minWidth={1200}>
        <Table verticalSpacing="sm" horizontalSpacing="md" striped="odd" highlightOnHover w="100%">
          <Table.Thead bg="var(--mantine-color-default-hover)">
            <Table.Tr>
              <Table.Th>Timestamp</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Target URL</Table.Th>
              <Table.Th>App & Category</Table.Th>
              <Table.Th>Source IP</Table.Th>
              <Table.Th>Dest IP</Table.Th>
              <Table.Th>Traffic (Tx / Rx)</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Threat Intel</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.length > 0 ? (
              logs.map((log: any) => (
                <Table.Tr key={log.id}>
                  {/* Timestamp */}
                  <Table.Td><Text size="xs" ff="monospace" c="dimmed" style={{ whiteSpace: 'nowrap' }}>{log.timestamp}</Text></Table.Td>
                  
                  {/* User */}
                  <Table.Td><Text size="sm" fw={600}>{log.user || 'Unknown'}</Text></Table.Td>
                  
                  {/* Target URL & User Agent */}
                  <Table.Td>
                    <Stack gap={2}>
                      <Group gap={4}>
                        <Text size="xs" fw={700} c="dimmed">{log.requestMethod || 'N/A'}</Text>
                        <Tooltip label={log.url} openDelay={500}>
                          <Text size="sm" style={{ wordBreak: 'break-all', maxWidth: 220 }} lineClamp={1}>
                            {log.url || 'Unknown URL'}
                          </Text>
                        </Tooltip>
                      </Group>
                      {/* Highlight unusual User Agents */}
                      <Text size="xs" c={log.userAgent?.includes('curl') || log.userAgent?.includes('python') ? 'red' : 'dimmed'} ff="monospace" lineClamp={1} title={log.userAgent}>
                        UA: {log.userAgent || 'Unknown'}
                      </Text>
                    </Stack>
                  </Table.Td>
                  
                  {/* App & Category */}
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>{log.app !== 'Unknown' && log.app ? log.app : 'Uncategorized'}</Text>
                      <Text size="xs" c="dimmed">{log.category}</Text>
                    </Stack>
                  </Table.Td>
                  
                  {/* IPs */}
                  <Table.Td><Text size="xs" ff="monospace">{log.clientIp}</Text></Table.Td>
                  <Table.Td><Text size="xs" ff="monospace">{log.serverIp}</Text></Table.Td>
                  
                  {/* Bytes Stacked */}
                  <Table.Td>
                    <Stack gap={2}>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Tx:</Text>
                        <Text size="xs" fw={log.sentBytes > 1000000 ? 700 : 400} c={log.sentBytes > 1000000 ? 'orange' : undefined}>
                          {formatBytes(log.sentBytes)}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Rx:</Text>
                        <Text size="xs">{formatBytes(log.receivedBytes)}</Text>
                      </Group>
                    </Stack>
                  </Table.Td>
                  
                  {/* Status Stacked */}
                  <Table.Td>
                    <Stack gap={4} align="flex-start">
                      <Badge color={log.action === 'Blocked' ? 'red' : 'gray'} variant="light" size="xs">
                        {log.action || 'Unknown'}
                      </Badge>
                      <Badge 
                        color={log.responseCode?.startsWith('4') || log.responseCode?.startsWith('5') ? 'red' : 'green'} 
                        variant="dot" 
                        size="xs"
                      >
                        HTTP {log.responseCode || 'N/A'}
                      </Badge>
                    </Stack>
                  </Table.Td>

                  {/* Threat Column */}
                  <Table.Td>
                    {log.threatName && log.threatName !== 'None' ? (
                      <Badge color="red" variant="filled" leftSection={<IconAlertTriangle size={10} />} size="xs">
                        {log.threatName}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">None</Text>
                    )}
                  </Table.Td>

                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Center py="xl">
                    <Text c="dimmed">{isFetching ? 'Loading logs...' : 'No ZScaler logs found for this search query.'}</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Hide pagination if there are no records */}
      {totalPages > 0 && (
        <Group justify="center" p="md" style={{ borderTop: '1px solid var(--mantine-color-border)' }}>
          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={setPage} 
            color="blue" 
            radius="md" 
            withEdges 
          />
        </Group>
      )}
    </Paper>
  );
}