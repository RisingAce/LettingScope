export type Property = {
  id: string;
  name: string;
  address: string;
  propertyType?: "apartment" | "house" | "condo" | "townhouse" | "commercial";
  landlordName?: string;
  landlordContact?: string;
  tenantName?: string;
  tenantContact?: string;
  featured?: boolean;
  rentalAmount?: number;
  leaseEndDate?: number;
  localDocKey?: string; // Key for IndexedDB local document storage (if needed)
  createdAt: number;
  updatedAt: number;
};

export type UtilityType = 
  | "electricity"
  | "gas" 
  | "water" 
  | "internet" 
  | "councilTax" 
  | "tv" 
  | "other";

export type BillStatus = "pending" | "paid" | "overdue" | "disputed";

export type Bill = {
  id: string;
  propertyId: string;
  utilityType: string; // Now always stored as a comma-separated string
  provider: string;
  accountNumber?: string;
  amount: number;
  issueDate: number;
  dueDate: number;
  status: BillStatus;
  paid: boolean;
  paidDate?: number;
  documentUrl?: string;
  notes?: string;
  localDocKey?: string; // Key for IndexedDB local document storage (legacy)
  localDocKeys?: string[]; // Key for IndexedDB local document storage (multi-doc support)
  createdAt: number;
  updatedAt: number;
};

export type ChaserPriority = "low" | "medium" | "high";

export type Chaser = {
  id: string;
  propertyId?: string;
  billId?: string;
  title: string;
  description?: string;
  dueDate: number;
  priority: ChaserPriority;
  completed: boolean;
  completedDate?: number;
  createdAt: number;
  updatedAt: number;
};

export type NotePriority = "low" | "medium" | "high";

export type Note = {
  id: string;
  propertyId?: string;
  billId?: string;
  title: string;
  content: string;
  completed?: boolean;
  priority?: NotePriority;
  createdAt: number;
  updatedAt: number;
};

export type Activity = {
  id: string;
  type: "property" | "bill" | "chaser" | "note";
  action: "created" | "updated" | "deleted" | "completed";
  itemId: string;
  itemTitle: string;
  timestamp: number;
};

export type AppSettings = {
  notificationDaysBefore: number;
  currency: string;
  dateFormat: string;
  emailParsingEnabled: boolean;
};

export type AppData = {
  properties: Property[];
  bills: Bill[];
  chasers: Chaser[];
  notes: Note[];
  activities: Activity[];
  settings: AppSettings;
  version: string;
};
