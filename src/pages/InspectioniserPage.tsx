import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PropertyDashboard } from "@/components/inspectioniser/PropertyDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Building,
  Home,
  Plus,
  Save,
  Settings,
  FileOutput,
  X,
  Minimize2,
  Maximize2,
  FilePlus,
  Upload,
  CheckCircle,
  Camera,
  FileImage,
  Calendar,
  User,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Info,
  BookOpen,
  RotateCcw,
  Clock,
  Star,
  StarHalf,
  PenTool,
  HelpCircle,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Search,
  PlusCircle,
  Palette,
  Download,
} from "lucide-react";
// External libraries to be added later if needed
// import mammoth from "mammoth";
// import html2pdf from "html2pdf.js";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types
// Import enhanced components
import { EnhancedRoomInspection } from "@/components/inspectioniser/EnhancedRoomInspection";
import { EnhancedIssueManager } from "@/components/inspectioniser/EnhancedIssueManager";
import { MainInspectionInterface } from "@/components/inspectioniser/MainInspectionInterface";
import { PropertySummary } from "@/components/inspectioniser/PropertySummary";
import { ReportGenerator } from "@/components/inspectioniser/ReportGenerator";
import { WeatherDisplay } from "@/components/inspectioniser/WeatherDisplay";
// Import types from centralized types file
import { Photo, Issue, Room, RoomFeature, ChecklistItem, PropertyDetails, WeatherCondition, Signature, Inspection, Utility, Compliance } from "@/types/inspection";
import { MapDisplay } from "@/components/inspectioniser/MapDisplay";


interface WindowState {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any; // Additional data to be used by the window
}

interface InspectionTemplate {
  id: string;
  name: string;
  roomTemplates: {
    name: string;
    type: string;
    defaultFeatures: string[];
  }[];
  checklistItems: string[];
  complianceItems: string[];
}

type RoomType = 
  | 'bedroom' 
  | 'bathroom' 
  | 'kitchen' 
  | 'living-room' 
  | 'dining-room' 
  | 'hallway' 
  | 'study' 
  | 'conservatory' 
  | 'utility' 
  | 'garage' 
  | 'garden' 
  | 'loft' 
  | 'basement' 
  | 'other';

type IssueCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'structural' 
  | 'cosmetic' 
  | 'appliance' 
  | 'heating' 
  | 'ventilation' 
  | 'security' 
  | 'safety' 
  | 'pest' 
  | 'damp' 
  | 'mold' 
  | 'cleanliness' 
  | 'furnishing' 
  | 'external' 
  | 'compliance' 
  | 'other';

const InspectioniserPage: React.FC = () => {
  // State
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(2);
  const [highContrast, setHighContrast] = useState(false);
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [savedInspections, setSavedInspections] = useState<Inspection[]>([]);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextWindowId, setNextWindowId] = useState(1);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [multiPropertyText, setMultiPropertyText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  
  // Default room templates
  const defaultRoomTemplates = [
    { name: "Kitchen", condition: 5, notes: "", urgent: false },
    { name: "Living Room", condition: 5, notes: "", urgent: false },
    { name: "Bedroom", condition: 5, notes: "", urgent: false },
    { name: "Bathroom", condition: 5, notes: "", urgent: false },
    { name: "Ensuite", condition: 5, notes: "", urgent: false },
    { name: "Hallway", condition: 5, notes: "", urgent: false },
    { name: "Garden", condition: 5, notes: "", urgent: false },
    { name: "Storage Cupboard", condition: 5, notes: "", urgent: false }
  ];

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('propInspectState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setDarkMode(parsed.darkMode || false);
        setFontSize(parsed.fontSize || 2);
        setHighContrast(parsed.highContrast || false);
        setSavedInspections(parsed.savedInspections || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save state to localStorage
  const saveStateToLocal = () => {
    try {
      const toSave = {
        darkMode,
        fontSize,
        highContrast,
        savedInspections
      };
      localStorage.setItem('propInspectState', JSON.stringify(toSave));
    } catch (e) {
      console.error(e);
    }
  };

  // Generate unique ID
  const generateId = () => {
    return '_' + Math.random().toString(36).substring(2, 11);
  };

  // Create a new inspection
  const startNewInspection = (skipProperty = false) => {
    const now = new Date();
    const id = generateId();
    
    const newInspection: Inspection = {
      id,
      date: now.toISOString(),
      propertyAddress: '',
      propertyDetails: {
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        furnished: false,
        petFriendly: false,
        garden: false,
        latitude: 51.5074, // Default to London coordinates
        longitude: -0.1278
      },
      landlordName: '',
      agentName: '',
      tenantName: '',
      rooms: [],
      utilities: {
        electricMeterReading: '',
        gasMeterReading: '',
        waterMeterReading: '',
        heatingFunctional: true,
        plumbingFunctional: true,
        electricalFunctional: true,
        notes: ''
      },
      summaryOfFindings: '',
      followUpRequired: false,
      status: 'draft',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      reportGenerated: false,
      actionItems: [],
      completionPercentage: 0,
      compliance: {
        gasChecked: false,
        electricChecked: false,
        fireChecked: false,
        legionellaChecked: false,
        asbestosChecked: false,
        notes: ''
      }
    };
    
    setCurrentInspection(newInspection);
    // Add the new inspection to localStorage
    const savedInspections = localStorage.getItem('inspections');
    const inspections = savedInspections ? JSON.parse(savedInspections) : [];
    localStorage.setItem('inspections', JSON.stringify([newInspection, ...inspections]));
    
    if (skipProperty) {
      // Skip property details and go straight to adding rooms
      createRoomsManagementWindow();
    } else {
      createPropertyDetailsWindow();
    }
    
    // Save to localStorage
    saveStateToLocal();
  };

  // Load an existing inspection
  const loadInspection = (id: string) => {
    const inspection = savedInspections.find(insp => insp.id === id);
    if (inspection) {
      setCurrentInspection(inspection);
      setShowStartScreen(false);
      createRoomsManagementWindow();
    }
  };

  // Delete an inspection
  const deleteInspection = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inspection?")) {
      const updatedInspections = savedInspections.filter(insp => insp.id !== id);
      setSavedInspections(updatedInspections);
      saveStateToLocal();
    }
  };

  // Create multiple inspections from text input
  const createMultipleInspections = () => {
    if (!multiPropertyText.trim()) return;
    
    const lines = multiPropertyText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let count = 0;
    
    const newInspections = [...savedInspections];
    lines.forEach(line => {
      const newInsp: Inspection = {
        id: generateId(),
        date: new Date().toISOString(),
        propertyAddress: line,
        propertyDetails: {
          propertyType: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          furnished: false,
          petFriendly: false,
          garden: false,
          latitude: 51.5074, // Default to London coordinates
          longitude: -0.1278
        },
        landlordName: "",
        landlordContact: "",
        agentName: "",
        agentContact: "",
        tenantName: "",
        tenantContact: "",
        rooms: [],
        
        utilities: {
          electricMeterReading: '',
          gasMeterReading: '',
          waterMeterReading: '',
          heatingFunctional: true,
          plumbingFunctional: true,
          electricalFunctional: true,
          notes: ""
        },
        compliance: {
          gasChecked: false,
          electricChecked: false,
          fireChecked: false,
          legionellaChecked: false,
          asbestosChecked: false,
          notes: ""
        },
        summaryOfFindings: "",
        
        followUpRequired: false,
        nextInspectionDue: "",
        
        tenantSignature: undefined,
        agentSignature: undefined,
        status: 'draft',
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportGenerated: false,
        actionItems: [],
        completionPercentage: 0
      };
      newInspections.push(newInsp);
      count++;
    });
    
    setSavedInspections(newInspections);
    saveStateToLocal();
    setMultiPropertyText("");
    alert(`Created ${count} new inspections!`);
  };

  // File upload handler
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    setUploadedFileName(file.name);
    let text = "";
    
    try {
      const fileName = file.name.toLowerCase();
      // Simplified file handling without mammoth.js for now
      if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        // For now we'll show a message about DOCX support being added later
        alert("DOCX parsing support will be added in a future update. Please use text files for now.");
        return;
      } else if (fileName.endsWith('.txt')) {
        text = await file.text();
      } else {
        alert("Unsupported file type. Please upload a .txt file.");
        return;
      }
      
      autopopulateInspectionFromText(text);
    } catch (e) {
      console.warn("Document parse error:", e);
      alert("Error reading file. Please try again with a plain text (.txt) file.");
    }
  };

  // Parse text to populate inspection details
  const autopopulateInspectionFromText = (text: string) => {
    startNewInspection(true);
    
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    if (currentInspection) {
      const updatedInspection = { ...currentInspection };
      
      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith("property:") || lower.startsWith("address:")) {
          updatedInspection.propertyAddress = line.split(':')[1].trim();
        }
        if (lower.startsWith("tenant:") || lower.startsWith("tenants:")) {
          updatedInspection.tenantName = line.split(':')[1].trim();
        }
        if (lower.startsWith("landlord:")) {
          updatedInspection.landlordName = line.split(':')[1].trim();
        }
        if (lower.startsWith("agent:")) {
          updatedInspection.agentName = line.split(':')[1].trim();
        }
        if (lower.includes("bedrooms:") || lower.includes("beds:")) {
          const match = line.match(/\d+/);
          if (match) {
            updatedInspection.propertyDetails.bedrooms = parseInt(match[0], 10);
          }
        }
        if (lower.includes("bathrooms:") || lower.includes("baths:")) {
          const match = line.match(/\d+/);
          if (match) {
            updatedInspection.propertyDetails.bathrooms = parseInt(match[0], 10);
          }
        }
        if (lower.includes("start date") || lower.includes("inspection date")) {
          let splitted = line.split(':');
          if (splitted.length > 1) {
            updatedInspection.date = splitted[1].trim();
            // Try to parse the date properly
            try {
              const parsedDate = new Date(splitted[1].trim());
              if (!isNaN(parsedDate.getTime())) {
                updatedInspection.date = parsedDate.toISOString();
              }
            } catch (e) {
              // Keep the string version if parsing fails
            }
          }
        }
        if (lower.includes("property type:") || lower.includes("type of property:")) {
          let splitted = line.split(':');
          if (splitted.length > 1) {
            updatedInspection.propertyDetails.propertyType = splitted[1].trim().toLowerCase();
          }
        }
        if (lower.includes("furnished")) {
          updatedInspection.propertyDetails.furnished = lower.includes("yes") || 
            lower.includes("true") || 
            lower.includes("fully") || 
            !lower.includes("unfurnished");
        }
        // Look for information about rooms
        if (lower.includes("room") && lower.includes("condition")) {
          // Try to extract room information
          const roomMatch = line.match(/([\w\s]+)room[\s:]+([\w\s]+)/);
          if (roomMatch && roomMatch.length > 2) {
            const roomName = roomMatch[1].trim() + " Room";
            const conditionText = roomMatch[2].trim();
            let condition = 5; // Default condition
            
            // Try to parse condition
            if (/excellent|perfect|great/i.test(conditionText)) condition = 9;
            else if (/good|fine/i.test(conditionText)) condition = 7;
            else if (/average|ok|acceptable/i.test(conditionText)) condition = 5;
            else if (/poor|bad/i.test(conditionText)) condition = 3;
            else if (/terrible|unacceptable/i.test(conditionText)) condition = 1;
            
            // Create a new room
            const newRoom: Room = {
              id: generateId(),
              name: roomName,
              type: roomName.toLowerCase().includes('bed') ? 'bedroom' : 
                   roomName.toLowerCase().includes('bath') ? 'bathroom' : 
                   roomName.toLowerCase().includes('kitchen') ? 'kitchen' : 
                   roomName.toLowerCase().includes('living') ? 'living-room' : 'other',
              condition: condition,
              notes: `Auto-extracted from text: ${line}`,
              photos: [],
              issues: [],
              features: [],
              checklist: [],
              inspectionComplete: false,
              urgent: /urgent|immediate|critical/i.test(conditionText),
              cleanlinessRating: condition,
              wallsCondition: condition,
              flooringCondition: condition,
              windowsCondition: condition,
              doorsCondition: condition,
              ceilingCondition: condition,
              lightingCondition: condition,
              dampIssues: /damp|moist|wet/i.test(conditionText),
              moldIssues: /mold|mould|fungus/i.test(conditionText),
              pestIssues: /pest|insect|rodent/i.test(conditionText),
              electricalIssues: /electric|wiring|socket/i.test(conditionText),
              plumbingIssues: /plumbing|leak|tap|faucet/i.test(conditionText),
              heatingIssues: /heating|radiator|cold/i.test(conditionText),
              safetyIssues: /safety|hazard|dangerous/i.test(conditionText)
            };
            
            updatedInspection.rooms.push(newRoom);
          }
        }
      });
      
      setCurrentInspection(updatedInspection);
    }
    
    alert("Form file parsed! Data autopopulated. Please confirm details next.");
    setShowStartScreen(false);
    createPropertyDetailsWindow();
  };

  // Window management functions
  const createPropertyDetailsWindow = () => {
    const newWindow: WindowState = {
      id: generateId(),
      type: 'property-details',
      title: 'Property Details',
      position: { x: 80, y: 80 },
      size: { width: 600, height: 500 },
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1
    };
    setWindows([...windows, newWindow]);
  };

  const createRoomsManagementWindow = () => {
    const newWindow: WindowState = {
      id: generateId(),
      type: 'rooms-management',
      title: 'Manage Rooms',
      position: { x: 100, y: 100 },
      size: { width: 600, height: 500 },
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1
    };
    setWindows([...windows, newWindow]);
  };
  
  // Create a window for room detail
  const createRoomDetailWindow = (room: Room) => {
    const newWindow: WindowState = {
      id: generateId(),
      type: 'room-detail',
      title: `${room.name} Details`,
      position: { x: 120, y: 120 },
      size: { width: 650, height: 550 },
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
      data: { roomId: room.id }
    };
    setWindows([...windows, newWindow]);
  };
  
  // Create a window for issue detail
  const createIssueDetailWindow = (issue: Issue, roomId: string) => {
    const newWindow: WindowState = {
      id: generateId(),
      type: 'issue-detail',
      title: `Issue: ${issue.title}`,
      position: { x: 140, y: 140 },
      size: { width: 600, height: 500 },
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 1,
      data: { issueId: issue.id, roomId }
    };
    setWindows([...windows, newWindow]);
  };

  // Save current inspection
  const saveCurrentInspection = () => {
    if (!currentInspection) return;
    
    // Check if we're updating an existing inspection or adding a new one
    const existingIndex = savedInspections.findIndex(insp => insp.id === currentInspection.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedInspections = [...savedInspections];
      updatedInspections[existingIndex] = currentInspection;
      setSavedInspections(updatedInspections);
    } else {
      // Add new
      setSavedInspections([...savedInspections, currentInspection]);
    }
    
    saveStateToLocal();
    alert("Inspection saved successfully!");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!currentInspection) {
      alert("No active inspection to export");
      return;
    }
    
    // Create a print-friendly version of the inspection report
    const reportContent = `
      <html>
      <head>
        <title>Property Inspection Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e293b; }
          .room { margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; }
          .signatures { margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>Property Inspection Report</h1>
        <p><strong>Property:</strong> ${currentInspection.propertyAddress}</p>
        <p><strong>Date:</strong> ${new Date(currentInspection.date).toLocaleDateString()}</p>
        <p><strong>Agent:</strong> ${currentInspection.agentName}</p>
        <p><strong>Tenant:</strong> ${currentInspection.tenantName}</p>
        
        <h2>Room Inspections</h2>
        ${currentInspection.rooms.map(room => `
          <div class="room">
            <h3>${room.name}</h3>
            <p><strong>Condition:</strong> ${room.condition}/5</p>
            <p><strong>Urgent Attention Required:</strong> ${room.urgent ? 'Yes' : 'No'}</p>
            <p><strong>Notes:</strong> ${room.notes || 'None'}</p>
          </div>
        `).join('')}
        
        <div class="signatures">
          <p><strong>Agent Signature:</strong> ${currentInspection.agentSignature || '_________________'}</p>
          <p><strong>Tenant Signature:</strong> ${currentInspection.tenantSignature || '_________________'}</p>
        </div>
      </body>
      </html>
    `;
    
    // Create a Blob from the HTML content
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window/tab for printing
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        URL.revokeObjectURL(url);
      };
    } else {
      alert("Please allow pop-ups for printing functionality");
      // Fallback: offer direct download
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspection_${currentInspection.propertyAddress.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  // Return to home screen
  const returnToHome = () => {
    setShowStartScreen(true);
  };

  // Toggle settings panel
  const toggleSettingsPanel = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };

  // Settings functions
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    saveStateToLocal();
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    saveStateToLocal();
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 3));
    saveStateToLocal();
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 1));
    saveStateToLocal();
  };

  const resetFontSize = () => {
    setFontSize(2);
    saveStateToLocal();
  };

  // Render the start screen with Art Deco styling
  const renderStartScreen = () => (
    <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl w-full bg-card p-12 rounded-lg border-2 border-gold-400/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] overflow-hidden relative">
        {/* Art Deco decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-300/30 via-gold-400 to-gold-300/30"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-gold-300/30 via-gold-400 to-gold-300/30"></div>
        <div className="absolute top-2 left-0 w-2 h-[calc(100%-4px)] bg-gradient-to-b from-gold-300/30 via-gold-400 to-gold-300/30"></div>
        <div className="absolute top-2 right-0 w-2 h-[calc(100%-4px)] bg-gradient-to-b from-gold-300/30 via-gold-400 to-gold-300/30"></div>
        
        <div className="text-center mb-10 relative">
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center opacity-5">
            <div className="w-72 h-72 rounded-full border-[30px] border-gold-400"></div>
          </div>
          <div className="inline-block p-4 relative">
            <Building className="w-16 h-16 mx-auto mb-2 text-gold-400" />
            <h1 className="text-5xl font-artdeco mb-1 tracking-wider text-gold-500 dark:text-gold-400">INSPECTIONISER</h1>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold-400/50 to-transparent my-3"></div>
            <p className="text-lg italic text-muted-foreground uppercase tracking-widest">Elegant Property Inspection Tool</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <div className="bg-background/40 dark:bg-background/60 backdrop-blur-sm p-6 rounded-lg border border-gold-400/20 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-500 dark:text-gold-400 group-hover:scale-110 transition-transform duration-300">
                  <FileImage className="w-5 h-5" />
                </div>
                <h3 className="font-artdeco text-lg tracking-wide">Import Inspection Data</h3>
              </div>
              
              <div 
                className="border-2 border-dashed border-gold-400/30 rounded-lg p-6 text-center cursor-pointer hover:bg-gold-400/5 transition-colors group-hover:border-gold-400/50 flex flex-col items-center"
                onClick={() => document.getElementById('form-file-input')?.click()}
                // Drag and drop handlers would be implemented here
              >
                <Upload className="w-10 h-10 mx-auto mb-4 text-gold-500/60 dark:text-gold-400/60 group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors" />
                <p className="mb-2 text-muted-foreground group-hover:text-foreground transition-colors">Drag and drop inspection form or click to browse</p>
                <p className="text-xs text-muted-foreground/70">Supports .txt files (DOCX support coming soon)</p>
                <input 
                  type="file" 
                  id="form-file-input" 
                  className="hidden" 
                  accept=".doc,.docx,.txt"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                />
              </div>
            </div>
            
            <div className="bg-background/40 dark:bg-background/60 backdrop-blur-sm p-6 rounded-lg border border-gold-400/20 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-500 dark:text-gold-400 group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="font-artdeco text-lg tracking-wide">Bulk Property Creation</h3>
              </div>
              
              <Textarea 
                value={multiPropertyText}
                onChange={(e) => setMultiPropertyText(e.target.value)}
                placeholder="123 Main Street, London&#10;45B Park Avenue, Manchester&#10;Flat 7, 22 River Road, Liverpool"
                className="mb-4 border-gold-400/20 focus:border-gold-400 bg-background/80 h-[120px] text-sm"
              />
              <Button 
                onClick={createMultipleInspections}
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-artdeco tracking-wider border-b-2 border-gold-700 hover:border-gold-800 transition-all"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Multiple Inspections
              </Button>
            </div>
          </div>
          
          <div className="space-y-6 flex flex-col">
            <div className="bg-background/40 dark:bg-background/60 backdrop-blur-sm p-6 rounded-lg border border-gold-400/20 shadow-md flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-500 dark:text-gold-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-artdeco text-lg tracking-wide">Recent Inspections</h3>
              </div>
              
              <div className="overflow-hidden rounded-lg border border-gold-400/10 flex-1 flex flex-col">
                <div className="bg-background/60 text-xs uppercase tracking-wider font-medium text-muted-foreground p-2 border-b border-gold-400/10 flex">
                  <div className="flex-1">Property</div>
                  <div className="w-24 text-center">Status</div>
                  <div className="w-20 text-center">Actions</div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {savedInspections.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground/70 bg-grid-pattern">
                      <ClipboardCheck className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p>No saved inspections found</p>
                      <p className="text-xs mt-2">Start a new inspection to begin</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[230px]">
                      {savedInspections.map(inspection => (
                        <div key={inspection.id} className="flex items-center p-3 border-b border-gold-400/10 hover:bg-gold-400/5 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{inspection.propertyAddress}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(inspection.date), 'dd MMM yyyy')}
                              {inspection.rooms.length > 0 && (
                                <span className="ml-2 flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {inspection.rooms.length} rooms
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-24 text-center">
                            <Badge 
                              variant={inspection.status === 'draft' ? 'outline' : 
                                      inspection.status === 'completed' ? 'default' : 
                                      inspection.status === 'follow-up-required' ? 'destructive' : 
                                      'secondary'}
                              className="text-xs font-normal"
                            >
                              {inspection.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="w-20 flex justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => loadInspection(inspection.id)}
                              title="Open Inspection"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteInspection(inspection.id)}
                              title="Delete Inspection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => startNewInspection(false)}
              className="w-full py-8 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-artdeco text-lg tracking-widest border-b-4 border-gold-700 hover:border-gold-800 transition-all group shadow-lg hover:shadow-xl animate-subtle-pulse"
            >
              <CheckCircle className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" /> 
              <span className="flex flex-col items-center">
                <span>Begin New Inspection</span>
                <span className="text-xs font-normal opacity-80 tracking-normal mt-1">Full property assessment with photo documentation</span>
              </span>
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="text-xs text-muted-foreground flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
            </span>
            <span>Professional inspection reporting</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
              <Star className="w-3 h-3 text-gold-400" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-background">
      {showStartScreen ? (
        renderStartScreen()
      ) : (
        <div className="w-full h-full">
          {/* Main interface will be implemented here */}
          <div className="w-full h-10 bg-primary flex justify-between items-center px-4 text-white">
            <div className="font-artdeco font-bold uppercase tracking-wide">InspectSpace</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => startNewInspection(false)} title="New Inspection">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={saveCurrentInspection} title="Save Inspection">
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={exportToPDF} title="Export PDF">
                <FileOutput className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleSettingsPanel} title="Settings">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={returnToHome} title="Return to Home">
                <Home className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative w-full h-[calc(100%-2.5rem)]">
            {/* Windows and desktop area will be implemented here */}
            <div className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inspectioniser</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>The fully interactive window system is being implemented. This is a placeholder interface.</p>
                  
                  {currentInspection && (
                    <div className="space-y-6">
                      {/* Property Dashboard */}
                      <PropertyDashboard 
                        inspection={currentInspection}
                        onRoomSelect={(roomId) => {
                          // Open room details in a new window
                          const selectedRoom = currentInspection.rooms.find(r => r.id === roomId);
                          if (selectedRoom) {
                            createRoomDetailWindow(selectedRoom);
                          }
                        }}
                        onIssueSelect={(issueId) => {
                          // Find and open issue details
                          currentInspection.rooms.forEach(room => {
                            const issue = room.issues.find(i => i.id === issueId);
                            if (issue) {
                              createIssueDetailWindow(issue, room.id);
                            }
                          });
                        }}
                        onEditDetails={() => {
                          createPropertyDetailsWindow();
                        }}
                      />
                      
                      <div className="flex gap-2 mt-4">
                        <Button onClick={saveCurrentInspection}>Save Inspection</Button>
                        <Button onClick={exportToPDF}>Export to PDF</Button>
                        <Button variant="outline" onClick={returnToHome}>Return to Home</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Settings panel */}
            {showSettingsPanel && (
              <div className="absolute top-0 right-0 w-80 bg-card border-l border-b border-border rounded-bl-lg shadow-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-border">
                  <h3 className="font-artdeco">Settings</h3>
                  <Button variant="ghost" size="sm" onClick={toggleSettingsPanel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 border-b border-border">
                  <h4 className="font-artdeco uppercase mb-4">Appearance</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="dark-mode"
                          checked={darkMode}
                          onChange={toggleDarkMode}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${darkMode ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="high-contrast">High Contrast</Label>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="high-contrast"
                          checked={highContrast}
                          onChange={toggleHighContrast}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full ${highContrast ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${highContrast ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                    <div>
                      <Label className="block mb-2">Font Size</Label>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={decreaseFontSize}>A-</Button>
                        <Button size="sm" onClick={resetFontSize}>Reset</Button>
                        <Button size="sm" onClick={increaseFontSize}>A+</Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-artdeco uppercase mb-4">About</h4>
                  <p className="text-sm">InspectSpace v1.0</p>
                  <p className="text-sm">A property inspection tool for letting agents.</p>
                  <p className="text-sm"> 2025 InspectSpace</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Render floating windows for room and issue details */}
      {windows.map((window) => {
        if (!currentInspection) return null;
        if (window.type === 'room-detail') {
          const room = currentInspection.rooms.find(r => r.id === window.data?.roomId);
          if (!room) return null;
          return (
            <div key={window.id} className="fixed z-[9999] bg-background border border-gold-400/40 rounded-lg shadow-lg p-4" style={{ left: window.position.x, top: window.position.y, width: window.size.width, height: window.size.height }}>
              <EnhancedRoomInspection
                room={room}
                onUpdateRoom={(updatedRoom) => {
                  setCurrentInspection(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      rooms: prev.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
                    };
                  });
                }}
                onSaveRoom={(roomId) => {
                  // Save state to localStorage after room is updated
                  saveStateToLocal();
                }}
                onAddIssue={(newIssue) => {
                  setCurrentInspection(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      rooms: prev.rooms.map(r => 
                        r.id === room.id ? { ...r, issues: [...r.issues, newIssue] } : r
                      )
                    };
                  });
                  saveStateToLocal();
                }}
              />
            </div>
          );
        }
        if (window.type === 'issue-detail') {
          const room = currentInspection.rooms.find(r => r.id === window.data?.roomId);
          const issue = room?.issues.find(i => i.id === window.data?.issueId);
          if (!room || !issue) return null;
          return (
            <div key={window.id} className="fixed z-[9999] bg-background border border-gold-400/40 rounded-lg shadow-lg p-4" style={{ left: window.position.x, top: window.position.y, width: window.size.width, height: window.size.height }}>
              <EnhancedIssueManager
                issue={issue}
                roomId={room.id}
                roomName={room.name}
                onUpdateIssue={(updatedIssue) => {
                  setCurrentInspection(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      rooms: prev.rooms.map(r =>
                        r.id === room.id ? { ...r, issues: r.issues.map(i => i.id === updatedIssue.id ? updatedIssue : i) } : r
                      )
                    };
                  });
                  // Save state to localStorage after issue is updated
                  saveStateToLocal();
                }}
                onDeleteIssue={(issueId) => {
                  setCurrentInspection(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      rooms: prev.rooms.map(r =>
                        r.id === room.id ? { ...r, issues: r.issues.filter(i => i.id !== issueId) } : r
                      )
                    };
                  });
                  // Save state to localStorage after issue is deleted
                  saveStateToLocal();
                }}
                availableStaff={[
                  { id: '1', name: 'John Smith', role: 'Property Manager' },
                  { id: '2', name: 'Sarah Johnson', role: 'Maintenance Supervisor' },
                  { id: '3', name: 'Michael Brown', role: 'Letting Agent' }
                ]}
                allRooms={currentInspection.rooms}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default InspectioniserPage;
