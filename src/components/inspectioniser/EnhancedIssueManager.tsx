import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { IssueForm } from './IssueForm';
import { EnhancedPhotoUploader } from './EnhancedPhotoUploader';

// Icons
import { 
  AlertTriangle, 
  Clock,
  CheckCircle, 
  User, 
  XCircle, 
  ArrowRightCircle,
  RotateCcw, 
  PenSquare,
  Camera,
  Calendar as CalendarIcon,
  FileText,
  Bell,
  ToggleLeft,
  Wrench
} from 'lucide-react';

// Import from our types file
import { Issue, Photo, Room } from '@/types/inspection';

// Standard issue categories
const ISSUE_CATEGORIES = [
  'Structural',
  'Plumbing',
  'Electrical',
  'Appliance',
  'Furniture',
  'Flooring',
  'Wall/Ceiling',
  'Decoration',
  'Door/Window',
  'Heating',
  'Ventilation',
  'Pest',
  'Moisture/Damp',
  'Safety',
  'Other'
];

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface EnhancedIssueManagerProps {
  issue: Issue;
  roomId: string;
  roomName: string;
  onUpdateIssue: (updatedIssue: Issue) => void;
  onDeleteIssue: (issueId: string) => void;
  availableStaff?: StaffMember[];
  allRooms?: Room[];
}

export const EnhancedIssueManager: React.FC<EnhancedIssueManagerProps> = ({
  issue,
  roomId,
  roomName,
  onUpdateIssue,
  onDeleteIssue,
  availableStaff = [],
  allRooms = []
}) => {
  const [localIssue, setLocalIssue] = useState<Issue>({...issue});
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [completionNotes, setCompletionNotes] = useState(issue.completionNotes || '');
  
  // Update local issue when prop changes
  useEffect(() => {
    setLocalIssue({...issue});
    setCompletionNotes(issue.completionNotes || '');
  }, [issue]);
  
  // Handle form field changes
  const handleChange = (field: keyof Issue, value: any) => {
    setLocalIssue(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };
  
  // Save changes
  const saveChanges = () => {
    onUpdateIssue(localIssue);
    setIsEditing(false);
  };
  
  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !localIssue.tags.includes(newTag.trim())) {
      handleChange('tags', [...localIssue.tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    handleChange('tags', localIssue.tags.filter(tag => tag !== tagToRemove));
  };
  
  // Update issue status
  const updateStatus = (newStatus: Issue['status']) => {
    handleChange('status', newStatus);
    
    // If status is resolved, set completion date
    if (newStatus === 'resolved' && !localIssue.completionNotes) {
      handleChange('completionNotes', `Resolved on ${format(new Date(), 'PPP')}`);
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = (photo: Photo) => {
    const updatedIssue = {
      ...localIssue,
      photos: [...localIssue.photos, {...photo, issueId: localIssue.id}],
      updatedAt: new Date().toISOString()
    };
    setLocalIssue(updatedIssue);
    onUpdateIssue(updatedIssue);
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'high': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'low': return 'bg-green-500 hover:bg-green-600 text-white';
      default: return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'in-progress': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'resolved': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'monitoring': return 'bg-purple-500 hover:bg-purple-600 text-white';
      default: return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in-progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'monitoring': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return '';
    }
  };
  
  // Get severity badge color
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return '';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-4 w-4" />;
      case 'in-progress': return <ArrowRightCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'monitoring': return <RotateCcw className="h-4 w-4" />;
      default: return null;
    }
  };
  
  // Toggle maintenance required
  const toggleMaintenanceRequired = () => {
    handleChange('maintenanceRequired', !localIssue.maintenanceRequired);
  };
  
  // Toggle maintenance scheduled
  const toggleMaintenanceScheduled = () => {
    handleChange('maintenanceScheduled', !localIssue.maintenanceScheduled);
  };
  
  // Schedule maintenance
  const scheduleMaintenanceDate = (date: string) => {
    handleChange('maintenanceDate', date);
    handleChange('maintenanceScheduled', true);
  };
  
  // Update completion notes
  const updateCompletionNotes = () => {
    handleChange('completionNotes', completionNotes);
  };
  
  return (
    <div className="issue-manager w-full">
      <Card className="border-gold-400/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <CardTitle className="font-artdeco tracking-wide text-xl flex items-center gap-2">
                {isEditing ? (
                  "Edit Issue"
                ) : (
                  <>
                    {localIssue.title}
                    <Badge className={getSeverityBadgeColor(localIssue.severity)}>
                      {localIssue.severity}
                    </Badge>
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {!isEditing && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline" className={getStatusBadgeColor(localIssue.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(localIssue.status)}
                        <span>{localIssue.status.replace("-", " ")}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline" className="bg-transparent">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {format(new Date(localIssue.createdAt), 'PP')}
                    </Badge>
                    <Badge variant="outline" className="bg-transparent">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {roomName}
                    </Badge>
                  </div>
                )}
              </CardDescription>
            </div>
            
            {!isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          {isEditing ? (
            <IssueForm 
              issue={localIssue}
              onUpdateIssue={handleChange}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              newTag={newTag}
              setNewTag={setNewTag}
              availableCategories={ISSUE_CATEGORIES}
            />
          ) : (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
              </TabsList>
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm">{localIssue.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Category</h3>
                    <Badge variant="outline">{localIssue.category}</Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Estimated Cost</h3>
                    <p className="text-sm">{localIssue.estimatedCost ? `£${localIssue.estimatedCost}` : 'Not specified'}</p>
                  </div>
                  
                  {localIssue.dueDate && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Due Date</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(new Date(localIssue.dueDate), 'PP')}
                      </div>
                    </div>
                  )}
                  
                  {localIssue.assignedTo && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Assigned To</h3>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{localIssue.assignedTo.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{localIssue.assignedTo}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {localIssue.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {localIssue.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-transparent">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className={localIssue.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' : ''}
                      onClick={() => updateStatus('new')}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" /> New
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className={localIssue.status === 'in-progress' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700' : ''}
                      onClick={() => updateStatus('in-progress')}
                    >
                      <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> In Progress
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className={localIssue.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' : ''}
                      onClick={() => updateStatus('resolved')}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolved
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className={localIssue.status === 'monitoring' ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' : ''}
                      onClick={() => updateStatus('monitoring')}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Monitoring
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-4">
                <EnhancedPhotoUploader 
                  onPhotoUpload={handlePhotoUpload}
                  issueId={localIssue.id}
                  roomId={roomId}
                  currentRoomName={roomName}
                  availableRooms={allRooms?.map(r => ({ id: r.id, name: r.name, type: r.type })) || []}
                />
                
                {localIssue.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {localIssue.photos.map(photo => (
                      <div key={photo.id} className="relative group overflow-hidden rounded-md border border-border">
                        <img 
                          src={photo.dataUrl} 
                          alt={photo.caption || 'Issue documentation'} 
                          className="aspect-square object-cover w-full"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1.5 text-xs">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-muted">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-base font-medium mb-1">No Photos</h3>
                    <p className="text-sm text-muted-foreground">Add photos to document this issue</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceRequired"
                        checked={localIssue.maintenanceRequired}
                        onCheckedChange={toggleMaintenanceRequired}
                      />
                      <Label htmlFor="maintenanceRequired" className="flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-amber-500" />
                        Maintenance Required
                      </Label>
                    </div>
                    
                    <Badge 
                      variant={localIssue.maintenanceRequired ? "default" : "outline"} 
                      className={localIssue.maintenanceRequired ? 
                        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : 
                        "bg-transparent"
                      }
                    >
                      {localIssue.maintenanceRequired ? "Required" : "Not Required"}
                    </Badge>
                  </div>
                  
                  {localIssue.maintenanceRequired && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="maintenanceScheduled"
                            checked={!!localIssue.maintenanceScheduled}
                            onCheckedChange={toggleMaintenanceScheduled}
                          />
                          <Label htmlFor="maintenanceScheduled" className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                            Maintenance Scheduled
                          </Label>
                        </div>
                        
                        <Badge 
                          variant={localIssue.maintenanceScheduled ? "default" : "outline"} 
                          className={localIssue.maintenanceScheduled ? 
                            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : 
                            "bg-transparent"
                          }
                        >
                          {localIssue.maintenanceScheduled ? "Scheduled" : "Not Scheduled"}
                        </Badge>
                      </div>
                      
                      {localIssue.maintenanceDate && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">
                          <h3 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                            Scheduled Date
                          </h3>
                          <p className="text-sm">{format(new Date(localIssue.maintenanceDate), 'PPP')}</p>
                        </div>
                      )}
                      
                      {localIssue.status === 'resolved' && (
                        <div className="space-y-2">
                          <Label htmlFor="completionNotes" className="text-sm font-medium">
                            Completion Notes
                          </Label>
                          <Textarea
                            id="completionNotes"
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="Enter details about the maintenance work completed..."
                            className="min-h-24"
                          />
                          <Button 
                            onClick={updateCompletionNotes}
                            size="sm"
                            className="bg-gold-600 hover:bg-gold-700 text-white mt-2"
                          >
                            Save Notes
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              
              {/* Tracking Tab */}
              <TabsContent value="tracking" className="space-y-4">
                <div className="space-y-1 mb-4">
                  <h3 className="text-sm font-medium">Timeline</h3>
                  <div className="relative pl-5 border-l border-border space-y-3 py-2">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-blue-500"></div>
                      <div className="text-sm">
                        <p className="font-medium">Created</p>
                        <p className="text-muted-foreground text-xs">{format(new Date(localIssue.createdAt), 'PPP p')}</p>
                      </div>
                    </div>
                    
                    {localIssue.status !== 'new' && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-amber-500"></div>
                        <div className="text-sm">
                          <p className="font-medium">Started Working On</p>
                          <p className="text-muted-foreground text-xs">{format(new Date(localIssue.updatedAt), 'PPP p')}</p>
                        </div>
                      </div>
                    )}
                    
                    {localIssue.maintenanceScheduled && localIssue.maintenanceDate && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-blue-500"></div>
                        <div className="text-sm">
                          <p className="font-medium">Maintenance Scheduled</p>
                          <p className="text-muted-foreground text-xs">{format(new Date(localIssue.maintenanceDate), 'PPP')}</p>
                        </div>
                      </div>
                    )}
                    
                    {localIssue.status === 'resolved' && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-green-500"></div>
                        <div className="text-sm">
                          <p className="font-medium">Resolved</p>
                          <p className="text-muted-foreground text-xs">{format(new Date(localIssue.updatedAt), 'PPP p')}</p>
                        </div>
                      </div>
                    )}
                    
                    {localIssue.dueDate && (
                      <div className="relative">
                        <div className={`absolute -left-[21px] top-0 h-4 w-4 rounded-full ${new Date(localIssue.dueDate) < new Date() && localIssue.status !== 'resolved' ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                        <div className="text-sm">
                          <p className="font-medium">Due Date</p>
                          <p className="text-muted-foreground text-xs">{format(new Date(localIssue.dueDate), 'PPP')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {localIssue.status !== 'resolved' && localIssue.dueDate && new Date(localIssue.dueDate) < new Date() && (
                  <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium text-sm">Past Due Date</h4>
                      <p className="text-xs text-muted-foreground">This issue is overdue and needs attention</p>
                    </div>
                  </div>
                )}
                
                {availableStaff.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Assigned To</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {availableStaff.map(staff => (
                        <Button
                          key={staff.id}
                          variant="outline"
                          size="sm"
                          className={`justify-start ${localIssue.assignedTo === staff.name ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' : ''}`}
                          onClick={() => handleChange('assignedTo', staff.name)}
                        >
                          <Avatar className="h-5 w-5 mr-2">
                            {staff.avatarUrl ? (
  <img src={staff.avatarUrl} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
) : (
  <AvatarFallback>{staff.name.substring(0, 2)}</AvatarFallback>
)}
                          </Avatar>
                          {staff.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {localIssue.completionNotes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Completion Notes</h3>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-sm">{localIssue.completionNotes}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-border pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button 
                onClick={saveChanges}
                className="bg-gold-600 hover:bg-gold-700 text-white"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="destructive"
                onClick={() => onDeleteIssue(localIssue.id)}
              >
                Delete Issue
              </Button>
              <Button 
                className="bg-gold-600 hover:bg-gold-700 text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit Issue
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
