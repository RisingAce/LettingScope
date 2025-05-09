
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bell, Building, FileText, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAppData } from "@/contexts/AppContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  propertyId: z.string().optional(),
  billId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AddChaserPage: React.FC = () => {
  const { addChaser, data } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have preselected IDs from navigation state
  const preselectedPropertyId = location.state?.propertyId;
  const preselectedBillId = location.state?.billId;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: preselectedPropertyId || undefined,
      billId: preselectedBillId || undefined,
      title: "",
      description: "",
      dueDate: undefined,
      priority: undefined,
    },
  });

  const selectedPropertyId = form.watch("propertyId");
  const selectedBillId = form.watch("billId");

  const onSubmit = (values: FormValues) => {
    try {
      // Fix: Convert Date object to timestamp (number)
      const chaserData = {
        ...values,
        title: values.title,
        dueDate: values.dueDate.getTime(), // Convert Date to number timestamp
        priority: values.priority,
        completed: false,
      };
      
      addChaser(chaserData);
      
      if (preselectedPropertyId) {
        navigate(`/properties/${preselectedPropertyId}`);
      } else if (preselectedBillId) {
        const bill = data.bills.find(b => b.id === preselectedBillId);
        if (bill) {
          navigate(`/properties/${bill.propertyId}`);
        } else {
          navigate("/chasers");
        }
      } else {
        navigate("/chasers");
      }
    } catch (error) {
      console.error("Error adding chaser:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(preselectedPropertyId ? `/properties/${preselectedPropertyId}` : "/chasers")}
            className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-artdeco">Add New Reminder</h1>
        </div>
      </div>

      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold-500" />
            Reminder Details
          </CardTitle>
          <CardDescription>
            Create a reminder for tasks, deadlines, or bill payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!!preselectedPropertyId}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gold-200 dark:border-gold-800">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Using "none" instead of empty string */}
                        <SelectItem value="none">Not associated with a property</SelectItem>
                        {data.properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{property.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedPropertyId && selectedPropertyId !== "none") && (
                <FormField
                  control={form.control}
                  name="billId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!!preselectedBillId}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gold-200 dark:border-gold-800">
                            <SelectValue placeholder="Select a bill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not associated with a bill</SelectItem>
                          {data.bills
                            .filter(bill => bill.propertyId === selectedPropertyId)
                            .map((bill) => (
                              <SelectItem key={bill.id} value={bill.id}>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span>{bill.provider} - {bill.utilityType} (£{bill.amount})</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter reminder title" 
                        className="border-gold-200 dark:border-gold-800" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter reminder details" 
                        className="min-h-24 border-gold-200 dark:border-gold-800" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border-gold-200 dark:border-gold-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gold-200 dark:border-gold-800">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-end gap-2 px-0 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(preselectedPropertyId ? `/properties/${preselectedPropertyId}` : "/chasers")}
                  className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-white"
                >
                  Add Reminder
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddChaserPage;

