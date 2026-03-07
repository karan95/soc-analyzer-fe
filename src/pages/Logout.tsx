import { useEffect } from 'react';
import { 
  Center, 
  Stack, 
  Title, 
  Text, 
  Button, 
  Paper,
  Loader
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLogout } from '../hooks/useAuth';

export default function Logout() {
  const logoutMutation = useLogout();

  useEffect(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: 'Session Terminated',
          message: 'You have been securely logged out.',
          color: 'blue',
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Center mih={'100vh'} miw={'100vw'} px={'md'}>
      <ThemeToggle />

      <Paper radius="md" p="xl" withBorder shadow="xl" w={420}>
        <Stack align="center" gap="md">
          {logoutMutation.isPending ? (
            <Loader size="lg" color="blue" />
          ) : (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="var(--mantine-color-blue-6)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>

              <Title order={3} ta="center">Session Terminated</Title>
              <Text c="dimmed" size="sm" ta="center" mb="md">
                You have been securely logged out of the SOC portal. 
                Close your browser window or return to the login screen.
              </Text>

              <Button component={Link} to="/login" variant="light" size="md" fullWidth>
                Return to Login
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Center>
  );
}