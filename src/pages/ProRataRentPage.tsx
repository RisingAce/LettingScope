import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function daysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) + 1);
}

const ProRataRentPage: React.FC = () => {
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<string | null>(null);

  function calculateProRata() {
    if (!monthlyRent || !startDate || !endDate) {
      setResult('Please enter valid rent and dates.');
      return;
    }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) {
      setResult('End date must be after start date.');
      return;
    }
    const dailyRent = monthlyRent / 30.44;
    const days = daysBetween(startDate, endDate);
    const totalDue = dailyRent * days;
    setResult(`Rent Due: £${totalDue.toFixed(2)} (${days} days)`);
  }
  function reset() {
    setMonthlyRent(0);
    setStartDate('');
    setEndDate('');
    setResult(null);
  }
  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Pro-Rata Rent Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent (£)</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={monthlyRent}
              onChange={e => setMonthlyRent(Number(e.target.value))}
              min={0}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={calculateProRata} className="w-1/2">Calculate Rent Due</Button>
            <Button variant="outline" onClick={reset} className="w-1/2">Reset</Button>
          </div>
          {result && (
            <pre className="bg-muted p-4 rounded text-base mt-4 border border-green-200 dark:border-green-700 whitespace-pre-wrap text-green-700 dark:text-green-300">{result}</pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProRataRentPage;
