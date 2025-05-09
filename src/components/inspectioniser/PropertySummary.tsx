import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building, Calendar, User, Home, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

// Import from our types
import { Inspection, PropertyDetails, Room, Issue } from '@/types/inspection';
import { MapDisplay } from './MapDisplay';
import { WeatherDisplay } from './WeatherDisplay';

interface PropertySummaryProps {
  inspection: Inspection;
  onEditDetails: () => void;
}

export const PropertySummary: React.FC<PropertySummaryProps> = ({
  inspection,
  onEditDetails
}) => {
  // Calculate inspection progress
  const totalSteps = 5; // Property details, rooms, issues, utilities, sign-off
  let completedSteps = 0;
  if (inspection.propertyAddress) completedSteps++;
  if (inspection.rooms.length > 0) completedSteps++;
  if (inspection.utilities && (inspection.utilities.notes || inspection.utilities.electricMeterReading)) completedSteps++;
  if (inspection.summaryOfFindings) completedSteps++;
  if (inspection.tenantSignature || inspection.agentSignature) completedSteps++;
  const progress = Math.round((completedSteps / totalSteps) * 100);
  
  // Get critical issues count
  const criticalIssuesCount = inspection.rooms.flatMap(room => 
    room.issues.filter(issue => issue.severity === 'critical')
  ).length;
  
  // Get high priority issues count
  const highPriorityIssuesCount = inspection.rooms.flatMap(room => 
    room.issues.filter(issue => issue.severity === 'high')
  ).length;
  
  // Calculate average room condition
  const averageRoomCondition = inspection.rooms.length > 0 
    ? Math.round(inspection.rooms.reduce((sum, room) => sum + room.condition, 0) / inspection.rooms.length) 
    : 0;
  
  // Get total photo count
  const totalPhotos = inspection.rooms.reduce((sum, room) => sum + room.photos.length, 0);
  
  // Count rooms by type
  const roomTypeCount = inspection.rooms.reduce((acc, room) => {
    const type = room.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      {/* Property Header */}
      <div className="bg-gradient-to-r from-gold-600/20 via-gold-500/10 to-gold-600/20 border border-gold-400/30 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-400/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-artdeco tracking-wide text-gold-600 dark:text-gold-400">
              {inspection.propertyAddress || "Unnamed Property"}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Inspection: {format(new Date(inspection.date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Agent: {inspection.agentName || "Not assigned"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                <span>
                  {inspection.propertyDetails?.bedrooms} bed, {inspection.propertyDetails?.bathrooms} bath 
                  {inspection.propertyDetails?.furnished ? ", furnished" : ""}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-400/30">
              {inspection.status?.replace('-', ' ')}
            </Badge>
            {inspection.followUpRequired && (
              <Badge variant="destructive" className="bg-red-500/90">
                Follow-up required
              </Badge>
            )}
            {inspection.propertyDetails?.furnished && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Furnished
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Inspection Progress</span>
              <Badge variant="outline" className="text-xs bg-background">
                {progress}%
              </Badge>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {completedSteps} of {totalSteps} steps completed
            </span>
          </div>
          
          <Progress value={progress} className="h-2 bg-gold-200/50 dark:bg-gold-950/50" />
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Details */}
        <Card className="border-gold-400/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-artdeco tracking-wide flex items-center justify-between">
              Property Details
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEditDetails}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{inspection.propertyDetails?.propertyType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{inspection.propertyDetails?.bedrooms || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{inspection.propertyDetails?.bathrooms || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Furnishing</p>
                  <p className="font-medium">{inspection.propertyDetails?.furnished ? "Furnished" : "Unfurnished"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">EPC Rating</p>
                  <p className="font-medium">{inspection.propertyDetails?.epcRating || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{inspection.propertyDetails?.constructionYear || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {inspection.propertyDetails?.garden && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300">
                    Garden
                  </Badge>
                )}
                {inspection.propertyDetails?.petFriendly && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300">
                    Pet Friendly
                  </Badge>
                )}
                {inspection.propertyDetails?.parkingSpaces && inspection.propertyDetails.parkingSpaces > 0 && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300">
                    {inspection.propertyDetails.parkingSpaces} Parking {inspection.propertyDetails.parkingSpaces === 1 ? 'Space' : 'Spaces'}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Map & Location */}
        {inspection.propertyDetails?.latitude && inspection.propertyDetails?.longitude && (
          <MapDisplay 
            latitude={inspection.propertyDetails.latitude}
            longitude={inspection.propertyDetails.longitude}
            address={inspection.propertyAddress}
          />
        )}
        
        {/* Weather Conditions (if available) */}
        {inspection.weather && (
          <WeatherDisplay weather={inspection.weather} />
        )}
        
        {/* Inspection Stats */}
        <Card className="border-gold-400/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-artdeco tracking-wide">
              Inspection Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Rooms Inspected</p>
                <p className="font-medium">{inspection.rooms.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Identified</p>
                <p className="font-medium flex items-center gap-2">
                  {inspection.rooms.reduce((sum, room) => sum + room.issues.length, 0)}
                  {criticalIssuesCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-4">
                      {criticalIssuesCount} Critical
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Photos Taken</p>
                <p className="font-medium">{totalPhotos}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Condition</p>
                <p className="font-medium flex items-center gap-1">
                  {averageRoomCondition}/10
                  <Badge variant={averageRoomCondition >= 7 ? "default" : averageRoomCondition >= 4 ? "secondary" : "destructive"} className="text-[10px] h-4">
                    {averageRoomCondition >= 7 ? "Good" : averageRoomCondition >= 4 ? "Fair" : "Poor"}
                  </Badge>
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2">Rooms By Type</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roomTypeCount).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="bg-transparent">
                    <Home className="h-3 w-3 mr-1" />
                    {count}x {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
