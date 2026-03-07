import { 
  Box, 
  Title, 
  Stack, 
  Text, 
  Group, 
  Paper, 
  ThemeIcon, 
  Badge,
  Divider,
  Center,
  Loader,
  Alert,
  Code
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import { 
  IconUpload, 
  IconX, 
  IconFileAlert, 
  IconShieldCheck,
  IconActivity
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getFileHash } from '../utils/hash';
import LogJobCard from '../components/LogJobCard';
import { useQueryClient } from '@tanstack/react-query';
import { useCheckDuplicate, useUploadLog, useActiveLogs } from '../hooks/useLogs';

export default function LogIngestion() {
  const queryClient = useQueryClient();
  
  // 1. Use the active logs hook
  const { data: activeJobs = [], isLoading: isLoadingJobs } = useActiveLogs();
  
  const checkDuplicate = useCheckDuplicate();
  const uploadLog = useUploadLog();

  const handleDrop = async (files: File[]) => {
    // 2. Enforce single file processing
    const file = files[0];
    if (!file) return;

    try {
      const hash = await getFileHash(file);
      
      // 3. Pre-check hash to save bandwidth
      const checkResult = await checkDuplicate.mutateAsync(hash);
      
      if (checkResult.exists) {
        // Make the message dynamic based on whether the AI is done or still working
        const isFinished = checkResult.status === 'completed';
        
        notifications.show({
          title: 'File Already Uploaded',
          message: isFinished 
            ? `Analysis for ${file.name} is already done. You can view the report in the Log History page.`
            : `${file.name} is already in the system and is currently being processed.`,
          color: 'blue',
          icon: <IconShieldCheck size={18} />,
        });
        
        queryClient.invalidateQueries({ queryKey: ["active-logs"] });
        return; // Skip the upload
      }

      // 4. If not duplicate, execute upload
      await uploadLog.mutateAsync({ file, hash });
      
      queryClient.invalidateQueries({ queryKey: ["active-logs"] });

      notifications.show({
        title: 'Ingestion Started',
        message: `${file.name} queued for cascading AI analysis.`,
        color: 'blue',
        icon: <IconShieldCheck size={18} />,
      });

    } catch (error: any) {
      const errorMsg = error.response?.status === 429 
        ? "Rate limit exceeded. Please wait a minute." 
        : `Could not process ${file.name}.`;

      notifications.show({
        title: 'Ingestion Failed',
        message: errorMsg,
        color: 'red',
        icon: <IconX size={18} />,
      });
    }
  };

  return (
    <Box w="100%" maw="100%" p={{ base: 'md', md: 'xl' }}>
      <Stack gap="xl" w="100%" maw={900} mx="auto">
        
        {/* PAGE HEADER */}
        <div>
          <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>
            Log Ingestion Engine
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Securely upload ZScaler Web Proxy Logs for automated triage. Files are hashed locally to prevent redundant processing and sent through our cascading LLM pipeline for deep forensic analysis.
          </Text>

          <Alert mt='md' color="blue" variant="light" icon={<IconInfoCircle size={16} />}>
            <Text size="sm" fw={700}>Required Log Format: ZScaler NSS Proxy</Text>
            <Text size="xs">
              Currently, only CSV/Log files using the ZScaler standard column format are supported. 
              Example: <Code>"Timestamp","User","Protocol","URL","Action",...</Code>
            </Text>
          </Alert>
        </div>

        {/* DROPZONE CARD */}
        <Paper withBorder shadow="sm" radius="md" p="md" bg="var(--mantine-color-body)">
          <Dropzone
            onDrop={handleDrop}
            multiple={false}
            // 5. Use TanStack's built-in pending states for the loading spinner
            loading={checkDuplicate.isPending || uploadLog.isPending}
            maxSize={10 * 1024 ** 2} // 10MB limit
            accept={{
              'text/csv': ['.csv'],
              'text/plain': ['.txt', '.log'],
              'application/octet-stream': ['.log']
            }}
            radius="md"
            style={{ 
              borderWidth: 2, 
              borderStyle: 'dashed',
              transition: 'border-color 0.2s ease',
            }}
          >
            <Center mih={220} style={{ pointerEvents: 'none' }}>
              <Stack align="center" gap="md">
                <Dropzone.Accept>
                  <ThemeIcon size={72} radius="100%" color="blue" variant="light">
                    <IconUpload size={36} stroke={1.5} />
                  </ThemeIcon>
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <ThemeIcon size={72} radius="100%" color="red" variant="light">
                    <IconX size={36} stroke={1.5} />
                  </ThemeIcon>
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <ThemeIcon size={72} radius="100%" color="gray" variant="light">
                    <IconFileAlert size={36} stroke={1.5} />
                  </ThemeIcon>
                </Dropzone.Idle>

                <Stack align="center" gap={4}>
                  <Text size="xl" fw={600} inline>
                    Drag & Drop Log Files
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={4}>
                    or click to browse your local machine
                  </Text>
                </Stack>
                
                <Group gap="xs" mt="sm">
                  <Badge variant="dot" color="blue" size="sm">CSV, TXT, LOG</Badge>
                  <Badge variant="dot" color="gray" size="sm">Up to 10MB</Badge>
                  <Badge variant="dot" color="green" size="sm">SHA-256 Deduplication</Badge>
                </Group>
              </Stack>
            </Center>
          </Dropzone>
        </Paper>

        <Divider my="sm" />

        {/* ANALYSIS RESULTS AREA */}
       <div>
          <Group gap="sm" mb="md">
            <IconActivity size={24} color="var(--mantine-color-blue-6)" />
            {/* 5. Update Title */}
            <Title order={3} fw={700}>Active Sessions</Title> 
          </Group>

          {isLoadingJobs ? (
            <Center p="xl"><Loader /></Center>
          ) : activeJobs.length > 0 ? (
            <Stack gap="md">
              {activeJobs.map((job: any) => (
                <LogJobCard key={job.id} uploadId={job.id} filename={job.filename} status={job.status} />
              ))}
            </Stack>
          ) : (
            <Paper withBorder radius="md" p="xl" bg="var(--mantine-color-default-hover)">
              <Center>
                <Text c="dimmed" size="sm">
                  No logs are currently being processed. Upload a file above to begin analysis.
                </Text>
              </Center>
            </Paper>
          )}
        </div>
      </Stack>
    </Box>
  );
}