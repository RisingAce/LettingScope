import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppData } from "@/contexts/AppContext";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { ArrowUpFromLine, ArrowDownToLine, Trash2, Info } from "lucide-react";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
  const { data, updateSettings, exportDataZip, importDataZip, clearData } = useAppData();
  
  const [notificationDays, setNotificationDays] = useState(data.settings.notificationDaysBefore);
  const [currency, setCurrency] = useState(data.settings.currency);
  const [dateFormat, setDateFormat] = useState(data.settings.dateFormat);
  const [emailParsingEnabled, setEmailParsingEnabled] = useState(data.settings.emailParsingEnabled);
  
  // File input reference
  const fileInputZipRef = React.useRef<HTMLInputElement>(null);
  
  // Handle settings save
  const handleSaveSettings = () => {
    updateSettings({
      notificationDaysBefore: parseInt(notificationDays.toString()),
      currency,
      dateFormat,
      emailParsingEnabled,
    });
    toast.success("Settings saved successfully");
  };
  
  // Handle ZIP import
  const handleImportZip = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer || typeof arrayBuffer !== 'object') throw new Error('Invalid file');
        const success = await importDataZip(new Blob([arrayBuffer]));
        if (success) {
          toast.success('Full backup imported successfully!');
        } else {
          toast.error('Failed to import backup.');
        }
      } catch (error) {
        console.error('Error importing backup:', error);
        toast.error('Failed to import backup.');
      }
      if (fileInputZipRef.current) fileInputZipRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      
      <div className="grid gap-6">
        {/* Application Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Configure general settings for the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notificationDays">Notification Days Before</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="notificationDays"
                  type="number"
                  min="1"
                  max="30"
                  value={notificationDays}
                  onChange={(e) => setNotificationDays(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  days before due date
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Show notifications this many days before a bill or chaser is due
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="GBP">British Pound (£)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="CAD">Canadian Dollar (CA$)</option>
                <option value="AUD">Australian Dollar (A$)</option>
                <option value="INR">Indian Rupee (₹)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <select
                id="dateFormat"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="dd/MM/yyyy">DD/MM/YYYY (31/12/2025)</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY (12/31/2025)</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD (2025-12-31)</option>
                <option value="dd MMM yyyy">DD MMM YYYY (31 Dec 2025)</option>
                <option value="MMM dd, yyyy">MMM DD, YYYY (Dec 31, 2025)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between space-y-0">
              <div className="space-y-0.5">
                <Label htmlFor="emailParsing">Email Parsing</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable automatic email parsing
                </p>
              </div>
              <Switch
                id="emailParsing"
                checked={emailParsingEnabled}
                onCheckedChange={setEmailParsingEnabled}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </CardFooter>
        </Card>
        
        {/* Data Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Import, export, or clear your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* --- Export/Import Full Backup (ZIP) Only --- */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Data (Full Backup)</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data and documents as a ZIP backup file
                  </p>
                </div>
                <Button variant="outline" onClick={exportDataZip}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Export Full Backup (ZIP)
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Import Data (Full Backup)</h4>
                  <p className="text-sm text-muted-foreground">
                    Import your data and documents from a ZIP backup file
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputZipRef.current?.click()}
                >
                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                  Import Full Backup (ZIP)
                </Button>
                <input
                  type="file"
                  ref={fileInputZipRef}
                  accept=".zip"
                  style={{ display: "none" }}
                  onChange={handleImportZip}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Clear All Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Delete all your data permanently
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your
                        properties, bills, chasers, and notes data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, clear all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* About Card */}
        <Card>
          <CardHeader>
            <CardTitle>LettingScope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Version: {data.version}</span>
            </div>
            <p className="text-sm">
              LettingScope is a simple, yet powerful application to help you manage your properties,
              utility bills, and reminders. Keep track of all your property-related tasks in one place.
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            &copy; 2025 LettingScope. All rights reserved.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
