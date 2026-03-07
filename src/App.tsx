import { MantineProvider, createTheme, Center, Loader } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Logout from './pages/Logout';
import LogFiles from './pages/LogFiles';
import ThreatIntelligence from './pages/ThreatIntelligence';
import LogIngestion from './pages/LogIngestion';
import LogAnalysisReport from './pages/LogAnalysisReport';
import { useUser } from './hooks/useAuth';

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient();

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
});

// Create a wrapper component that passes the React Router Outlet into your Layout
function ProtectedRoutes() {
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" type="dots" />
      </Center>
    );
  }

  // If the backend returns a 401, TanStack Query marks it as an error
  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" zIndex={1000} />
        <BrowserRouter>
          <Routes>
            {/* Public Routes: No Sidebar/Navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            {/* Private Routes: Wrapped once using the ProtectedRoutes layout */}
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<ThreatIntelligence />} />
              <Route path="/ingest" element={<LogIngestion />} />
              
              {/* Nested Logs Hierarchy */}
              <Route path="/logs">
                <Route index element={<LogFiles />} /> {/* Renders at exactly /logs */}
                <Route path=":jobId" element={<LogAnalysisReport />} /> {/* Renders at /logs/123 */}
              </Route>
            </Route>

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}