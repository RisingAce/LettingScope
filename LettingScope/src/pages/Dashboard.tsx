
import React from "react";
import { useAppData } from "@/contexts/AppContext";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, AlertTriangle, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Dashboard: React.FC = () => {
  const { getUpcomingChasers, getOverdueBills, data, formatCurrency } = useAppData();
  
  const upcomingChasers = getUpcomingChasers();
  const overdueBills = getOverdueBills();
  
  // Featured properties (those marked as featured or the first 3)
  const featuredProperties = data.properties
    .filter(property => property.featured)
    .slice(0, 3);
  
  const displayedProperties = featuredProperties.length > 0 
    ? featuredProperties 
    : data.properties.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-3xl font-artdeco">Dashboard</h1>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-gold-200 dark:border-gold-800">
            <Link to="/properties/new">
              <Building className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
          <Button asChild className="bg-gold-500 hover:bg-gold-600 text-white">
            <Link to="/chasers/new">
              <Calendar className="mr-2 h-4 w-4" />
              Add Reminder
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats />
      
      {/* Alerts and Upcoming Section */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Overdue Bills */}
        <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Overdue Bills
            </CardTitle>
            <CardDescription>Bills that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {overdueBills.length > 0 ? (
              <div className="space-y-3">
                {overdueBills.slice(0, 5).map((bill) => {
                  const property = data.properties.find(p => p.id === bill.propertyId);
                  return (
                    <div key={bill.id} className="flex items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{bill.provider} - {bill.utilityType}</p>
                        <p className="text-sm text-muted-foreground">
                          {property?.name || "Unknown property"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            bill.status === "overdue" 
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          }`}>
                            {bill.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Due: {format(new Date(bill.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(bill.amount)}</div>
                        <Link to={`/properties/${bill.propertyId}`} className="text-xs text-gold-500 hover:text-gold-600 flex items-center">
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
                
                {overdueBills.length > 5 && (
                  <Button variant="link" asChild className="mt-2 w-full justify-center text-gold-500">
                    <Link to="/bills">View all {overdueBills.length} overdue bills</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No overdue bills. Great job!
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Reminders */}
        <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold-500" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>
              Reminders due soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingChasers.length > 0 ? (
              <div className="space-y-3">
                {upcomingChasers.slice(0, 5).map((chaser) => {
                  const property = chaser.propertyId 
                    ? data.properties.find(p => p.id === chaser.propertyId) 
                    : null;
                  
                  return (
                    <div key={chaser.id} className="flex items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{chaser.title}</p>
                        {property && (
                          <p className="text-sm text-muted-foreground">
                            {property.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            chaser.priority === "high" 
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : chaser.priority === "medium"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}>
                            {chaser.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Due: {format(new Date(chaser.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Link to="/chasers" className="text-xs text-gold-500 hover:text-gold-600 flex items-center">
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
                
                {upcomingChasers.length > 5 && (
                  <Button variant="link" asChild className="mt-2 w-full justify-center text-gold-500">
                    <Link to="/chasers">View all {upcomingChasers.length} upcoming reminders</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming reminders
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Properties */}
      <Card className="border-gold-200 dark:border-gold-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-gold-500" />
              Properties
            </CardTitle>
            <CardDescription>
              {featuredProperties.length > 0 ? "Featured properties" : "Your recent properties"}
            </CardDescription>
          </div>
          <Button variant="link" asChild className="text-gold-500">
            <Link to="/properties">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {displayedProperties.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {displayedProperties.map((property) => {
                const propertyBills = data.bills.filter(bill => bill.propertyId === property.id);
                const unpaidBillsCount = propertyBills.filter(bill => !bill.paid).length;
                
                return (
                  <Card key={property.id} className="border-gold-200 dark:border-gold-800 overflow-hidden">
                    <div className="h-28 bg-gradient-to-r from-gold-100 to-gold-200 dark:from-gold-900 dark:to-gold-800 flex items-center justify-center">
                      <Building className="h-12 w-12 text-gold-500" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium line-clamp-1">{property.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{property.address}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-sm">
                        {property.rentalAmount ? (
                          <span className="font-medium">{formatCurrency(property.rentalAmount)}/month</span>
                        ) : (
                          <span>No rental info</span>
                        )}
                        
                        {unpaidBillsCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            {unpaidBillsCount} unpaid bill{unpaidBillsCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <Button variant="outline" asChild className="w-full mt-3 border-gold-200 dark:border-gold-800">
                        <Link to={`/properties/${property.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You haven't added any properties yet</p>
              <Button asChild className="bg-gold-500 hover:bg-gold-600 text-white">
                <Link to="/properties/new">
                  <Building className="mr-2 h-4 w-4" />
                  Add Your First Property
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
