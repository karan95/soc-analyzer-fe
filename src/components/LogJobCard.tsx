import { useEffect, useRef } from 'react';
import { Paper, Text, Loader, Group, Badge, ThemeIcon, Stack } from '@mantine/core';
import { IconCheck, IconX, IconCpu } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface JobCardProps {
  uploadId?: string;
  filename: string;
  // Make status required since the parent is providing it
  status: 'pending' | 'processing' | 'completed' | 'failed'; 
}

export default function LogJobCard({ filename, status }: JobCardProps) {
  const prevStatus = useRef(status);

  // Watch for status prop changes from the parent
  useEffect(() => {
    if (status !== prevStatus.current) {
      if (status === 'completed') {
        notifications.show({
          title: 'Analysis Complete',
          message: `${filename} finished processing. Moved to History.`,
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else if (status === 'failed') {
        notifications.show({
          title: 'Analysis Failed',
          message: `Pipeline encountered an error with ${filename}.`,
          color: 'red',
          icon: <IconX size={18} />,
        });
      }
      prevStatus.current = status;
    }
  }, [status, filename]);

  return (
    <Paper withBorder shadow="sm" p="md" radius="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group gap="md">
          {/* Dynamic Icon */}
          <ThemeIcon 
            size="lg" 
            radius="md" 
            variant="light"
            color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'blue'}
          >
            {status === 'completed' ? <IconCheck size={20} /> : 
             status === 'failed' ? <IconX size={20} /> : 
             <IconCpu size={20} />}
          </ThemeIcon>

          <div>
            <Text fw={600} size="sm">{filename}</Text>
            <Group gap="xs" mt={4}>
              <Badge 
                color={status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'blue'} 
                variant="dot" 
                size="sm"
              >
                {status.toUpperCase()}
              </Badge>
            </Group>
          </div>
        </Group>
      </Group>

      {/* Loading State UX - Always shows while in pending/processing */}
      {(status === 'processing' || status === 'pending') && (
        <Stack gap="xs" mt="md" bg="var(--mantine-color-default-hover)" p="sm" style={{ borderRadius: 8 }}>
          <Group gap="sm">
            <Loader size="xs" type="dots" />
            <Text size="xs" fw={500} c="dimmed">
              Pipeline active: Cascading through Gemini 1.5 & DeepSeek-R1...
            </Text>
          </Group>
        </Stack>
      )}
    </Paper>
  );
}