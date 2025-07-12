import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UploadPage from "./pages/Upload";
import Results from "./pages/Results";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Discovery from "./pages/Discovery";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import OauthCallback from './pages/OauthCallback';
import CreateDiscovery from './pages/Create';
import DiscoveryDetails from './pages/DiscoveryDetails';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/help" element={
              <Layout>
                <Help />
              </Layout>
            } />
            
            {/* Public Feature Routes */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<History />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/discovery/:id" element={<DiscoveryDetails />} />
            
            {/* Protected Detection Routes */}
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <CreateDiscovery />
              </ProtectedRoute>
            } />
            
            {/* Oauth Callback Route */}
            <Route path="/oauth-callback" element={<OauthCallback />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
