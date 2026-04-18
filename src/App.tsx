import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { RequireUser } from "@/components/modules/RequireUser";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Profile from "./pages/Profile.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import CabModule from "@/modules/cab/CabModule";
import GroceriesModule from "@/modules/groceries/GroceriesModule";
import DoctorModule from "@/modules/doctor/DoctorModule";
import BillsModule from "@/modules/bills/BillsModule";
import FoodModule from "@/modules/food/FoodModule";
import SmartPlanModule from "@/modules/smart-plan/SmartPlanModule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/mod/cab" element={<RequireUser><CabModule /></RequireUser>} />
              <Route path="/mod/groceries" element={<RequireUser><GroceriesModule /></RequireUser>} />
              <Route path="/mod/doctor" element={<RequireUser><DoctorModule /></RequireUser>} />
              <Route path="/mod/bills" element={<RequireUser><BillsModule /></RequireUser>} />
              <Route path="/mod/food" element={<RequireUser><FoodModule /></RequireUser>} />
              <Route path="/mod/smart-plan" element={<RequireUser><SmartPlanModule /></RequireUser>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
