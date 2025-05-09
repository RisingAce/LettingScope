import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { PropertySummary } from './PropertySummary';
import { EnhancedRoomInspection } from './EnhancedRoomInspection';
import { EnhancedIssueManager } from './EnhancedIssueManager';
import { ReportGenerator } from './ReportGenerator';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Clipboard, 
  FileText, 
  Home, 
  Plus, 
  Settings, 
  AlertTriangle, 
  Save,
  CloudSun,
  Database
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';

// Import from our types
import { Inspection, Room, Issue, Photo, WeatherCondition } from '@/types/inspection';

// Mock staff members for demo purposes
const MOCK_STAFF = [
  { id: '1', name: 'John Smith', role: 'Property Manager', avatarUrl: '' },
  { id: '2', name: 'Sarah Jones', role: 'Maintenance Supervisor', avatarUrl: '' },
  { id: '3', name: 'Mike Wilson', role: 'Letting Agent', avatarUrl: '' }
];

// Room types
const ROOM_TYPES = [
  'Bedroom', 'Bathroom', 'Kitchen', 'Living Room', 'Dining Room', 
  'Hallway', 'Office', 'Conservatory', 'Utility Room', 'Garden', 'Garage'
];

interface MainInspectionInterfaceProps {
  inspection: Inspection;
  onUpdateInspection: (inspection: Inspection) => void;
  onSaveInspection: (inspection: Inspection) => void;
  onGenerateReport: (inspection: Inspection) => Promise<string>;
  onSendReport: (inspection: Inspection, email: string) => Promise<boolean>;
  onFetchWeather?: (latitude: number, longitude: number) => Promise<WeatherCondition>;
  onConnectPropertyDatabase?: () => Promise<any>;
}

export const MainInspectionInterface: React.FC<MainInspectionInterfaceProps> = ({
  inspection,
  onUpdateInspection,
  onSaveInspection,
  onGenerateReport,
  onSendReport,
  onFetchWeather,
  onConnectPropertyDatabase
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('Bedroom');
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  
  // Find selected room
  const selectedRoom = selectedRoomId 
    ? inspection.rooms.find(room => room.id === selectedRoomId) || null 
    : null;
  
  // Find the selected issue based on the selectedIssueId
  const selectedIssue = selectedIssueId
    ? inspection.rooms.flatMap(room => room.issues).find(issue => issue.id === selectedIssueId) || null
    : null;
  
  // Find the room containing the selected issue
  const selectedIssueRoom = selectedIssue
    ? inspection.rooms.find(room => room.issues.some(issue => issue.id === selectedIssueId)) || null
    : null;
  
  // Generate a unique ID
  const generateId = () => '_' + Math.random().toString(36).substring(2, 11);
  
  // Add a new room
  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    
    const newRoom: Room = {
      id: generateId(),
      name: newRoomName.trim(),
      type: newRoomType,
      condition: 5, // Default middle rating
      notes: '',
      photos: [],
      issues: [],
      features: [],
      checklist: [],
      urgent: false,
      cleanlinessRating: 5,
      wallsCondition: 5,
      flooringCondition: 5,
      windowsCondition: 5,
      doorsCondition: 5,
      ceilingCondition: 5,
      lightingCondition: 5,
      dampIssues: false,
      moldIssues: false,
      pestIssues: false,
      electricalIssues: false,
      plumbingIssues: false,
      heatingIssues: false,
      safetyIssues: false,
      inspectionComplete: false
    };
    
    const updatedInspection = {
      ...inspection,
      rooms: [...inspection.rooms, newRoom]
    };
    
    onUpdateInspection(updatedInspection);
    setNewRoomName('');
    setNewRoomType('Bedroom');
    setIsAddingRoom(false);
    setSelectedRoomId(newRoom.id);
    setActiveTab('room');
  };
  
  // Update a room
  const handleUpdateRoom = (updatedRoom: Room) => {
    const updatedInspection = {
      ...inspection,
      rooms: inspection.rooms.map(room => 
        room.id === updatedRoom.id ? updatedRoom : room
      )
    };
    
    onUpdateInspection(updatedInspection);
  };
  
  // Handle adding an issue to a room
  const handleAddIssue = (roomId: string, newIssue: Issue) => {
    const updatedInspection = {
      ...inspection,
      rooms: inspection.rooms.map(room => 
        room.id === roomId
          ? { ...room, issues: [...room.issues, newIssue] }
          : room
      )
    };
    
    onUpdateInspection(updatedInspection);
    setSelectedIssueId(newIssue.id);
    setActiveTab('issue');
  };
  
  // Update an issue
  const handleUpdateIssue = (updatedIssue: Issue) => {
    if (!selectedIssueRoom) return;
    
    const updatedInspection = {
      ...inspection,
      rooms: inspection.rooms.map(room => 
        room.id === selectedIssueRoom.id
          ? { 
              ...room, 
              issues: room.issues.map(issue => 
                issue.id === updatedIssue.id ? updatedIssue : issue
              ) 
            }
          : room
      )
    };
    
    onUpdateInspection(updatedInspection);
  };
  
  // Delete an issue
  const handleDeleteIssue = (issueId: string) => {
    if (!selectedIssueRoom) return;
    
    const updatedInspection = {
      ...inspection,
      rooms: inspection.rooms.map(room => 
        room.id === selectedIssueRoom.id
          ? { ...room, issues: room.issues.filter(issue => issue.id !== issueId) }
          : room
      )
    };
    
    onUpdateInspection(updatedInspection);
    setSelectedIssueId(null);
    setActiveTab('overview');
  };
  
  // Save room data
  const handleSaveRoom = (roomId: string) => {
    setIsSaving(true);
    
    setTimeout(() => {
      onSaveInspection(inspection);
      setIsSaving(false);
    }, 500);
  };
  
  // Fetch weather data
  const fetchWeatherData = async () => {
    if (!onFetchWeather || !inspection.propertyDetails?.latitude || !inspection.propertyDetails?.longitude) {
      return;
    }
    
    setIsFetchingWeather(true);
    
    try {
      const weather = await onFetchWeather(
        inspection.propertyDetails.latitude,
        inspection.propertyDetails.longitude
      );
      
      onUpdateInspection({
        ...inspection,
        weather
      });
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setIsFetchingWeather(false);
    }
  };
  
  // Connect to property database
  const connectPropertyDatabase = async () => {
    if (!onConnectPropertyDatabase) return;
    
    try {
      const result = await onConnectPropertyDatabase();
      // Process result, perhaps update the inspection with data from the database
      console.log('Connected to property database:', result);
    } catch (error) {
      console.error('Failed to connect to property database:', error);
    }
  };
  
  // Generate a report
  const handleGenerateReport = async () => {
    try {
      const reportUrl = await onGenerateReport(inspection);
      
      onUpdateInspection({
        ...inspection,
        reportGenerated: true,
        reportUrl
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };
  
  // Send a report
  const handleSendReport = async (email: string) => {
    try {
      const success = await onSendReport(inspection, email);
      return success;
    } catch (error) {
      console.error('Failed to send report:', error);
      return false;
    }
  };
  
  // Update property details
  const handleEditPropertyDetails = () => {
    // Implement property details editing
    // This could open a modal or navigate to a property details page
    console.log('Edit property details');
  };
  
  // Calculate issue statistics
  const calcIssueStats = () => {
    const allIssues = inspection.rooms.flatMap(room => room.issues);
    const criticalCount = allIssues.filter(issue => issue.severity === 'critical').length;
    const highCount = allIssues.filter(issue => issue.severity === 'high').length;
    const mediumCount = allIssues.filter(issue => issue.severity === 'medium').length;
    const lowCount = allIssues.filter(issue => issue.severity === 'low').length;
    
    return { total: allIssues.length, critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount };
  };
  
  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (inspection.rooms.length === 0) return 0;
    
    const totalRooms = inspection.rooms.length;
    const completedRooms = inspection.rooms.filter(room => room.inspectionComplete).length;
    
    return Math.round((completedRooms / totalRooms) * 100);
  };
  
  useEffect(() => {
    // Update completion percentage whenever rooms change
    const completionPercentage = calculateCompletionPercentage();
    if (inspection.completionPercentage !== completionPercentage) {
      onUpdateInspection({
        ...inspection,
        completionPercentage
      });
    }
  }, [inspection.rooms]);
  
  return (
    <div className="main-inspection-interface h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gold-400/30 bg-gradient-to-r from-gold-600/5 to-gold-400/5">
        <div className="flex items-center gap-4">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className={activeTab === 'overview' ? 'bg-gold-600 hover:bg-gold-700 text-white' : ''}
            onClick={() => {
              setActiveTab('overview');
              setSelectedRoomId(null);
              setSelectedIssueId(null);
            }}
          >
            <Building className="h-4 w-4 mr-2" />
            Property Overview
          </Button>
          
          <Button
            variant={activeTab === 'room' ? 'default' : 'ghost'}
            className={activeTab === 'room' ? 'bg-gold-600 hover:bg-gold-700 text-white' : ''}
            disabled={!selectedRoomId}
            onClick={() => setActiveTab('room')}
          >
            <Home className="h-4 w-4 mr-2" />
            Room Inspection
          </Button>
          
          <Button
            variant={activeTab === 'issue' ? 'default' : 'ghost'}
            className={activeTab === 'issue' ? 'bg-gold-600 hover:bg-gold-700 text-white' : ''}
            disabled={!selectedIssueId}
            onClick={() => setActiveTab('issue')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Issue Details
          </Button>
          
          <Button
            variant={activeTab === 'report' ? 'default' : 'ghost'}
            className={activeTab === 'report' ? 'bg-gold-600 hover:bg-gold-700 text-white' : ''}
            onClick={() => setActiveTab('report')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onSaveInspection(inspection)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Tools
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={fetchWeatherData}
                  disabled={isFetchingWeather || !inspection.propertyDetails?.latitude}
                >
                  <CloudSun className="h-4 w-4 mr-2" />
                  {isFetchingWeather ? 'Fetching Weather...' : 'Fetch Weather Data'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={connectPropertyDatabase}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Connect to Property DB
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gold-400/30 bg-gradient-to-b from-gold-50/50 to-gold-100/20 dark:from-gold-950/20 dark:to-gold-950/10 flex flex-col">
          <div className="p-4 border-b border-gold-400/30">
            <h2 className="text-xl font-artdeco tracking-wide text-gold-800 dark:text-gold-400">
              Rooms & Issues
            </h2>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Rooms List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Rooms ({inspection.rooms.length})</h3>
                  <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Room</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="roomName">Room Name</Label>
                          <Input
                            id="roomName"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="e.g. Master Bedroom"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="roomType">Room Type</Label>
                          <Select value={newRoomType} onValueChange={setNewRoomType}>
                            <SelectTrigger id="roomType">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          onClick={handleAddRoom} 
                          className="w-full bg-gold-600 hover:bg-gold-700 text-white"
                        >
                          Add Room
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-1">
                  {inspection.rooms.map(room => (
                    <div 
                      key={room.id}
                      className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                        selectedRoomId === room.id 
                          ? 'bg-gold-200/70 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300' 
                          : 'hover:bg-gold-100/50 dark:hover:bg-gold-900/20'
                      }`}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setActiveTab('room');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="text-sm">{room.name}</span>
                      </div>
                      
                      {room.inspectionComplete ? (
                        <span className="h-2 w-2 rounded-full bg-green-500" title="Inspection Complete"></span>
                      ) : room.urgent ? (
                        <span className="h-2 w-2 rounded-full bg-red-500" title="Urgent Issues"></span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-amber-500" title="In Progress"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Issues List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Issues ({calcIssueStats().total})</h3>
                </div>
                
                <div className="space-y-1">
                  {inspection.rooms
                    .flatMap(room => room.issues.map(issue => ({ ...issue, roomId: room.id, roomName: room.name })))
                    .sort((a, b) => {
                      // Sort by severity (critical first)
                      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
                    })
                    .map(issue => (
                      <div 
                        key={issue.id}
                        className={`p-2 rounded-md cursor-pointer ${
                          selectedIssueId === issue.id 
                            ? 'bg-gold-200/70 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300' 
                            : 'hover:bg-gold-100/50 dark:hover:bg-gold-900/20'
                        }`}
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setActiveTab('issue');
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            issue.severity === 'critical' ? 'bg-red-500' :
                            issue.severity === 'high' ? 'bg-amber-500' :
                            issue.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-sm truncate">{issue.title}</span>
                        </div>
                        <div className="ml-4 text-xs text-muted-foreground">
                          {issue.roomName}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          {/* Progress Summary */}
          <div className="p-4 border-t border-gold-400/30 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Inspection Progress</span>
                <span className="font-medium">{calculateCompletionPercentage()}%</span>
              </div>
              <div className="w-full h-2 bg-gold-200/50 dark:bg-gold-950/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold-600 dark:bg-gold-400"
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Rooms</span>
                <div>
                  <span className="font-medium">{inspection.rooms.filter(r => r.inspectionComplete).length}</span>
                  <span className="text-muted-foreground">/{inspection.rooms.length} completed</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Issues</span>
                <div>
                  <span className="font-medium">{calcIssueStats().total}</span>
                  {calcIssueStats().critical > 0 && (
                    <span className="text-red-500 ml-1">({calcIssueStats().critical} critical)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <PropertySummary 
              inspection={inspection}
              onEditDetails={handleEditPropertyDetails}
            />
          )}
          
          {activeTab === 'room' && selectedRoom && (
            <EnhancedRoomInspection
              room={selectedRoom}
              onUpdateRoom={handleUpdateRoom}
              onAddIssue={(issue) => handleAddIssue(selectedRoom.id, issue)}
              onSaveRoom={handleSaveRoom}
            />
          )}
          
          {activeTab === 'issue' && selectedIssue && selectedIssueRoom && (
            <EnhancedIssueManager
              issue={selectedIssue}
              roomId={selectedIssueRoom.id}
              roomName={selectedIssueRoom.name}
              onUpdateIssue={handleUpdateIssue}
              onDeleteIssue={handleDeleteIssue}
              availableStaff={MOCK_STAFF}
              allRooms={inspection.rooms}
            />
          )}
          
          {activeTab === 'report' && (
            <ReportGenerator
              inspection={inspection}
              onUpdateInspection={(updates) => onUpdateInspection({ ...inspection, ...updates })}
              onGenerateReport={handleGenerateReport}
              onSendReport={handleSendReport}
            />
          )}
        </div>
      </div>
    </div>
  );
};
