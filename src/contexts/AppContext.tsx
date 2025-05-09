import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  AppData, Property, Bill, Chaser, Note, Activity, AppSettings, 
  UtilityType, BillStatus, ChaserPriority 
} from "@/types";
import {
  loadData, saveData, exportDataAsJson, importDataFromJson, clearAllData,
  addProperty, updateProperty, deleteProperty,
  addBill, updateBill, deleteBill,
  addChaser, updateChaser, deleteChaser,
  addNote, updateNote, deleteNote,
  updateSettings, getStats, generateId,
  exportDataAsZip, importDataFromZip
} from "@/lib/storage";
import { format } from "date-fns";
import { toast } from "sonner";

interface AppContextType {
  // Core data
  data: AppData;
  loadingData: boolean;
  
  // CRUD operations
  addProperty: (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => Property;
  updateProperty: (property: Property) => Property;
  deleteProperty: (propertyId: string) => void;
  
  addBill: (bill: Omit<Bill, "id" | "createdAt" | "updatedAt">) => Bill;
  updateBill: (bill: Bill) => Bill;
  deleteBill: (billId: string) => void;
  
  addChaser: (chaser: Omit<Chaser, "id" | "createdAt" | "updatedAt">) => Chaser;
  updateChaser: (chaser: Chaser) => Chaser;
  deleteChaser: (chaserId: string) => void;
  
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (note: Note) => Note;
  deleteNote: (noteId: string) => void;
  
  // Settings
  updateSettings: (settings: AppSettings) => AppSettings;
  
  // Data management
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
  exportDataZip: () => void;
  importDataZip: (zipFile: File | Blob) => Promise<boolean>;
  
  // Utility functions
  getPropertyById: (propertyId: string) => Property | undefined;
  getBillById: (billId: string) => Bill | undefined;
  getChaserById: (chaserId: string) => Chaser | undefined;
  getNoteById: (noteId: string) => Note | undefined;
  
  getBillsByPropertyId: (propertyId: string) => Bill[];
  getChasersByPropertyId: (propertyId: string) => Chaser[];
  getNotesByPropertyId: (propertyId: string) => Note[];
  getNotesByBillId: (billId: string) => Note[];
  
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: number) => string;
  getUpcomingChasers: () => Chaser[];
  getOverdueBills: () => Bill[];
  
  // Stats
  stats: ReturnType<typeof getStats>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState(getStats());

  // Load data on initial render
  useEffect(() => {
    try {
      const loadedData = loadData();
      setData(loadedData);
      setStats(getStats());
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load application data");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Reload stats when data changes
  useEffect(() => {
    if (data) {
      setStats(getStats());
    }
  }, [data]);

  // Sync data state with storage operations
  const syncData = () => {
    setData(loadData());
  };

  // Property operations
  const handleAddProperty = (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
    const newProperty = addProperty(property);
    syncData();
    toast.success(`Property "${property.name}" added successfully`);
    return newProperty;
  };

  const handleUpdateProperty = (property: Property) => {
    const updatedProperty = updateProperty(property);
    syncData();
    toast.success(`Property "${property.name}" updated successfully`);
    return updatedProperty;
  };

  const handleDeleteProperty = (propertyId: string) => {
    try {
      const property = data?.properties.find(p => p.id === propertyId);
      if (!property) throw new Error("Property not found");
      
      deleteProperty(propertyId);
      syncData();
      toast.success(`Property "${property.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
      throw error;
    }
  };

  // Bill operations
  const handleAddBill = (bill: Omit<Bill, "id" | "createdAt" | "updatedAt">) => {
    const newBill = addBill(bill);
    syncData();
    toast.success(`${bill.utilityType.charAt(0).toUpperCase() + bill.utilityType.slice(1)} bill added successfully`);
    return newBill;
  };

  const handleUpdateBill = (bill: Bill) => {
    const updatedBill = updateBill(bill);
    syncData();
    toast.success(`Bill updated successfully`);
    return updatedBill;
  };

  const handleDeleteBill = (billId: string) => {
    try {
      deleteBill(billId);
      syncData();
      toast.success("Bill deleted successfully");
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast.error("Failed to delete bill");
      throw error;
    }
  };

  // Chaser operations
  const handleAddChaser = (chaser: Omit<Chaser, "id" | "createdAt" | "updatedAt">) => {
    const newChaser = addChaser(chaser);
    syncData();
    toast.success(`Reminder "${chaser.title}" added successfully`);
    return newChaser;
  };

  const handleUpdateChaser = (chaser: Chaser) => {
    const updatedChaser = updateChaser(chaser);
    syncData();
    
    if (chaser.completed && !data?.chasers.find(c => c.id === chaser.id)?.completed) {
      toast.success(`Reminder "${chaser.title}" marked as completed`);
    } else {
      toast.success(`Reminder "${chaser.title}" updated successfully`);
    }
    
    return updatedChaser;
  };

  const handleDeleteChaser = (chaserId: string) => {
    try {
      const chaser = data?.chasers.find(c => c.id === chaserId);
      if (!chaser) throw new Error("Reminder not found");
      
      deleteChaser(chaserId);
      syncData();
      toast.success(`Reminder "${chaser.title}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting chaser:", error);
      toast.error("Failed to delete reminder");
      throw error;
    }
  };

  // Note operations
  const handleAddNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const newNote = addNote(note);
    syncData();
    toast.success(`Note "${note.title}" added successfully`);
    return newNote;
  };

  const handleUpdateNote = (note: Note) => {
    const updatedNote = updateNote(note);
    syncData();
    toast.success(`Note "${note.title}" updated successfully`);
    return updatedNote;
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    syncData();
    toast.success("Note deleted successfully");
  };

  // Settings operations
  const handleUpdateSettings = (settings: AppSettings) => {
    const updatedSettings = updateSettings(settings);
    syncData();
    toast.success("Settings updated successfully");
    return updatedSettings;
  };

  // Data management
  const handleExportData = () => {
    try {
      const jsonData = exportDataAsJson();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `property-manager-export-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const handleExportDataZip = async () => {
    try {
      const zipBlob = await exportDataAsZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lettingscope-backup-${format(new Date(), "yyyy-MM-dd")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Full backup (with documents) exported as ZIP");
    } catch (error) {
      console.error("Error exporting ZIP:", error);
      toast.error("Failed to export full backup");
    }
  };

  const handleImportData = (jsonData: string) => {
    try {
      const success = importDataFromJson(jsonData);
      if (success) {
        syncData();
        toast.success("Data imported successfully");
        return true;
      } else {
        toast.error("Failed to import data: Invalid format");
        return false;
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error("Failed to import data");
      return false;
    }
  };

  const handleImportDataZip = async (zipFile: File | Blob) => {
    try {
      const success = await importDataFromZip(zipFile);
      if (success) {
        syncData();
        toast.success("Full backup (with documents) imported successfully");
        return true;
      } else {
        toast.error("Failed to import backup: Invalid ZIP");
        return false;
      }
    } catch (error) {
      console.error("Error importing ZIP:", error);
      toast.error("Failed to import backup");
      return false;
    }
  };

  const handleClearData = () => {
    try {
      clearAllData();
      syncData();
      toast.success("All data cleared successfully");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data");
    }
  };

  // Utility functions
  const getPropertyById = (propertyId: string) => {
    return data?.properties.find(property => property.id === propertyId);
  };

  const getBillById = (billId: string) => {
    return data?.bills.find(bill => bill.id === billId);
  };

  const getChaserById = (chaserId: string) => {
    return data?.chasers.find(chaser => chaser.id === chaserId);
  };

  const getNoteById = (noteId: string) => {
    return data?.notes.find(note => note.id === noteId);
  };

  const getBillsByPropertyId = (propertyId: string) => {
    return data?.bills.filter(bill => bill.propertyId === propertyId) || [];
  };

  const getChasersByPropertyId = (propertyId: string) => {
    return data?.chasers.filter(chaser => chaser.propertyId === propertyId) || [];
  };

  const getNotesByPropertyId = (propertyId: string) => {
    return data?.notes.filter(note => note.propertyId === propertyId) || [];
  };

  const getNotesByBillId = (billId: string) => {
    return data?.notes.filter(note => note.billId === billId) || [];
  };

  const formatCurrency = (amount: number) => {
    const currency = data?.settings.currency || "GBP";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    const dateFormat = data?.settings.dateFormat || "dd/MM/yyyy";
    return format(new Date(timestamp), dateFormat);
  };

  const getUpcomingChasers = () => {
    if (!data) return [];
    
    const now = Date.now();
    const daysBeforePeriod = data.settings.notificationDaysBefore * 24 * 60 * 60 * 1000;
    
    return data.chasers
      .filter(chaser => 
        !chaser.completed && 
        chaser.dueDate > now && 
        chaser.dueDate <= now + daysBeforePeriod
      )
      .sort((a, b) => a.dueDate - b.dueDate);
  };

  const getOverdueBills = () => {
    if (!data) return [];
    
    const now = Date.now();
    
    return data.bills
      .filter(bill => 
        (bill.status === "pending" || bill.status === "overdue") && 
        bill.dueDate < now
      )
      .sort((a, b) => a.dueDate - b.dueDate);
  };

  if (loadingData || !data) {
    return null; // Or a loading spinner component
  }

  const value: AppContextType = {
    data,
    loadingData,
    
    // CRUD operations
    addProperty: handleAddProperty,
    updateProperty: handleUpdateProperty,
    deleteProperty: handleDeleteProperty,
    
    addBill: handleAddBill,
    updateBill: handleUpdateBill,
    deleteBill: handleDeleteBill,
    
    addChaser: handleAddChaser,
    updateChaser: handleUpdateChaser,
    deleteChaser: handleDeleteChaser,
    
    addNote: handleAddNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
    
    // Settings
    updateSettings: handleUpdateSettings,
    
    // Data management
    exportData: handleExportData,
    importData: handleImportData,
    clearData: handleClearData,
    exportDataZip: handleExportDataZip,
    importDataZip: handleImportDataZip,
    
    // Utility functions
    getPropertyById,
    getBillById,
    getChaserById,
    getNoteById,
    
    getBillsByPropertyId,
    getChasersByPropertyId,
    getNotesByPropertyId,
    getNotesByBillId,
    
    formatCurrency,
    formatDate,
    getUpcomingChasers,
    getOverdueBills,
    
    // Stats
    stats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
