import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import FeedPage from "@/pages/FeedPage";
import ExplorePage from "@/pages/ExplorePage";
import ProfilePage from "@/pages/ProfilePage";
import CreatePostPage from "@/pages/CreatePostPage";
import PostDetailPage from "@/pages/PostDetailPage";
import EngineeringZonePage from "@/pages/EngineeringZonePage";
import CommunitiesPage from "@/pages/CommunitiesPage";
import MessagesPage from "@/pages/MessagesPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SearchPage from "@/pages/SearchPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import CommunityDetailPage from "@/pages/CommunityDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/engineering" element={<EngineeringZonePage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/community/:communityId" element={<CommunityDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:handle" element={<ProfilePage />} />
                <Route path="/create" element={<CreatePostPage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:conversationId" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
