import { 
  Table, 
  Badge, 
  Title, 
  Box, 
  Paper, 
  Text, 
  Group, 
  Button,
  TextInput,
  Pagination,
  Center,
  Stack,
  Loader
} from '@mantine/core';
import { IconSearch, IconUpload, IconFileAlert } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllLogs } from '../hooks/useLogs';
import { formatFileSize } from '../utils';

export default function LogFiles() {
  const navigate = useNavigate();
  
  // URL Query Parameters State Management for deep linking
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setSearchParams((prev) => {
      if (val) prev.set('search', val);
      else prev.delete('search'); // Clean up URL if empty
      return prev;
    });
  };

  // Fetch real data from the backend
  const { data: logs = [], isLoading } = useAllLogs();

  const statusColors: Record<string, string> = {
    completed: 'green',
    processing: 'blue',
    pending: 'gray',
    failed: 'red',
  };

  // Client-side filter applied to real backend data
  const filteredLogs = logs.filter((log: any) => 
    log.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box w="100%" maw="100%" p={{ base: 'md', md: 'xl' }}>
      <Stack gap="xl" w="100%">
        <Group justify="space-between" align="flex-end" w="100%">
          <div>
            <Title order={2} fw={700}>Log Processing History</Title>
            <Text c="dimmed" size="sm" mt={4}>
              View and manage previously uploaded ZScaler and firewall logs.
            </Text>
          </div>
          <Button 
            variant="filled" 
            color="blue" 
            leftSection={<IconUpload size={16} />}
            onClick={() => navigate('/ingest')} // Ensure this routes to your ingestion page
          >
            Upload New Log
          </Button>
        </Group>

        <Paper withBorder shadow="sm" radius="md" style={{ overflow: 'hidden' }} w="100%">
          <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-border)' }}>
            <TextInput
              placeholder="Search filenames..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={handleSearchChange}
              w={{ base: '100%', sm: 300 }}
            />
            <Text size="sm" c="dimmed">
              Showing {filteredLogs.length} entries
            </Text>
          </Group>

          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover striped="odd" w="100%">
              <Table.Thead bg="var(--mantine-color-default-hover)">
                <Table.Tr>
                  <Table.Th>Filename</Table.Th>
                  <Table.Th>Upload Date</Table.Th>
                  <Table.Th>Size</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Center py="xl">
                        <Loader />
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log: any) => (
                    <Table.Tr key={log.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <IconFileAlert size={18} color="var(--mantine-color-dimmed)" />
                          <Text fw={500} size="sm">{log.filename}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {/* Format the SQLite timestamp to look cleaner */}
                        <Text size="sm">{new Date(log.created_at).toLocaleString()}</Text>
                      </Table.Td>
                      <Table.Td>
                        {/* Size isn't currently tracked in SQLite, leaving as N/A */}
                        <Text size="sm" c="dimmed">{log.file_size ? formatFileSize(log.file_size) : 'N/A'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={statusColors[log.status] || 'gray'} 
                          variant="light" 
                          size="sm" 
                          radius="sm"
                        >
                          {log.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Button 
                          variant="subtle" 
                          size="xs" 
                          disabled={log.status !== 'completed'}
                          onClick={() => navigate(`/logs/${log.id}`)}
                        >
                          View Analysis
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Center py="xl">
                        <Text c="dimmed">No logs found matching your search.</Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Group justify="center" p="md" style={{ borderTop: '1px solid var(--mantine-color-border)' }}>
            <Pagination total={1} color="blue" radius="md" />
          </Group>
        </Paper>
      </Stack>
    </Box>
  );
}