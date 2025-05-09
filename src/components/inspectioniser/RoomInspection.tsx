import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Droplets, 
  Wind, 
  Zap, 
  Thermometer, 
  Bug, 
  ShieldAlert 
} from 'lucide-react';
import { PhotoUploader } from './PhotoUploader';

// Import types from your application
interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  timestamp: string;
  roomId?: string;
  issueId?: string;
}

interface Issue {
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
}

interface RoomFeature {
  id: string;
  name: string;
  condition: number;
  notes?: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  condition: number;
  notes: string;
  photos: Photo[];
  issues: Issue[];
  features: RoomFeature[];
  urgent: boolean;
  cleanlinessRating: number;
  wallsCondition: number;
  flooringCondition: number;
  windowsCondition: number;
  doorsCondition: number;
  ceilingCondition: number;
  lightingCondition: number;
  furnitureCondition?: number;
  appliancesCondition?: number;
  dampIssues: boolean;
  moldIssues: boolean;
  pestIssues: boolean;
  electricalIssues: boolean;
  plumbingIssues: boolean;
  heatingIssues: boolean;
  safetyIssues: boolean;
  lastInspectionNotes?: string;
}

interface RoomInspectionProps {
  room: Room;
  onUpdateRoom: (updatedRoom: Room) => void;
  onAddIssue: (issue: Issue) => void;
}

export const RoomInspection: React.FC<RoomInspectionProps> = ({
  room,
  onUpdateRoom,
  onAddIssue
}) => {
  const [localRoom, setLocalRoom] = useState<Room>({...room});
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [newIssueSeverity, setNewIssueSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  
  const handleConditionChange = (key: keyof Room, value: number | boolean) => {
    setLocalRoom(prev => {
      const updated = { ...prev, [key]: value };
      // Automatically update overall condition based on all ratings
      if (typeof value === 'number') {
        const ratings = [
          updated.cleanlinessRating,
          updated.wallsCondition,
          updated.flooringCondition,
          updated.windowsCondition,
          updated.doorsCondition,
          updated.ceilingCondition,
          updated.lightingCondition
        ];
        
        if (updated.furnitureCondition) ratings.push(updated.furnitureCondition);
        if (updated.appliancesCondition) ratings.push(updated.appliancesCondition);
        
        const sum = ratings.reduce((a, b) => a + b, 0);
        updated.condition = Math.round(sum / ratings.length);
      }
      
      // If any critical issue is checked, mark room as urgent
      if (
        updated.moldIssues || 
        updated.pestIssues || 
        updated.electricalIssues || 
        updated.safetyIssues ||
        (updated.condition < 3)
      ) {
        updated.urgent = true;
      }
      
      return updated;
    });
  };
  
  const saveChanges = () => {
    onUpdateRoom(localRoom);
  };
  
  const handleAddIssue = () => {
    if (!newIssueTitle.trim()) return;
    
    const newIssue: Issue = {
      id: '_' + Math.random().toString(36).substring(2, 11),
      title: newIssueTitle,
      description: newIssueDescription,
      severity: newIssueSeverity,
      photos: [],
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'general',
      tags: [],
      maintenanceRequired: newIssueSeverity === 'high' || newIssueSeverity === 'critical'
    };
    
    onAddIssue(newIssue);
    
    // Add to local state too
    setLocalRoom(prev => ({
      ...prev,
      issues: [...prev.issues, newIssue]
    }));
    
    // Reset form
    setNewIssueTitle('');
    setNewIssueDescription('');
    setNewIssueSeverity('medium');
  };
  
  const handlePhotoUpload = (photo: Photo) => {
    const updatedRoom = {
      ...localRoom,
      photos: [...localRoom.photos, {...photo, roomId: localRoom.id}]
    };
    setLocalRoom(updatedRoom);
    onUpdateRoom(updatedRoom);
  };
  
  // Helper function to get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-amber-500 hover:bg-amber-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };
  
  // Render rating display component
  const RatingDisplay = ({ value }: { value: number }) => {
    const getColor = (val: number) => {
      if (val >= 8) return 'text-green-500';
      if (val >= 5) return 'text-amber-500';
      return 'text-red-500';
    };
    
    return (
      <span className={`font-bold ${getColor(value)}`}>
        {value}/10
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-gold-400/30">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-artdeco text-xl text-gold-600 dark:text-gold-400">
                {localRoom.name}
              </CardTitle>
              <CardDescription>
                {localRoom.type} inspection
              </CardDescription>
            </div>
            <Badge className={localRoom.urgent ? 'bg-red-500' : 'bg-green-500'}>
              {localRoom.urgent ? 'Urgent Attention' : 'Good Condition'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="condition" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="condition">Condition</TabsTrigger>
              <TabsTrigger value="issues">Issues ({localRoom.issues.length})</TabsTrigger>
              <TabsTrigger value="photos">Photos ({localRoom.photos.length})</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            {/* Condition Tab */}
            <TabsContent value="condition" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cleanliness */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Cleanliness</Label>
                    <RatingDisplay value={localRoom.cleanlinessRating} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.cleanlinessRating]} 
                    onValueChange={([val]) => handleConditionChange('cleanlinessRating', val)}
                  />
                </div>
                
                {/* Walls */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Walls</Label>
                    <RatingDisplay value={localRoom.wallsCondition} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.wallsCondition]} 
                    onValueChange={([val]) => handleConditionChange('wallsCondition', val)}
                  />
                </div>
                
                {/* Flooring */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Flooring</Label>
                    <RatingDisplay value={localRoom.flooringCondition} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.flooringCondition]} 
                    onValueChange={([val]) => handleConditionChange('flooringCondition', val)}
                  />
                </div>
                
                {/* Windows */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Windows</Label>
                    <RatingDisplay value={localRoom.windowsCondition} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.windowsCondition]} 
                    onValueChange={([val]) => handleConditionChange('windowsCondition', val)}
                  />
                </div>
                
                {/* Doors */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Doors</Label>
                    <RatingDisplay value={localRoom.doorsCondition} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.doorsCondition]} 
                    onValueChange={([val]) => handleConditionChange('doorsCondition', val)}
                  />
                </div>
                
                {/* Ceiling */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Ceiling</Label>
                    <RatingDisplay value={localRoom.ceilingCondition} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.ceilingCondition]} 
                    onValueChange={([val]) => handleConditionChange('ceilingCondition', val)}
                  />
                </div>
                
                {/* Lighting */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Lighting</Label>
                    <RatingDisplay value={localRoom.lightingCondition} />
                  </div>
                  <Slider 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={[localRoom.lightingCondition]} 
                    onValueChange={([val]) => handleConditionChange('lightingCondition', val)}
                  />
                </div>
                
                {/* Furniture (if applicable) */}
                {localRoom.furnitureCondition !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Furniture</Label>
                      <RatingDisplay value={localRoom.furnitureCondition} />
                    </div>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[localRoom.furnitureCondition]} 
                      onValueChange={([val]) => handleConditionChange('furnitureCondition', val)}
                    />
                  </div>
                )}
                
                {/* Appliances (if applicable) */}
                {localRoom.appliancesCondition !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Appliances</Label>
                      <RatingDisplay value={localRoom.appliancesCondition} />
                    </div>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[localRoom.appliancesCondition]} 
                      onValueChange={([val]) => handleConditionChange('appliancesCondition', val)}
                    />
                  </div>
                )}
              </div>
              
              <div className="border-t border-border pt-4">
                <h3 className="font-medium mb-2">Common Issues</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="damp" 
                      checked={localRoom.dampIssues}
                      onCheckedChange={(checked) => handleConditionChange('dampIssues', checked)}
                    />
                    <Label htmlFor="damp" className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" /> Damp Issues
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="mold" 
                      checked={localRoom.moldIssues}
                      onCheckedChange={(checked) => handleConditionChange('moldIssues', checked)}
                    />
                    <Label htmlFor="mold" className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-green-600" /> Mold/Mildew
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="electrical" 
                      checked={localRoom.electricalIssues}
                      onCheckedChange={(checked) => handleConditionChange('electricalIssues', checked)}
                    />
                    <Label htmlFor="electrical" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" /> Electrical Issues
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="plumbing" 
                      checked={localRoom.plumbingIssues}
                      onCheckedChange={(checked) => handleConditionChange('plumbingIssues', checked)}
                    />
                    <Label htmlFor="plumbing" className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-cyan-500" /> Plumbing Issues
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="heating" 
                      checked={localRoom.heatingIssues}
                      onCheckedChange={(checked) => handleConditionChange('heatingIssues', checked)}
                    />
                    <Label htmlFor="heating" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" /> Heating Issues
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="pest" 
                      checked={localRoom.pestIssues}
                      onCheckedChange={(checked) => handleConditionChange('pestIssues', checked)}
                    />
                    <Label htmlFor="pest" className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-amber-700" /> Pest Issues
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="safety" 
                      checked={localRoom.safetyIssues}
                      onCheckedChange={(checked) => handleConditionChange('safetyIssues', checked)}
                    />
                    <Label htmlFor="safety" className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-600" /> Safety Concerns
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Overall Condition</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      localRoom.condition >= 8 ? 'bg-green-500' : 
                      localRoom.condition >= 5 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}></div>
                    <span className="font-bold text-lg">{localRoom.condition}/10</span>
                  </div>
                </div>
                <Slider 
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[localRoom.condition]} 
                  onValueChange={([val]) => handleConditionChange('condition', val)}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  {localRoom.condition >= 8 ? 'Excellent condition - no action required' : 
                  localRoom.condition >= 5 ? 'Acceptable condition - minor maintenance may be needed' : 
                  'Poor condition - requires immediate attention'}
                </p>
              </div>
            </TabsContent>
            
            {/* Issues Tab */}
            <TabsContent value="issues" className="space-y-6 pt-4">
              <Card className="border-gold-400/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Add New Issue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="issueTitle">Issue Title</Label>
                    <Input 
                      id="issueTitle" 
                      placeholder="Brief description of the issue"
                      value={newIssueTitle}
                      onChange={(e) => setNewIssueTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="issueDescription">Details</Label>
                    <Textarea 
                      id="issueDescription" 
                      placeholder="Describe the issue in detail"
                      value={newIssueDescription}
                      onChange={(e) => setNewIssueDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="issueSeverity">Severity</Label>
                    <div className="flex gap-2 mt-1.5">
                      {['low', 'medium', 'high', 'critical'].map((severity) => (
                        <Button
                          key={severity}
                          type="button"
                          variant={newIssueSeverity === severity ? 'default' : 'outline'}
                          onClick={() => setNewIssueSeverity(severity as any)}
                          className={newIssueSeverity === severity ? getSeverityColor(severity) : ''}
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleAddIssue}
                    disabled={!newIssueTitle.trim()}
                    className="bg-gold-600 hover:bg-gold-700 text-white"
                  >
                    Add Issue
                  </Button>
                </CardFooter>
              </Card>
              
              {localRoom.issues.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Issues Found</h3>
                  <p className="text-muted-foreground">This room has no reported issues</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {localRoom.issues.map(issue => (
                    <Card key={issue.id} className="border-gold-400/30">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{issue.title}</CardTitle>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{issue.description}</p>
                        {issue.photos.length > 0 && (
                          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {issue.photos.map(photo => (
                              <img 
                                key={photo.id}
                                src={photo.dataUrl} 
                                alt={photo.caption} 
                                className="h-20 w-20 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6 pt-4">
              <PhotoUploader 
                onPhotoUpload={handlePhotoUpload}
                roomId={localRoom.id}
              />
              
              {localRoom.photos.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Photos</h3>
                  <p className="text-muted-foreground">Take photos to document the room condition</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {localRoom.photos.map(photo => (
                    <Card key={photo.id} className="overflow-hidden border-gold-400/30">
                      <img 
                        src={photo.dataUrl} 
                        alt={photo.caption || 'Room photo'} 
                        className="h-40 w-full object-cover"
                      />
                      {photo.caption && (
                        <CardContent className="p-2">
                          <p className="text-sm">{photo.caption}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="roomNotes">Room Notes</Label>
                <Textarea 
                  id="roomNotes" 
                  placeholder="Additional notes about this room..."
                  value={localRoom.notes}
                  onChange={(e) => setLocalRoom({...localRoom, notes: e.target.value})}
                  className="min-h-48"
                />
              </div>
              
              {localRoom.lastInspectionNotes && (
                <Card className="border-gold-400/30 mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Previous Inspection Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">{localRoom.lastInspectionNotes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
          <Button onClick={saveChanges} className="bg-gold-600 hover:bg-gold-700 text-white">
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
