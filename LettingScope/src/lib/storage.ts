import { AppData, Property, Bill, Chaser, Note, Activity, AppSettings } from "@/types";
import JSZip from "jszip";
import { get, keys, set } from "idb-keyval";

// Default app settings
const DEFAULT_SETTINGS: AppSettings = {
  notificationDaysBefore: 7,
  currency: "GBP",
  dateFormat: "dd/MM/yyyy",
  emailParsingEnabled: true,
};

// Default app data
const DEFAULT_DATA: AppData = {
  properties: [],
  bills: [],
  chasers: [],
  notes: [],
  activities: [],
  settings: DEFAULT_SETTINGS,
  version: "1.0.0",
};

// Local storage key
const STORAGE_KEY = "propertyManagementData";

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Load data from local storage
export const loadData = (): AppData => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
    // Initialize with default data
    saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return DEFAULT_DATA;
  }
};

// Save data to local storage
export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

// Export data as JSON
export const exportDataAsJson = (): string => {
  const data = loadData();
  return JSON.stringify(data, null, 2);
};

// Import data from JSON
export const importDataFromJson = (jsonData: string): boolean => {
  try {
    const parsedData = JSON.parse(jsonData) as AppData;
    // Validate data structure
    if (!parsedData.properties || !parsedData.bills || !parsedData.chasers || 
        !parsedData.notes || !parsedData.settings) {
      throw new Error("Invalid data structure");
    }
    saveData(parsedData);
    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
};

// Export data and all bill documents as ZIP (with metadata)
export const exportDataAsZip = async (): Promise<Blob> => {
  const data = loadData();
  const zip = new JSZip();
  zip.file("data.json", JSON.stringify(data, null, 2));

  // Gather all localDocKeys from bills (support both localDocKeys and legacy localDocKey)
  const allDocKeys = Array.from(new Set(
    data.bills.flatMap((bill) => [
      ...(bill.localDocKeys || []),
      ...(bill.localDocKey ? [bill.localDocKey] : [])
    ]).filter(Boolean)
  ));

  // Build metadata for each doc
  const metadata: Record<string, { filename: string; mimeType: string }> = {};

  for (const key of allDocKeys) {
    const blob = await get(key);
    if (blob) {
      // Try to get filename and type from blob (if stored)
      let filename = key;
      let mimeType = blob.type || "application/octet-stream";
      // If you store metadata elsewhere, fetch it here
      // Otherwise, fallback to key and blob.type
      metadata[key] = { filename, mimeType };
      zip.file(`docs/${key}`, blob, { binary: true });
    }
  }
  zip.file("docs/metadata.json", JSON.stringify(metadata, null, 2));

  return zip.generateAsync({ type: "blob" });
};

// Import data and all bill documents from ZIP (with metadata)
export const importDataFromZip = async (zipFile: File | Blob): Promise<boolean> => {
  try {
    const zip = await JSZip.loadAsync(zipFile);
    const jsonFile = zip.file("data.json");
    if (!jsonFile) throw new Error("Missing data.json in ZIP");
    const jsonData = await jsonFile.async("string");
    const parsedData = JSON.parse(jsonData);
    saveData(parsedData);

    // Read metadata
    let metadata: Record<string, { filename: string; mimeType: string }> = {};
    const metaFile = zip.file("docs/metadata.json");
    if (metaFile) {
      metadata = JSON.parse(await metaFile.async("string"));
    }

    // Import all docs
    const docFiles = Object.values(zip.files).filter(file => file.name.startsWith("docs/") && !file.name.endsWith("metadata.json"));
    for (const file of docFiles) {
      const key = file.name.replace(/^docs\//, "");
      // Use correct mimeType if available
      let mimeType = metadata[key]?.mimeType || "application/octet-stream";
      const blob = await file.async("blob");
      // Create a new Blob with correct type (if needed)
      const finalBlob = mimeType && blob.type !== mimeType ? new Blob([blob], { type: mimeType }) : blob;
      await set(key, finalBlob);
      // Optionally, store filename somewhere if your app uses it
    }
    return true;
  } catch (error) {
    console.error("Error importing ZIP:", error);
    return false;
  }
};

// Clear all data
export const clearAllData = (): void => {
  saveData(DEFAULT_DATA);
};

// Add a new activity
export const addActivity = (
  type: Activity["type"],
  action: Activity["action"],
  itemId: string,
  itemTitle: string
): Activity => {
  const activity: Activity = {
    id: generateId(),
    type,
    action,
    itemId,
    itemTitle,
    timestamp: Date.now(),
  };
  
  const data = loadData();
  data.activities = [activity, ...data.activities.slice(0, 99)]; // Keep only the last 100 activities
  saveData(data);
  
  return activity;
};

// Property CRUD operations
export const addProperty = (property: Omit<Property, "id" | "createdAt" | "updatedAt">): Property => {
  const newProperty: Property = {
    id: generateId(),
    ...property,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const data = loadData();
  data.properties.push(newProperty);
  saveData(data);
  
  addActivity("property", "created", newProperty.id, newProperty.name);
  
  return newProperty;
};

export const updateProperty = (property: Property): Property => {
  const data = loadData();
  const index = data.properties.findIndex(p => p.id === property.id);
  
  if (index === -1) {
    throw new Error(`Property with id ${property.id} not found`);
  }
  
  const updatedProperty = {
    ...property,
    updatedAt: Date.now(),
  };
  
  data.properties[index] = updatedProperty;
  saveData(data);
  
  addActivity("property", "updated", updatedProperty.id, updatedProperty.name);
  
  return updatedProperty;
};

export const deleteProperty = (propertyId: string): void => {
  const data = loadData();
  const propertyIndex = data.properties.findIndex(p => p.id === propertyId);
  
  if (propertyIndex === -1) {
    throw new Error(`Property with id ${propertyId} not found`);
  }
  
  const property = data.properties[propertyIndex];
  
  // Delete associated bills, chasers, and notes
  data.bills = data.bills.filter(bill => bill.propertyId !== propertyId);
  data.chasers = data.chasers.filter(chaser => chaser.propertyId !== propertyId);
  data.notes = data.notes.filter(note => note.propertyId !== propertyId);
  
  // Delete the property
  data.properties.splice(propertyIndex, 1);
  saveData(data);
  
  addActivity("property", "deleted", propertyId, property.name);
};

// Bill CRUD operations
export const addBill = (bill: Omit<Bill, "id" | "createdAt" | "updatedAt">): Bill => {
  const newBill: Bill = {
    id: generateId(),
    ...bill,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const data = loadData();
  data.bills.push(newBill);
  saveData(data);
  
  addActivity("bill", "created", newBill.id, `${newBill.utilityType} bill`);
  
  return newBill;
};

export const updateBill = (bill: Bill): Bill => {
  const data = loadData();
  const index = data.bills.findIndex(b => b.id === bill.id);
  
  if (index === -1) {
    throw new Error(`Bill with id ${bill.id} not found`);
  }
  
  const updatedBill = {
    ...bill,
    updatedAt: Date.now(),
  };
  
  data.bills[index] = updatedBill;
  saveData(data);
  
  addActivity("bill", "updated", updatedBill.id, `${updatedBill.utilityType} bill`);
  
  return updatedBill;
};

export const deleteBill = (billId: string): void => {
  const data = loadData();
  const billIndex = data.bills.findIndex(b => b.id === billId);
  
  if (billIndex === -1) {
    throw new Error(`Bill with id ${billId} not found`);
  }
  
  const bill = data.bills[billIndex];
  
  // Delete associated chasers
  data.chasers = data.chasers.filter(chaser => chaser.billId !== billId);
  
  // Delete the bill
  data.bills.splice(billIndex, 1);
  saveData(data);
  
  addActivity("bill", "deleted", billId, `${bill.utilityType} bill`);
};

// Chaser CRUD operations
export const addChaser = (chaser: Omit<Chaser, "id" | "createdAt" | "updatedAt">): Chaser => {
  const newChaser: Chaser = {
    id: generateId(),
    ...chaser,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const data = loadData();
  data.chasers.push(newChaser);
  saveData(data);
  
  addActivity("chaser", "created", newChaser.id, newChaser.title);
  
  return newChaser;
};

export const updateChaser = (chaser: Chaser): Chaser => {
  const data = loadData();
  const index = data.chasers.findIndex(c => c.id === chaser.id);
  
  if (index === -1) {
    throw new Error(`Chaser with id ${chaser.id} not found`);
  }
  
  const updatedChaser = {
    ...chaser,
    updatedAt: Date.now(),
  };
  
  // Check if we're completing a previously uncompleted chaser
  if (updatedChaser.completed && !data.chasers[index].completed) {
    updatedChaser.completedDate = Date.now();
    addActivity("chaser", "completed", updatedChaser.id, updatedChaser.title);
  }
  
  data.chasers[index] = updatedChaser;
  saveData(data);
  
  if (!updatedChaser.completed) {
    addActivity("chaser", "updated", updatedChaser.id, updatedChaser.title);
  }
  
  return updatedChaser;
};

export const deleteChaser = (chaserId: string): void => {
  const data = loadData();
  const chaserIndex = data.chasers.findIndex(c => c.id === chaserId);
  
  if (chaserIndex === -1) {
    throw new Error(`Chaser with id ${chaserId} not found`);
  }
  
  const chaser = data.chasers[chaserIndex];
  
  // Delete the chaser
  data.chasers.splice(chaserIndex, 1);
  saveData(data);
  
  addActivity("chaser", "deleted", chaserId, chaser.title);
};

// Note CRUD operations
export const addNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note => {
  const newNote: Note = {
    id: generateId(),
    ...note,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const data = loadData();
  data.notes.push(newNote);
  saveData(data);
  
  addActivity("note", "created", newNote.id, newNote.title);
  
  return newNote;
};

export const updateNote = (note: Note): Note => {
  const data = loadData();
  const index = data.notes.findIndex(n => n.id === note.id);
  
  if (index === -1) {
    throw new Error(`Note with id ${note.id} not found`);
  }
  
  const updatedNote = {
    ...note,
    updatedAt: Date.now(),
  };
  
  data.notes[index] = updatedNote;
  saveData(data);
  
  addActivity("note", "updated", updatedNote.id, updatedNote.title);
  
  return updatedNote;
};

export const deleteNote = (noteId: string): void => {
  const data = loadData();
  const noteIndex = data.notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    throw new Error(`Note with id ${noteId} not found`);
  }
  
  const note = data.notes[noteIndex];
  
  // Delete the note
  data.notes.splice(noteIndex, 1);
  saveData(data);
  
  addActivity("note", "deleted", noteId, note.title);
};

// Settings operations
export const updateSettings = (settings: AppSettings): AppSettings => {
  const data = loadData();
  data.settings = settings;
  saveData(data);
  return settings;
};

// Get stats
export const getStats = () => {
  const data = loadData();
  
  return {
    propertyCount: data.properties.length,
    billCount: data.bills.length,
    pendingBillCount: data.bills.filter(bill => bill.status === "pending").length,
    overdueBillCount: data.bills.filter(bill => bill.status === "overdue").length,
    upcomingChaserCount: data.chasers.filter(
      chaser => !chaser.completed && new Date(chaser.dueDate) > new Date()
    ).length,
    overdueChaserCount: data.chasers.filter(
      chaser => !chaser.completed && new Date(chaser.dueDate) < new Date()
    ).length,
  };
};
