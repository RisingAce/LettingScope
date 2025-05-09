import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building, Camera, CheckCircle, Star, AlertTriangle, Clock, Calendar, User, ThermometerSun } from "lucide-react";
import { format } from "date-fns";
// You must define these types in your project for full type safety
import { Inspection } from "@/types";

interface PropertyDashboardProps {
  inspection: Inspection;
  onRoomSelect: (roomId: string) => void;
  onIssueSelect: (issueId: string) => void;
  onEditDetails: () => void;
}

export const PropertyDashboard: React.FC<PropertyDashboardProps> = ({
  inspection,
  onRoomSelect,
  onIssueSelect,
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
  // Find urgent issues
  const urgentIssues = inspection.rooms.flatMap(room => 
    room.issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high')
  );
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
          <div className="flex justify-between text-sm">
            <span className="font-medium">Inspection Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gold-400/20" indicatorClassName="bg-gold-500" />
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gold-400/30 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-background to-background/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-artdeco tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-2">
              <Building className="w-4 h-4" /> Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inspection.rooms.length}</div>
            <p className="text-xs text-muted-foreground">
              {inspection.rooms.filter(r => r.condition >= 7).length} in good condition
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold-400/30 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-background to-background/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-artdeco tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inspection.rooms.reduce((sum, room) => sum + room.issues.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {urgentIssues.length} urgent issues requiring attention
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold-400/30 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-background to-background/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-artdeco tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inspection.photos.length + inspection.rooms.reduce((sum, room) => sum + room.photos.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Visual documentation of property condition
            </p>
          </CardContent>
        </Card>
        <Card className="border-gold-400/30 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-background to-background/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-artdeco tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-2">
              <Star className="w-4 h-4" /> Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inspection.rating}/10</div>
            <p className="text-xs text-muted-foreground">
              {inspection.rating >= 8 ? "Excellent" : inspection.rating >= 6 ? "Good" : inspection.rating >= 4 ? "Average" : "Poor"} condition
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent">
          <TabsTrigger 
            value="overview" 
            className="py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-gold-600 data-[state=active]:dark:text-gold-400 data-[state=active]:border-b-2 data-[state=active]:border-gold-500 rounded-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="rooms" 
            className="py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-gold-600 data-[state=active]:dark:text-gold-400 data-[state=active]:border-b-2 data-[state=active]:border-gold-500 rounded-none"
          >
            Rooms
          </TabsTrigger>
          <TabsTrigger 
            value="issues" 
            className="py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-gold-600 data-[state=active]:dark:text-gold-400 data-[state=active]:border-b-2 data-[state=active]:border-gold-500 rounded-none"
          >
            Issues
          </TabsTrigger>
          <TabsTrigger 
            value="photos" 
            className="py-2 px-4 data-[state=active]:bg-transparent data-[state=active]:text-gold-600 data-[state=active]:dark:text-gold-400 data-[state=active]:border-b-2 data-[state=active]:border-gold-500 rounded-none"
          >
            Photos
          </TabsTrigger>
        </TabsList>
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Summary */}
            <Card className="lg:col-span-2 border-gold-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="font-artdeco text-xl">Property Summary</CardTitle>
                <CardDescription>Key details and findings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Property Type</h3>
                    <p>{inspection.propertyDetails?.propertyType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tenant</h3>
                    <p>{inspection.tenantName || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Landlord</h3>
                    <p>{inspection.landlordName || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Key Location</h3>
                    <p>{inspection.propertyDetails?.keyLocation || "Not specified"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary of Findings</h3>
                  <p className="text-sm">
                    {inspection.summaryOfFindings || "No summary provided yet."}
                  </p>
                </div>
                {inspection.recommendedActions && inspection.recommendedActions.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommended Actions</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {inspection.recommendedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Inspection Details */}
            <Card className="border-gold-400/30">
              <CardHeader className="pb-2">
                <CardTitle className="font-artdeco text-xl">Inspection Details</CardTitle>
                <CardDescription>Conditions and timing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inspection.weatherConditions && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <ThermometerSun className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Weather</h3>
                      <p className="text-sm text-muted-foreground">{inspection.weatherConditions}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      {[
                        inspection.complianceChecks?.gasChecked && "Gas",
                        inspection.complianceChecks?.electricChecked && "Electric",
                        inspection.complianceChecks?.fireChecked && "Fire Safety",
                      ]
                        .filter(Boolean)
                        .join(", ") || "No compliance checks completed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Next Inspection</h3>
                    <p className="text-sm text-muted-foreground">
                      {inspection.nextInspectionDue ? 
                        format(new Date(inspection.nextInspectionDue), 'PP') : 
                        "Not scheduled"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Rooms Tab Content */}
        <TabsContent value="rooms" className="mt-6">
          {inspection.rooms.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No Rooms Added</h3>
              <p className="text-muted-foreground">Add rooms to begin your inspection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inspection.rooms.map(room => (
                <Card key={room.id} className="cursor-pointer hover:shadow-lg transition-shadow border-gold-400/30" onClick={() => onRoomSelect(room.id)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span className="font-artdeco tracking-wide">{room.name}</span>
                      <Badge variant={room.condition >= 7 ? "default" : room.condition >= 4 ? "secondary" : "destructive"}>
                        {room.condition}/10
                      </Badge>
                    </CardTitle>
                    <CardDescription>{room.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cleanliness</p>
                        <p>{room.cleanlinessRating}/10</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Issues</p>
                        <p>{room.issues.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Photos</p>
                        <p>{room.photos.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Urgent</p>
                        <p>{room.urgent ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-muted-foreground flex gap-1 flex-wrap">
                    {room.moldIssues && <span className="px-1.5 py-0.5 rounded bg-red-500/10">Mold</span>}
                    {room.dampIssues && <span className="px-1.5 py-0.5 rounded bg-blue-500/10">Damp</span>}
                    {room.electricalIssues && <span className="px-1.5 py-0.5 rounded bg-amber-500/10">Electrical</span>}
                    {room.plumbingIssues && <span className="px-1.5 py-0.5 rounded bg-cyan-500/10">Plumbing</span>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        {/* Issues Tab Content - implementation is similar to Rooms tab */}
        {/* Photos Tab Content - implementation is similar as well */}
      </Tabs>
    </div>
  );
};
