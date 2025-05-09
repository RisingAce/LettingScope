import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import PropertiesPage from "@/pages/PropertiesPage";
import AddPropertyPage from "@/pages/AddPropertyPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import ChasersPage from "@/pages/ChasersPage";
import AddChaserPage from "@/pages/AddChaserPage";
import NotesPage from "@/pages/NotesPage";
import AddNotePage from "@/pages/AddNotePage";
import AddBillPage from "@/pages/AddBillPage";
import BillsPage from "@/pages/BillsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import QuickAddPage from "@/pages/QuickAddPage";
import BillParserXtremePage from "@/pages/BillParserXtremePage";
import RentalValuatorPage from "@/pages/RentalValuatorPage";
import RentalAffordabilityPage from "@/pages/RentalAffordabilityPage";
import RentalIncreasePage from "@/pages/RentalIncreasePage";
import BillsCalculatorPage from "@/pages/BillsCalculatorPage";
import ProRataRentPage from "@/pages/ProRataRentPage";
import PropertyParserPage from "@/pages/PropertyParserPage";
import InspectioniserPage from "@/pages/InspectioniserPage";
import VirtualStagerPage from "@/pages/VirtualStagerPage";
import HomePage from "@/pages/HomePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            <Route path="/virtual-stager" element={
              <Layout>
                <VirtualStagerPage />
              </Layout>
            } />
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/properties" element={
              <Layout>
                <PropertiesPage />
              </Layout>
            } />
            <Route path="/properties/new" element={
              <Layout>
                <AddPropertyPage />
              </Layout>
            } />
            <Route path="/properties/:propertyId" element={
              <Layout>
                <PropertyDetailPage />
              </Layout>
            } />
            <Route path="/properties/:propertyId/edit" element={
              <Layout>
                <AddPropertyPage />
              </Layout>
            } />
            <Route path="/bills" element={
              <Layout>
                <BillsPage />
              </Layout>
            } />
            <Route path="/bills/new" element={
              <Layout>
                <AddBillPage />
              </Layout>
            } />
            <Route path="/bills/:billId/edit" element={
              <Layout>
                <AddBillPage />
              </Layout>
            } />
            <Route path="/chasers" element={
              <Layout>
                <ChasersPage />
              </Layout>
            } />
            <Route path="/chasers/new" element={
              <Layout>
                <AddChaserPage />
              </Layout>
            } />
            <Route path="/quick-add" element={
              <Layout>
                <QuickAddPage />
              </Layout>
            } />
            <Route path="/bill-parser-xtreme" element={
              <Layout>
                <BillParserXtremePage />
              </Layout>
            } />
            <Route path="/notes" element={
              <Layout>
                <NotesPage />
              </Layout>
            } />
            <Route path="/notes/new" element={
              <Layout>
                <AddNotePage />
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <SettingsPage />
              </Layout>
            } />
            <Route path="/rental-valuator" element={
              <Layout>
                <RentalValuatorPage />
              </Layout>
            } />
            <Route path="/rental-tools/affordability" element={<RentalAffordabilityPage />} />
            <Route path="/rental-tools/increase" element={<RentalIncreasePage />} />
            <Route path="/rental-tools/bills" element={<BillsCalculatorPage />} />
            <Route path="/rental-tools/pro-rata" element={<ProRataRentPage />} />
            <Route path="/rental-tools/property-parser" element={
              <Layout>
                <PropertyParserPage />
              </Layout>
            } />
            <Route path="/rental-tools/inspectioniser" element={
              <Layout>
                <InspectioniserPage />
              </Layout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
