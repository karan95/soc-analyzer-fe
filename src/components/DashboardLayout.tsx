import { 
  AppShell, 
  Burger, 
  Group, 
  Title, 
  ActionIcon, 
  useMantineColorScheme, 
  useComputedColorScheme,
  NavLink as MantineNavLink,
  ScrollArea,
  Avatar,
  Menu,
  rem,
  Text
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconSun, 
  IconMoon, 
  IconShieldLock,
  IconLayoutDashboard,
  IconFileAnalytics,
  IconLogout,
  IconRadar
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Mobile menu toggle state
  const [opened, { toggle }] = useDisclosure();
  const { data: user } = useUser();
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'SA';
  
  // Theme management
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  
  // Routing context for active states and redirects
  const location = useLocation();
  const navigate = useNavigate();

  // Updated IA: Global Intel -> Active Workspace -> Archives
  const navItems = [
    { icon: IconLayoutDashboard, label: 'Threat Intel', to: '/' },
    { icon: IconRadar, label: 'Log Ingestion', to: '/ingest' },
    { icon: IconFileAnalytics, label: 'Log History', to: '/logs' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {/* Burger menu only shows on small screens */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconShieldLock size={28} color="var(--mantine-color-blue-6)" />
            <Title order={3} fw={700}>SOC AI Analyzer</Title>
          </Group>

          <Group gap="sm">
            <ActionIcon 
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')} 
              variant="default" 
              size="lg" 
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
            </ActionIcon>
            
            {/* Enterprise User Menu Dropdown */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Avatar radius="xl" color="blue" style={{ cursor: 'pointer' }}>{initials}</Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Logged in as</Menu.Label>
                <Menu.Item disabled>
                  <Text size="sm" fw={500}>{user?.email || 'Loading...'}</Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  color="red" 
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => navigate('/logout')}
                >
                  Terminate Session
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* ScrollArea allows the sidebar to scroll independently if links exceed screen height */}
        <AppShell.Section grow component={ScrollArea}>
          <Text size="xs" fw={700} c="dimmed" mb="sm" ml="xs" style={{ letterSpacing: '0.5px' }}>
            PLATFORM
          </Text>
          {navItems.map((item) => (
            <MantineNavLink
              key={item.label}
              component={NavLink}
              to={item.to}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              // Highlight the link if the current route matches
              active={location.pathname === item.to}
              variant="filled"
              color="blue"
              mb={8}
              onClick={() => {
                if (opened) toggle(); // Close sidebar on mobile after clicking
              }}
            />
          ))}
        </AppShell.Section>

        {/* Pin the logout button to the bottom of the sidebar */}
        <AppShell.Section>
          <MantineNavLink
            component={NavLink}
            to="/logout"
            label="Logout"
            leftSection={<IconLogout size={20} stroke={1.5} />}
            color="red"
            variant="subtle"
          />
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main content area gets a slight background distinction in light mode */}
      <AppShell.Main bg="var(--mantine-color-body)">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}