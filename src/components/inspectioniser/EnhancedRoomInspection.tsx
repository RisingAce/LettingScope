import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoomFeatures } from './RoomFeatures';
import { RoomChecklist } from './RoomChecklist';
import { EnhancedPhotoUploader } from './EnhancedPhotoUploader';
import { format } from 'date-fns';

import { 
  CheckCircle, 
  ClipboardCheck, 
  Camera, 
  FileText, 
  AlertTriangle, 
  Home,
  Save,
  Brush
} from 'lucide-react';

// Import types
import { Room, Photo, Issue, ChecklistItem, RoomFeature } from '@/types/inspection';

interface EnhancedRoomInspectionProps {
  room: Room;
  onUpdateRoom: (updatedRoom: Room) => void;
  onAddIssue: (issue: Issue) => void;
  onSaveRoom: (roomId: string) => void;
}

export const EnhancedRoomInspection: React.FC<EnhancedRoomInspectionProps> = ({
  room,
  onUpdateRoom,
  onAddIssue,
  onSaveRoom
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [localRoom, setLocalRoom] = useState<Room>({...room});
  const [saveInProgress, setSaveInProgress] = useState(false);
  
  // Handle updating the room locally
  const handleUpdateRoom = (updates: Partial<Room>) => {
    setLocalRoom(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Handle updating the checklist
  const handleUpdateChecklist = (checklist: ChecklistItem[]) => {
    handleUpdateRoom({ checklist });
  };
  
  // Add issue from checklist
  const handleAddIssueFromChecklist = (itemName: string, notes: string) => {
    const newIssue: Issue = {
      id: '_' + Math.random().toString(36).substring(2, 11),
      title: itemName,
      description: notes || `Issue with ${itemName} in ${room.name}`,
      severity: 'medium',
      photos: [],
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'Other',
      tags: [room.type],
      maintenanceRequired: true
    };
    
    onAddIssue(newIssue);
  };
  
  // Handle photo upload
  const handlePhotoUpload = (photo: Photo) => {
    const updatedPhotos = [...localRoom.photos, photo];
    handleUpdateRoom({ photos: updatedPhotos });
  };
  
  // Add a new custom feature
  const handleAddFeature = (feature: RoomFeature) => {
    const updatedFeatures = [...localRoom.features, feature];
    handleUpdateRoom({ features: updatedFeatures });
  };
  
  // Save all changes
  const handleSaveAllChanges = () => {
    setSaveInProgress(true);
    
    // First update the inspectionComplete flag based on checklist
    const isComplete = localRoom.checklist.length > 0 && 
                       localRoom.checklist.every(item => item.checked);
    
    const finalRoom = {
      ...localRoom,
      inspectionComplete: isComplete
    };
    
    // Simulate a short delay before saving
    setTimeout(() => {
      onUpdateRoom(finalRoom);
      onSaveRoom(finalRoom.id);
      setSaveInProgress(false);
    }, 500);
  };
  
  // Get the status badge for the room
  const getRoomStatusBadge = () => {
    if (localRoom.urgent) {
      return <Badge variant="destructive">Urgent Attention</Badge>;
    }
    
    if (localRoom.inspectionComplete) {
      return <Badge variant="default" className="bg-green-500">Complete</Badge>;
    }
    
    return <Badge variant="outline">In Progress</Badge>;
  };
  
  return (
    <div className="enhanced-room-inspection w-full">
      <Card className="border-gold-400/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-artdeco tracking-wide text-xl">
                  {localRoom.name}
                </CardTitle>
                {getRoomStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                {localRoom.type} • Condition: {localRoom.condition}/10 • {localRoom.issues.length} issues
              </p>
            </div>
            
            <Button 
              onClick={handleSaveAllChanges}
              disabled={saveInProgress}
              className="bg-gold-600 hover:bg-gold-700 text-white"
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {saveInProgress ? 'Saving...' : 'Save Room'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full rounded-none px-6">
              <TabsTrigger value="overview" className="flex gap-1.5">
                <Home className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex gap-1.5">
                <Brush className="h-4 w-4" />
                <span>Features</span>
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex gap-1.5">
                <ClipboardCheck className="h-4 w-4" />
                <span>Checklist</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex gap-1.5">
                <Camera className="h-4 w-4" />
                <span>Photos</span>
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Issues</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Notes</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Room Details</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Room Type</p>
                          <p className="font-medium">{localRoom.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Condition</p>
                          <p className="font-medium">{localRoom.condition}/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cleanliness</p>
                          <p className="font-medium">{localRoom.cleanlinessRating}/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Issues Count</p>
                          <p className="font-medium">{localRoom.issues.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Photos Taken</p>
                          <p className="font-medium">{localRoom.photos.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Checklist Progress</p>
                          <p className="font-medium">
                            {localRoom.checklist.filter(item => item.checked).length}/{localRoom.checklist.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Issue Summary</Label>
                      {localRoom.issues.length === 0 ? (
                        <div className="bg-muted/30 rounded-md p-3 mt-2 text-center">
                          <p className="text-sm text-muted-foreground">No issues reported for this room</p>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {localRoom.issues.map(issue => (
                            <div 
                              key={issue.id} 
                              className={`p-3 rounded-md border ${
                                issue.severity === 'critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' :
                                issue.severity === 'high' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' :
                                issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30' :
                                'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30'
                              }`}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">{issue.title}</span>
                                <Badge variant="outline" className="capitalize">
                                  {issue.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {issue.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Room Name & Notes</Label>
                      <div className="space-y-2 mt-2">
                        <Input 
                          value={localRoom.name}
                          onChange={(e) => handleUpdateRoom({ name: e.target.value })}
                          placeholder="Room Name"
                        />
                        <Textarea
                          value={localRoom.notes}
                          onChange={(e) => handleUpdateRoom({ notes: e.target.value })}
                          placeholder="Room Notes"
                          className="h-36"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Quick Actions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => setActiveTab('photos')}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Add Photos
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => setActiveTab('issues')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => setActiveTab('features')}
                        >
                          <Brush className="h-4 w-4 mr-2" />
                          Rate Conditions
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => setActiveTab('checklist')}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Fill Checklist
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Features & Conditions Tab */}
              <TabsContent value="features" className="mt-0">
                <RoomFeatures
                  room={localRoom}
                  onUpdateRoom={handleUpdateRoom}
                  onAddFeature={handleAddFeature}
                />
              </TabsContent>
              
              {/* Checklist Tab */}
              <TabsContent value="checklist" className="mt-0">
                <RoomChecklist
                  room={localRoom}
                  onUpdateChecklist={handleUpdateChecklist}
                  onAddIssueFromChecklist={handleAddIssueFromChecklist}
                  onAddPhoto={handlePhotoUpload}
                />
              </TabsContent>
              
              {/* Photos Tab */}
              <TabsContent value="photos" className="mt-0">
                <div className="space-y-6">
                  <EnhancedPhotoUploader 
                    onPhotoUpload={handlePhotoUpload}
                    roomId={localRoom.id}
                    currentRoomName={localRoom.name}
                  />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Room Photos ({localRoom.photos.length})</h3>
                    
                    {localRoom.photos.length === 0 ? (
                      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-muted">
                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium mb-1">No Photos</h3>
                        <p className="text-muted-foreground">Take photos to document the room condition</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {localRoom.photos.map(photo => (
                          <Card key={photo.id} className="overflow-hidden border-gold-400/30 group">
                            <div className="relative">
                              <img 
                                src={photo.dataUrl} 
                                alt={photo.caption || 'Room photo'} 
                                className="h-40 w-full object-cover"
                              />
                              {photo.tags && photo.tags.length > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex flex-wrap gap-1">
                                    {photo.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-[10px] h-4 bg-white/20">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-2">
                              <p className="text-sm line-clamp-2">{photo.caption || 'No caption'}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {format(new Date(photo.timestamp), 'PP p')}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Issues Tab */}
              <TabsContent value="issues" className="mt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Issues ({localRoom.issues.length})</h3>
                    <Button 
                      onClick={() => {
                        const newIssue: Issue = {
                          id: '_' + Math.random().toString(36).substring(2, 11),
                          title: `Issue in ${localRoom.name}`,
                          description: '',
                          severity: 'medium',
                          photos: [],
                          status: 'new',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          category: 'Other',
                          tags: [localRoom.type],
                          maintenanceRequired: false
                        };
                        
                        onAddIssue(newIssue);
                      }}
                      className="bg-gold-600 hover:bg-gold-700 text-white"
                      size="sm"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      New Issue
                    </Button>
                  </div>
                  
                  {localRoom.issues.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-muted">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium mb-1">No Issues</h3>
                      <p className="text-muted-foreground">This room has no reported issues</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[450px] pr-3">
                      <div className="space-y-3">
                        {localRoom.issues.map(issue => (
                          <Card key={issue.id} className="border-gold-400/30">
                            <CardHeader className="py-3 px-4">
                              <div className="flex justify-between">
                                <CardTitle className="text-base">{issue.title}</CardTitle>
                                <Badge className={
                                  issue.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  issue.severity === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }>
                                  {issue.severity}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
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
                              
                              <div className="flex justify-between items-center mt-3">
                                <Badge variant="outline" className={
                                  issue.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                  issue.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                  issue.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                }>
                                  {issue.status.replace('-', ' ')}
                                </Badge>
                                
                                <div className="text-xs text-muted-foreground">
                                  Created: {format(new Date(issue.createdAt), 'PP')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
              
              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomNotes">Room Notes</Label>
                    <Textarea 
                      id="roomNotes" 
                      placeholder="Additional notes about this room..."
                      value={localRoom.notes}
                      onChange={(e) => handleUpdateRoom({ notes: e.target.value })}
                      className="min-h-48"
                    />
                  </div>
                  
                  {localRoom.lastInspectionNotes && (
                    <Card className="border-gold-400/30 mt-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Previous Inspection Notes</CardTitle>
                        {localRoom.lastInspectionDate && (
                          <p className="text-xs text-muted-foreground">
                            From inspection on {format(new Date(localRoom.lastInspectionDate), 'PPP')}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm italic">{localRoom.lastInspectionNotes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-border">
          <div className="text-sm text-muted-foreground">
            Last updated: {format(new Date(), 'PPP p')}
          </div>
          <Button 
            onClick={handleSaveAllChanges}
            disabled={saveInProgress}
            className="bg-gold-600 hover:bg-gold-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {saveInProgress ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
