import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";
import Index from "./pages/Index";
import Inbox from "./pages/Inbox";
import MyLibrary from "./pages/MyLibrary";
import Compose from "./pages/Compose";
import Approvals from "./pages/Approvals";
import Workspaces from "./pages/Workspaces";
import WorkspaceView from "./pages/WorkspaceView";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Sent from "./pages/Sent";
import Drafts from "./pages/Drafts";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminTools from "./pages/AdminTools";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  {
    path: "/inbox",
    element: <RequireAuth><Inbox /></RequireAuth>
  },
  {
    path: "/archive",
    element: <RequireAuth><MyLibrary /></RequireAuth>
  },
  {
    path: "/compose",
    element: <RequireAuth><Compose /></RequireAuth>
  },
  {
    path: "/approvals",
    element: <RequireAuth><Approvals /></RequireAuth>
  },
  {
    path: "/workspaces",
    element: <RequireAuth><Workspaces /></RequireAuth>
  },
  {
    path: "/workspaces/:id",
    element: <RequireAuth><WorkspaceView /></RequireAuth>
  },
  {
    path: "/templates",
    element: <RequireAuth><Templates /></RequireAuth>
  },
  {
    path: "/profile",
    element: <RequireAuth><Profile /></RequireAuth>
  },
  {
    path: "/sent",
    element: <RequireAuth><Sent /></RequireAuth>
  },
  {
    path: "/drafts",
    element: <RequireAuth><Drafts /></RequireAuth>
  },
  {
    path: "/admin/tools",
    element: <RequireAuth adminOnly><AdminTools /></RequireAuth>
  },
  { path: "*", element: <NotFound /> },
]);


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
