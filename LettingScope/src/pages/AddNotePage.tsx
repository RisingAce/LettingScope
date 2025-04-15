
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, StickyNote, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/contexts/AppContext";

const formSchema = z.object({
  propertyId: z.string().min(1, "Property selection is required"),
  title: z.string().min(1, "Note title is required"),
  content: z.string().min(1, "Note content is required"),
});

type FormValues = z.infer<typeof formSchema>;

const AddNotePage: React.FC = () => {
  const { addNote, data } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have a preselected property ID from navigation state
  const preselectedPropertyId = location.state?.propertyId;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: preselectedPropertyId || "",
      title: "",
      content: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    try {
      // Ensure all required fields are passed
      const noteData = {
        propertyId: values.propertyId,
        title: values.title,
        content: values.content
      };
      
      addNote(noteData);
      
      if (preselectedPropertyId) {
        navigate(`/properties/${preselectedPropertyId}`);
      } else {
        navigate("/notes");
      }
    } catch (error) {
      console.error("Error adding note:", error);
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
            onClick={() => navigate(preselectedPropertyId ? `/properties/${preselectedPropertyId}` : "/notes")}
            className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-artdeco">Add New Note</h1>
        </div>
      </div>

      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-gold-500" />
            Note Details
          </CardTitle>
          <CardDescription>
            Add a note associated with a property
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
                    <FormLabel>Property</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!preselectedPropertyId}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gold-200 dark:border-gold-800">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {data.properties.map((property) => (
                          <SelectItem key={property.id} value={property.id} className="flex items-center gap-2">
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

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter note title" 
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
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter note details" 
                        className="min-h-32 border-gold-200 dark:border-gold-800" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end gap-2 px-0 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(preselectedPropertyId ? `/properties/${preselectedPropertyId}` : "/notes")}
                  className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-white"
                >
                  Add Note
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNotePage;
