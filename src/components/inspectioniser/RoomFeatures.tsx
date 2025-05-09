import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Droplets, Wind, Bug, Zap, Pipette, Thermometer, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the types
import { Room, RoomFeature } from '@/types/inspection';

interface RoomFeaturesProps {
  room: Room;
  onUpdateRoom: (updatedRoom: Partial<Room>) => void;
  onAddFeature: (feature: RoomFeature) => void;
}

export const RoomFeatures: React.FC<RoomFeaturesProps> = ({
  room,
  onUpdateRoom,
  onAddFeature
}) => {
  const [newFeatureName, setNewFeatureName] = useState('');
  const [showAddFeature, setShowAddFeature] = useState(false);
  
  // Generate a unique ID
  const generateId = () => '_' + Math.random().toString(36).substring(2, 11);
  
  // Get color based on rating value
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 5) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Handle condition slider changes
  const handleConditionChange = (key: keyof Room, value: number) => {
    onUpdateRoom({ [key]: value });
    
    // Update overall condition based on all ratings
    const ratings = [
      key === 'cleanlinessRating' ? value : room.cleanlinessRating,
      key === 'wallsCondition' ? value : room.wallsCondition,
      key === 'flooringCondition' ? value : room.flooringCondition,
      key === 'windowsCondition' ? value : room.windowsCondition,
      key === 'doorsCondition' ? value : room.doorsCondition,
      key === 'ceilingCondition' ? value : room.ceilingCondition,
      key === 'lightingCondition' ? value : room.lightingCondition
    ];
    
    if (room.furnitureCondition || key === 'furnitureCondition') 
      ratings.push(key === 'furnitureCondition' ? value : (room.furnitureCondition || 0));
    
    if (room.appliancesCondition || key === 'appliancesCondition') 
      ratings.push(key === 'appliancesCondition' ? value : (room.appliancesCondition || 0));
    
    const sum = ratings.reduce((a, b) => a + b, 0);
    const newOverallCondition = Math.round(sum / ratings.length);
    
    onUpdateRoom({ condition: newOverallCondition });
    
    // If condition is poor, mark as urgent
    if (newOverallCondition < 3) {
      onUpdateRoom({ urgent: true });
    }
  };
  
  // Handle toggle switches for issues
  const handleIssueToggle = (key: keyof Room, value: boolean) => {
    onUpdateRoom({ [key]: value });
    
    // If any critical issue is enabled, mark room as urgent
    if (value && (
      key === 'moldIssues' || 
      key === 'pestIssues' || 
      key === 'electricalIssues' || 
      key === 'safetyIssues'
    )) {
      onUpdateRoom({ urgent: true });
    }
  };
  
  // Add a new custom feature
  const addNewFeature = () => {
    if (!newFeatureName.trim()) return;
    
    const newFeature: RoomFeature = {
      id: generateId(),
      name: newFeatureName.trim(),
      condition: 5, // Default to middle rating
      maintenanceRequired: false
    };
    
    onAddFeature(newFeature);
    setNewFeatureName('');
    setShowAddFeature(false);
  };
  
  // Handle feature condition change
  const handleFeatureConditionChange = (featureId: string, value: number) => {
    const updatedFeatures = room.features.map(feature => 
      feature.id === featureId ? { ...feature, condition: value } : feature
    );
    onUpdateRoom({ features: updatedFeatures });
  };
  
  // Handle feature maintenance toggle
  const handleFeatureMaintenanceToggle = (featureId: string, value: boolean) => {
    const updatedFeatures = room.features.map(feature => 
      feature.id === featureId ? { ...feature, maintenanceRequired: value } : feature
    );
    onUpdateRoom({ features: updatedFeatures });
  };
  
  // Handle feature notes change
  const handleFeatureNotesChange = (featureId: string, notes: string) => {
    const updatedFeatures = room.features.map(feature => 
      feature.id === featureId ? { ...feature, notes } : feature
    );
    onUpdateRoom({ features: updatedFeatures });
  };
  
  // Delete a feature
  const deleteFeature = (featureId: string) => {
    const updatedFeatures = room.features.filter(feature => feature.id !== featureId);
    onUpdateRoom({ features: updatedFeatures });
  };
  
  return (
    <div className="room-features space-y-6">
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="standard">Standard Ratings</TabsTrigger>
          <TabsTrigger value="custom">Custom Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="space-y-4">
          {/* Cleanliness Rating */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="cleanlinessRating" className="text-sm font-medium">
                Cleanliness
              </Label>
              <span className={`font-medium ${getRatingColor(room.cleanlinessRating)}`}>
                {room.cleanlinessRating}/10
              </span>
            </div>
            <Slider
              id="cleanlinessRating"
              min={1}
              max={10}
              step={1}
              value={[room.cleanlinessRating]}
              onValueChange={(values) => handleConditionChange('cleanlinessRating', values[0])}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
          
          {/* Walls Condition */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="wallsCondition" className="text-sm font-medium">
                Walls
              </Label>
              <span className={`font-medium ${getRatingColor(room.wallsCondition)}`}>
                {room.wallsCondition}/10
              </span>
            </div>
            <Slider
              id="wallsCondition"
              min={1}
              max={10}
              step={1}
              value={[room.wallsCondition]}
              onValueChange={(values) => handleConditionChange('wallsCondition', values[0])}
              className="py-1"
            />
          </div>
          
          {/* Flooring Condition */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="flooringCondition" className="text-sm font-medium">
                Flooring
              </Label>
              <span className={`font-medium ${getRatingColor(room.flooringCondition)}`}>
                {room.flooringCondition}/10
              </span>
            </div>
            <Slider
              id="flooringCondition"
              min={1}
              max={10}
              step={1}
              value={[room.flooringCondition]}
              onValueChange={(values) => handleConditionChange('flooringCondition', values[0])}
              className="py-1"
            />
          </div>
          
          {/* Windows Condition */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="windowsCondition" className="text-sm font-medium">
                Windows
              </Label>
              <span className={`font-medium ${getRatingColor(room.windowsCondition)}`}>
                {room.windowsCondition}/10
              </span>
            </div>
            <Slider
              id="windowsCondition"
              min={1}
              max={10}
              step={1}
              value={[room.windowsCondition]}
              onValueChange={(values) => handleConditionChange('windowsCondition', values[0])}
              className="py-1"
            />
          </div>
          
          {/* Doors Condition */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="doorsCondition" className="text-sm font-medium">
                Doors
              </Label>
              <span className={`font-medium ${getRatingColor(room.doorsCondition)}`}>
                {room.doorsCondition}/10
              </span>
            </div>
            <Slider
              id="doorsCondition"
              min={1}
              max={10}
              step={1}
              value={[room.doorsCondition]}
              onValueChange={(values) => handleConditionChange('doorsCondition', values[0])}
              className="py-1"
            />
          </div>
          
          {/* Ceiling Condition */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="ceilingCondition" className="text-sm font-medium">
                Ceiling
              </Label>
              <span className={`font-medium ${getRatingColor(room.ceilingCondition)}`}>
                {room.ceilingCondition}/10
              </span>
            </div>
            <Slider
              id="ceilingCondition"
              min={1}
              max={10}
              step={1}
              value={[room.ceilingCondition]}
              onValueChange={(values) => handleConditionChange('ceilingCondition', values[0])}
              className="py-1"
            />
          </div>
          
          {/* Lighting Condition */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="lightingCondition" className="text-sm font-medium">
                Lighting
              </Label>
              <span className={`font-medium ${getRatingColor(room.lightingCondition)}`}>
                {room.lightingCondition}/10
              </span>
            </div>
            <Slider
              id="lightingCondition"
              min={1}
              max={10}
              step={1}
              value={[room.lightingCondition]}
              onValueChange={(values) => handleConditionChange('lightingCondition', values[0])}
              className="py-1"
            />
          </div>
          
          {/* Furniture Condition (if furnished) */}
          {(room.type === 'bedroom' || room.type === 'livingRoom' || room.furnitureCondition !== undefined) && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="furnitureCondition" className="text-sm font-medium">
                  Furniture
                </Label>
                <span className={`font-medium ${getRatingColor(room.furnitureCondition || 0)}`}>
                  {room.furnitureCondition || 0}/10
                </span>
              </div>
              <Slider
                id="furnitureCondition"
                min={1}
                max={10}
                step={1}
                value={[room.furnitureCondition || 5]}
                onValueChange={(values) => handleConditionChange('furnitureCondition', values[0])}
                className="py-1"
              />
            </div>
          )}
          
          {/* Appliances Condition (for kitchen, bathroom) */}
          {(room.type === 'kitchen' || room.type === 'bathroom' || room.appliancesCondition !== undefined) && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="appliancesCondition" className="text-sm font-medium">
                  Appliances
                </Label>
                <span className={`font-medium ${getRatingColor(room.appliancesCondition || 0)}`}>
                  {room.appliancesCondition || 0}/10
                </span>
              </div>
              <Slider
                id="appliancesCondition"
                min={1}
                max={10}
                step={1}
                value={[room.appliancesCondition || 5]}
                onValueChange={(values) => handleConditionChange('appliancesCondition', values[0])}
                className="py-1"
              />
            </div>
          )}
          
          <div className="my-6">
            <h3 className="text-md font-medium mb-3">Common Issues</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dampIssues"
                  checked={room.dampIssues}
                  onCheckedChange={(checked) => handleIssueToggle('dampIssues', checked)}
                />
                <Label htmlFor="dampIssues" className="flex items-center gap-1.5">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Damp
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="moldIssues"
                  checked={room.moldIssues}
                  onCheckedChange={(checked) => handleIssueToggle('moldIssues', checked)}
                />
                <Label htmlFor="moldIssues" className="flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-green-500" />
                  Mold
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="pestIssues"
                  checked={room.pestIssues}
                  onCheckedChange={(checked) => handleIssueToggle('pestIssues', checked)}
                />
                <Label htmlFor="pestIssues" className="flex items-center gap-1.5">
                  <Bug className="h-4 w-4 text-amber-500" />
                  Pests
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="electricalIssues"
                  checked={room.electricalIssues}
                  onCheckedChange={(checked) => handleIssueToggle('electricalIssues', checked)}
                />
                <Label htmlFor="electricalIssues" className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Electrical
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="plumbingIssues"
                  checked={room.plumbingIssues}
                  onCheckedChange={(checked) => handleIssueToggle('plumbingIssues', checked)}
                />
                <Label htmlFor="plumbingIssues" className="flex items-center gap-1.5">
                  <Pipette className="h-4 w-4 text-blue-500" />
                  Plumbing
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="heatingIssues"
                  checked={room.heatingIssues}
                  onCheckedChange={(checked) => handleIssueToggle('heatingIssues', checked)}
                />
                <Label htmlFor="heatingIssues" className="flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  Heating
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="safetyIssues"
                  checked={room.safetyIssues}
                  onCheckedChange={(checked) => handleIssueToggle('safetyIssues', checked)}
                />
                <Label htmlFor="safetyIssues" className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  Safety
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          {/* Add Custom Feature */}
          {showAddFeature ? (
            <Card className="border-gold-400/30">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="newFeatureName">Feature Name</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      id="newFeatureName"
                      value={newFeatureName}
                      onChange={(e) => setNewFeatureName(e.target.value)}
                      placeholder="Enter feature name"
                      className="flex-1"
                    />
                    <Button 
                      onClick={addNewFeature}
                      variant="default"
                      className="bg-gold-600 hover:bg-gold-700 text-white"
                    >
                      Add
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setShowAddFeature(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setShowAddFeature(true)}
              className="w-full border-dashed border-gold-400/50 hover:border-gold-400"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Custom Feature
            </Button>
          )}
          
          {/* Custom Features List */}
          {room.features.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-muted">
              <h3 className="text-sm font-medium mb-1">No Custom Features</h3>
              <p className="text-xs text-muted-foreground mb-2">Add custom features to track specific items in this room</p>
            </div>
          ) : (
            <div className="space-y-4">
              {room.features.map(feature => (
                <Card key={feature.id} className="border-gold-400/30">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>{feature.name}</span>
                      <Badge 
                        variant={feature.maintenanceRequired ? "destructive" : "outline"}
                        className={!feature.maintenanceRequired ? "bg-transparent" : ""}
                      >
                        {feature.maintenanceRequired ? "Needs Maintenance" : "OK"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium">
                          Condition
                        </Label>
                        <span className={`font-medium ${getRatingColor(feature.condition)}`}>
                          {feature.condition}/10
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[feature.condition]}
                        onValueChange={(values) => handleFeatureConditionChange(feature.id, values[0])}
                        className="py-1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Notes
                      </Label>
                      <Textarea
                        value={feature.notes || ''}
                        onChange={(e) => handleFeatureNotesChange(feature.id, e.target.value)}
                        placeholder="Add notes about this feature..."
                        className="h-20"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`maintenance-${feature.id}`}
                        checked={feature.maintenanceRequired}
                        onCheckedChange={(checked) => handleFeatureMaintenanceToggle(feature.id, checked)}
                      />
                      <Label htmlFor={`maintenance-${feature.id}`}>
                        Maintenance Required
                      </Label>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => deleteFeature(feature.id)}
                      >
                        Delete Feature
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
