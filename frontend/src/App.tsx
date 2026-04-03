import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/pages/SplashScreen";
import HomeScreen from "@/pages/HomeScreen";
import ChatScreen from "@/pages/ChatScreen";
import DiaryScreen from "@/pages/DiaryScreen";
import InsightsScreen from "@/pages/InsightsScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Root layout wraps all routes with shared providers and chrome
const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <div className="max-w-lg mx-auto min-h-screen relative bg-background">
        <Outlet />
        <BottomNav />
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { path: "/splash", element: <SplashScreen /> },
        { path: "/", element: <HomeScreen /> },
        { path: "/chat", element: <ChatScreen /> },
        { path: "/diary", element: <DiaryScreen /> },
        { path: "/insights", element: <InsightsScreen /> },
        { path: "/settings", element: <SettingsScreen /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    // v7_relativeSplatPath lives at the router level
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

// v7_startTransition lives at the render level (RouterProvider)
const App = () => (
  <RouterProvider router={router} future={{ v7_startTransition: true }} />
);

export default App;
