// Define all types related to property inspections

export interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  timestamp: string;
  roomId?: string;
  issueId?: string;
  tags: string[];
  location?: string;
}

export interface RoomFeature {
  id: string;
  name: string;
  condition: number; // 1-10
  notes?: string;
  photos?: Photo[];
  maintenanceRequired: boolean;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  photos: Photo[];
  status: 'new' | 'in-progress' | 'resolved' | 'monitoring';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedCost?: number;
  category: string;
  tags: string[];
  maintenanceRequired: boolean;
  maintenanceScheduled?: boolean;
  maintenanceDate?: string;
  completionNotes?: string;
}

export interface Room {
  id: string;
  name: string;
  type: string; // bedroom, bathroom, kitchen, etc.
  condition: number; // 1-10
  notes: string;
  photos: Photo[];
  issues: Issue[];
  features: RoomFeature[];
  checklist: ChecklistItem[];
  urgent: boolean;
  cleanlinessRating: number; // 1-10
  wallsCondition: number; // 1-10
  flooringCondition: number; // 1-10
  windowsCondition: number; // 1-10
  doorsCondition: number; // 1-10
  ceilingCondition: number; // 1-10
  lightingCondition: number; // 1-10
  furnitureCondition?: number; // 1-10, optional if unfurnished
  appliancesCondition?: number; // 1-10, optional depending on room
  dampIssues: boolean;
  moldIssues: boolean;
  pestIssues: boolean;
  electricalIssues: boolean;
  plumbingIssues: boolean;
  heatingIssues: boolean;
  safetyIssues: boolean;
  lastInspectionNotes?: string;
  lastInspectionDate?: string;
  inspectionComplete: boolean;
}

export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  notes?: string;
  photos?: Photo[];
  roomId: string;
}

export interface Utility {
  electricMeterReading?: string;
  gasMeterReading?: string;
  waterMeterReading?: string;
  heatingFunctional: boolean;
  plumbingFunctional: boolean;
  electricalFunctional: boolean;
  notes: string;
}

export interface Compliance {
  gasChecked: boolean;
  electricChecked: boolean;
  fireChecked: boolean;
  legionellaChecked: boolean;
  asbestosChecked: boolean;
  notes: string;
}

export interface PropertyDetails {
  propertyType: string; // house, apartment, etc.
  bedrooms: number;
  bathrooms: number;
  parkingSpaces?: number;
  heatingType?: string;
  constructionYear?: number;
  squareFootage?: number;
  epcRating?: string;
  furnished: boolean;
  petFriendly: boolean;
  garden: boolean;
  securityFeatures?: string[];
  keyLocation?: string;
  alarmCode?: string;
  specialInstructions?: string;
  latitude?: number;
  longitude?: number;
}

export interface WeatherCondition {
  temperature?: number;
  condition?: string; // sunny, cloudy, rainy, etc.
  humidity?: number;
  timestamp: string;
}

export interface Signature {
  name: string;
  role: string;
  dataUrl: string;
  timestamp: string;
}

export interface Inspection {
  id: string;
  date: string;
  propertyAddress: string;
  propertyDetails: PropertyDetails;
  landlordName: string;
  landlordContact?: string;
  agentName: string;
  agentContact?: string;
  tenantName: string;
  tenantContact?: string;
  rooms: Room[];
  utilities: Utility;
  compliance: Compliance;
  summaryOfFindings: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'follow-up-required';
  tenantSignature?: Signature;
  agentSignature?: Signature;
  landlordSignature?: Signature;
  nextInspectionDue?: string;
  previousInspectionId?: string;
  createdAt: string;
  updatedAt: string;
  weather?: WeatherCondition;
  reportGenerated: boolean;
  reportUrl?: string;
  actionItems: string[];
  completionPercentage: number;
}
