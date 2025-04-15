import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
