import React, { useState, useRef, useEffect, useCallback } from "react";
import { useCoefficients } from "../lib/coefficients";
import { calcFairRent } from "../utils/rentUtils";
import { calcDelusion } from "../utils/delusion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Bed, 
  Map, 
  Thermometer, 
  Wifi, 
  PiggyBank, 
  AlertTriangle, 
  PoundSterling,
  Search,
  X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultCoefficients } from "../lib/coefficients";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const formSchema = z.object({
  area: z.coerce.number().min(10, "Must be at least 10m²").max(500, "Must be less than 500m²"),
  beds: z.coerce.number().min(1, "Must have at least 1 bedroom").max(10, "Must have fewer than 10 bedrooms"),
  location: z.string().min(1, "Location is required"),
  condition: z.string().min(1, "Condition is required"),
  epc: z.string().min(1, "EPC rating is required"),
  broadband: z.coerce.number().min(0, "Must be at least 0 Mbps"),
  additive: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalValuatorPage() {
  const { data: coeff } = useCoefficients();
  
  // Get location and condition options from coefficients
  const locationOptions = coeff ? Object.keys(coeff.location) : 
    Object.keys(defaultCoefficients.location);
  const conditionOptions = coeff ? Object.keys(coeff.condition) : 
    Object.keys(defaultCoefficients.condition);
  const epcOptions = coeff ? Object.keys(coeff.epc) : 
    Object.keys(defaultCoefficients.epc);

  // Initialize form first so we can use it in hooks below
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: 60,
      beds: 2,
      location: "Leith",
      condition: "Average",
      epc: "C",
      broadband: 80,
      additive: 0,
    },
  });

  // State for location search popup
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>(locationOptions);

  // Get the current form values for calculations
  const formValues = form.watch();  

  // Function to handle location selection from dialog
  const handleLocationSelect = useCallback((location: string) => {
    form.setValue("location", location, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
    
    // Force update the select element in the DOM directly
    setTimeout(() => {
      // Get all select elements with data-placeholder="Select location"
      const selectElements = document.querySelectorAll('.select-trigger');
      
      // Update the text content of each matching select element
      selectElements.forEach(element => {
        const span = element.querySelector('span');
        if (span) {
          span.textContent = location;
        }
      });
    }, 100);
    
    // Close the dialog
    setLocationDialogOpen(false);
    setSearchTerm("");
  }, [form]);

  // Filter locations when search term changes
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredLocations(locationOptions);
    } else {
      const filtered = locationOptions.filter(
        location => location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm, locationOptions]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!locationDialogOpen) {
      setSearchTerm("");
    }
  }, [locationDialogOpen]);

  // Delusion parameters with memoized value to prevent unnecessary recalculations
  const [delusionParams] = useState({
    anchoring: 0.05, // Tendency to anchor to higher initial price
    btr: 0.01,       // Premium for new Build-to-Rent stock
    cap: 0.01,       // Market capitalisation/investment factor
    demand: 0.01,    // General demand pressure
    agent: 0,
    scarcity: 0.02,  // Lack of available properties
  });

  const fair = coeff ? calcFairRent(coeff, {
    area: formValues.area,
    beds: formValues.beds,
    location: formValues.location,
    condition: formValues.condition,
    epc: formValues.epc,
    broadband: formValues.broadband,
    additive: formValues.additive || 0,
  }) : 0;
  
  const [delusionMult, delusionLabel] = calcDelusion({
    ...delusionParams
  });
  
  // Ensure we're working with a number for the calculation
  const delusionMultNum = typeof delusionMult === 'number' ? delusionMult : 1;
  const asking = Math.round(fair * delusionMultNum);

  // --- Build grouped location options for UI ---
  const groupedLocationOptions: { group: string, options: { name: string, value: number }[] }[] = [
    {
      group: 'City Centre',
      options: [
        'New Town', 'Old Town', 'West End', 'Haymarket', 'Tollcross', 'The Meadows', 'Marchmont', 'Bruntsfield', 'Lauriston', 'Fountainbridge', 'Dean Village', 'Stockbridge', 'Comely Bank', 'Canonmills', 'Broughton', 'Leith Walk'
      ]
    },
    {
      group: 'North Edinburgh',
      options: [
        'Inverleith', 'Trinity', 'Newhaven', 'Granton', 'Silverknowes', 'Blackhall', "Davidson's Mains", 'Barnton', 'Cramond', 'Muirhouse', 'Pilton', 'Warriston', 'Goldenacre', 'Craigleith', 'Kimmerghame', 'Drylaw', 'West Pilton', 'Granton Harbour', 'Ferry Road', 'Granton Road'
      ]
    },
    {
      group: 'West Edinburgh',
      options: [
        'Corstorphine', 'Murrayfield', 'Saughton', 'Stenhouse', 'Carrick Knowe', 'Clermiston', 'South Gyle', 'West Craigs', 'Ratho', 'Gogar', 'Ingliston', 'Cammo', 'Balerno', 'Currie', 'Juniper Green', 'Baberton', 'Wester Hailes', 'Sighthill', 'Broomhouse', 'Longstone', 'Slateford', 'Parkhead', 'Drumbrae', 'Barnton Park', 'East Craigs', 'Clermiston Park'
      ]
    },
    {
      group: 'South Edinburgh',
      options: [
        'Morningside', 'Grange', 'Blackford', 'Mayfield', 'Sciennes', 'Liberton', 'Liberton Mains', 'Gilmerton', 'Fernieside', 'Moredun', 'Craigmillar', 'Niddrie', 'Prestonfield', 'Newington', 'Southhouse', 'Kaimes', 'Oxgangs', 'Fairmilehead', 'Swanston', 'Buckstone', 'Comiston', 'Colinton', 'Colinton Mains', 'Craiglockhart', 'Craiglockhart Dell', 'Redhall', 'Woodhall', 'Alnwickhill', 'Liberton Brae', 'Burdiehouse', 'Viewforth'
      ]
    },
    {
      group: 'East Edinburgh',
      options: [
        'Portobello', 'Joppa', 'Duddingston', 'Mountcastle', 'Willowbrae', 'Seafield', 'Restalrig', 'Lochend', 'Craigentinny', 'Meadowbank', 'Abbeyhill', 'Easter Road', 'Leith', 'Pilrig', 'Bonnington', 'The Shore', 'Gracemount', 'Northfield'
      ]
    },
    {
      group: 'Southside & University',
      options: [
        'Southside', 'Marchmont Road', 'Morningside Park'
      ]
    },
    {
      group: 'Outskirts/Greater Edinburgh',
      options: [
        'Cramond Bridge', 'Queensferry', 'Kirkliston', 'Newcraighall', 'Musselburgh', 'Dalkeith', 'Loanhead', 'Penicuik', 'Roslin', 'Bonnyrigg', 'Gorebridge', 'Prestonpans', 'Tranent', 'East Calder', 'West Calder', 'Livingston', 'Broxburn', 'Bathgate', 'Linlithgow', 'Haddington', 'North Berwick', 'Dunbar'
      ]
    },
  ].map(groupObj => ({
    ...groupObj,
    options: groupObj.options
      .filter(name => locationOptions.includes(name))
      .map(name => ({ name, value: coeff?.location[name] ?? defaultCoefficients.location[name] }))
  })).filter(groupObj => groupObj.options.length > 0);

  return (
    <div className="container mx-auto py-6">
      <Card className="border-gold-200 dark:border-gold-800 shadow-md">
        <CardHeader className="bg-gold-50 dark:bg-gold-900/20 border-b border-gold-200 dark:border-gold-800">
          <CardTitle className="text-2xl text-gold-800 dark:text-gold-300 flex items-center gap-2">
            <Home className="h-5 w-5 text-gold-500" />
            Edinburgh Rental Valuator
          </CardTitle>
          <CardDescription>
            Calculate fair market rent and likely asking prices for Edinburgh properties
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Map className="h-4 w-4 text-gold-500" />
                        Area (m²)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="beds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-gold-500" />
                        Bedrooms
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Map className="h-4 w-4 text-gold-500" />
                        Location
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div 
                            className="h-10 px-3 py-2 rounded-md border border-gold-200 dark:border-gold-800 bg-background flex items-center justify-between w-full text-sm" 
                            onClick={() => setLocationDialogOpen(true)}
                          >
                            <span>{field.value}</span>
                            <Map className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="icon"
                          className="border-gold-200 dark:border-gold-800 text-gold-500"
                          onClick={() => setLocationDialogOpen(true)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Home className="h-4 w-4 text-gold-500" />
                        Condition
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("condition");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gold-200 dark:border-gold-800">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditionOptions.map(cond => (
                            <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="epc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Thermometer className="h-4 w-4 text-gold-500" />
                        EPC Rating
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger("epc");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gold-200 dark:border-gold-800">
                            <SelectValue placeholder="Select EPC rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {epcOptions.map(epc => (
                            <SelectItem key={epc} value={epc}>{epc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="broadband"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Wifi className="h-4 w-4 text-gold-500" />
                        Broadband (Mbps)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="border-gold-200 dark:border-gold-800"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Card className="border-gold-200 dark:border-gold-800 shadow-md">
                  <CardHeader className="bg-gold-50 dark:bg-gold-900/20 p-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-gold-500" />
                      Fair Market Rent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-gold-600 dark:text-gold-400">£{fair}</div>
                    <div className="text-sm text-gray-500 mt-2">Based on local market data</div>
                  </CardContent>
                </Card>

                <Card className="border-gold-200 dark:border-gold-800 shadow-md">
                  <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 p-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Delusion Factor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{delusionLabel}</div>
                    <div className="text-sm text-gray-500 mt-2">Market inflation estimate</div>
                  </CardContent>
                </Card>

                <Card className="border-gold-200 dark:border-gold-800 shadow-md">
                  <CardHeader className="bg-gold-50 dark:bg-gold-900/20 p-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PoundSterling className="h-5 w-5 text-gold-500" />
                      Likely Asking Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-3xl font-bold text-gold-600 dark:text-gold-400">£{asking}</div>
                    <div className="text-sm text-gray-500 mt-2">What you'll see advertised</div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Location Search Dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-gold-500" />
              Find Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative my-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              autoFocus
              className="pl-10 border-gold-200 dark:border-gold-800"
              placeholder="Search Edinburgh areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto max-h-[50vh] pr-1 -mr-1">
            {groupedLocationOptions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {groupedLocationOptions.map(group => (
                  <div key={group.group}>
                    <div className="text-gold-400 font-semibold px-2 pt-2 pb-1 uppercase text-xs tracking-wider sticky top-0 bg-background/90 z-10">{group.group}</div>
                    <div className="grid grid-cols-1 gap-1">
                      {group.options
                        .filter(loc => searchTerm === "" || loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(loc => (
                          <Button
                            key={loc.name}
                            variant="ghost"
                            className="w-full justify-start text-left hover:bg-gold-50 dark:hover:bg-gold-900/20 h-auto py-2"
                            onClick={() => handleLocationSelect(loc.name)}
                          >
                            <span className="flex-1">{loc.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {loc.value > 0 ? "+" : ""}{Math.round(loc.value * 100)}%
                            </span>
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No locations found matching "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
