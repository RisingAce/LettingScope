import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const QuickAddPage: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-artdeco">Quick Add</h1>
      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-gold-500" />
            Quick Add Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="flex items-center justify-center">
            <Link to="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center justify-center">
            <Link to="/bills/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center justify-center">
            <Link to="/chasers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center justify-center">
            <Link to="/notes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAddPage;
