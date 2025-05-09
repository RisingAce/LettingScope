
import React from "react";
import { useAppData } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, AlertTriangle, Calendar, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";

export const DashboardStats: React.FC = () => {
  const { data, stats, formatCurrency } = useAppData();
  const now = new Date();
  
  // Calculate properties due for lease renewal in next 90 days
  const daysInMs = 90 * 24 * 60 * 60 * 1000;
  const propertiesWithLeaseEndingSoon = data.properties.filter(property => {
    return property.leaseEndDate && 
           property.leaseEndDate > now.getTime() && 
           property.leaseEndDate < (now.getTime() + daysInMs);
  });
  
  // Get most recent activities
  const recentActivities = data.activities.slice(0, 5);
  
  // Calculate total monthly income from all properties
  const totalMonthlyIncome = data.properties.reduce((sum, property) => {
    return sum + (property.rentalAmount || 0);
  }, 0);
  
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Property Stats */}
      <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building className="h-4 w-4 text-gold-500" />
            Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.propertyCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Monthly Income: {formatCurrency(totalMonthlyIncome)}
          </p>
          {propertiesWithLeaseEndingSoon.length > 0 && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {propertiesWithLeaseEndingSoon.length} lease(s) ending soon
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bill Stats */}
      <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gold-500" />
            Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.billCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingBillCount} pending / {stats.overdueBillCount} overdue
          </p>
          {stats.overdueBillCount > 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              {stats.overdueBillCount} overdue bill(s) need attention
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reminder Stats */}
      <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gold-500" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.upcomingChaserCount + stats.overdueChaserCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.upcomingChaserCount} upcoming / {stats.overdueChaserCount} overdue
          </p>
          {stats.overdueChaserCount > 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              {stats.overdueChaserCount} overdue reminder(s)
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Notes Stats */}
      <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold-500" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.notes.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.notes.filter(note => note.createdAt > (now.getTime() - 7 * 24 * 60 * 60 * 1000)).length} added in last 7 days
          </p>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4 border-gold-200 dark:border-gold-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          <CardDescription>Latest updates across your properties</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2">
                  <div className={`mt-0.5 rounded-full p-1 ${
                    activity.action === "created" 
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      : activity.action === "updated"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : activity.action === "deleted"
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
                  }`}>
                    {activity.type === "property" ? (
                      <Building className="h-3 w-3" />
                    ) : activity.type === "bill" ? (
                      <CreditCard className="h-3 w-3" />
                    ) : activity.type === "chaser" ? (
                      <Calendar className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none">
                      <span className="font-medium capitalize">{activity.type}</span>{" "}
                      <span className="text-muted-foreground">was {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.itemTitle}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent activity to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
