import { useState } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Center, 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLogin } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('admin@soc.local'); // Pre-filled for easy testing
  const [password, setPassword] = useState('SecurePassword123!');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate({ email, password }, {
      onSuccess: () => {
        notifications.show({
          title: 'Authentication Successful',
          message: 'Welcome to the SOC Portal. Secure session established.',
          color: 'green',
        });
        navigate('/', { replace: true });
      },
      onError: () => {
        notifications.show({
          title: 'Authentication Failed',
          message: 'Invalid email or password. Please try again.',
          color: 'red',
        });
      }
    });
  };

  return (
    <Center mih={'100vh'} miw={'100vw'} px={'md'}>
      <ThemeToggle />
      <Paper radius="md" p="xl" withBorder shadow="xl" w={420}>
        <Title order={2} ta="center" fw={900}>
          SOC Analyst Portal
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
          Secure access for threat intelligence and log analysis
        </Text>

        <form onSubmit={handleLogin}>
          <TextInput 
            label="Email address" 
            placeholder="analyst@firm.com" 
            required 
            size="md" 
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput 
            label="Password" 
            placeholder="Enter your password" 
            required 
            mt="md" 
            size="md" 
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Button 
            type="submit" 
            fullWidth 
            mt="xl" 
            size="md" 
            variant="filled" 
            color="blue"
            loading={loginMutation.isPending}
          >
            Authenticate Session
          </Button>
        </form>
      </Paper>
    </Center>
  );
}