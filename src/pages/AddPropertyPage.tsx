import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppData } from "@/contexts/AppContext";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  propertyType: z.enum(["apartment", "house", "condo", "townhouse", "commercial"]).optional(),
  landlordName: z.string().optional(),
  landlordContact: z.string().optional(),
  tenantName: z.string().optional(),
  tenantContact: z.string().optional(),
  featured: z.boolean().default(false),
  rentalAmount: z.number().optional(),
  leaseEndDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddPropertyPage: React.FC = () => {
  const { addProperty, updateProperty, getPropertyById } = useAppData();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId?: string }>();

  // If editing, load the property
  const editing = !!propertyId;
  const property = editing ? getPropertyById(propertyId!) : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editing && property ? {
      name: property.name,
      address: property.address,
      propertyType: property.propertyType,
      landlordName: property.landlordName,
      landlordContact: property.landlordContact,
      tenantName: property.tenantName,
      tenantContact: property.tenantContact,
      featured: property.featured,
      rentalAmount: property.rentalAmount,
      leaseEndDate: property.leaseEndDate ? new Date(property.leaseEndDate) : undefined,
    } : {
      name: "",
      address: "",
      propertyType: undefined,
      landlordName: "",
      landlordContact: "",
      tenantName: "",
      tenantContact: "",
      featured: false,
      rentalAmount: undefined,
      leaseEndDate: undefined,
    },
  });

  useEffect(() => {
    if (editing && property) {
      form.reset({
        name: property.name,
        address: property.address,
        propertyType: property.propertyType,
        landlordName: property.landlordName,
        landlordContact: property.landlordContact,
        tenantName: property.tenantName,
        tenantContact: property.tenantContact,
        featured: property.featured,
        rentalAmount: property.rentalAmount,
        leaseEndDate: property.leaseEndDate ? new Date(property.leaseEndDate) : undefined,
      });
    }
  }, [editing, property]);

  const onSubmit = (values: FormValues) => {
    try {
      const propertyData = {
        ...property,
        ...values,
        leaseEndDate: values.leaseEndDate ? values.leaseEndDate.getTime() : undefined,
      };
      if (editing) {
        updateProperty(propertyData);
      } else {
        addProperty(propertyData);
      }
      navigate("/properties");
    } catch (error) {
      console.error("Error saving property:", error);
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
            onClick={() => navigate("/properties")}
            className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-artdeco">{editing ? "Edit Property" : "Add New Property"}</h1>
        </div>
      </div>

      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gold-500" />
            Property Details
          </CardTitle>
          <CardDescription>
            {editing ? "Edit property details" : "Add a new property to your management portfolio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter property name" 
                        className="border-gold-200 dark:border-gold-800" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter property address" 
                        className="border-gold-200 dark:border-gold-800" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Type */}
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value as any)} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gold-200 dark:border-gold-800">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Landlord Name */}
                <FormField
                  control={form.control}
                  name="landlordName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landlord Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter landlord name" 
                          className="border-gold-200 dark:border-gold-800" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Landlord Contact */}
                <FormField
                  control={form.control}
                  name="landlordContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landlord Contact</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter landlord contact" 
                          className="border-gold-200 dark:border-gold-800" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tenant Name */}
                <FormField
                  control={form.control}
                  name="tenantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter tenant name" 
                          className="border-gold-200 dark:border-gold-800" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tenant Contact */}
                <FormField
                  control={form.control}
                  name="tenantContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Contact</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter tenant contact" 
                          className="border-gold-200 dark:border-gold-800" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rental Amount */}
                <FormField
                  control={form.control}
                  name="rentalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rental Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter rental amount" 
                          className="border-gold-200 dark:border-gold-800" 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lease End Date */}
                <FormField
                  control={form.control}
                  name="leaseEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Lease End Date</FormLabel>
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
              </div>

              {/* Featured */}
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-gold-200 dark:border-gold-800">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Property</FormLabel>
                      <CardDescription>
                        This property will be highlighted on the dashboard
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end gap-2 px-0 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/properties")}
                  className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-white"
                >
                  {editing ? "Save Changes" : "Add Property"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPropertyPage;
