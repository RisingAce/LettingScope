import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RentalIncreasePage: React.FC = () => {
  const [currentRent, setCurrentRent] = useState(0);
  const [openMarketRent, setOpenMarketRent] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  function calculateIncrease() {
    if (currentRent <= 0 || openMarketRent <= 0) {
      setResult('Please enter valid positive numbers for both rents.');
      return;
    }
    const difference = openMarketRent - currentRent;
    const marketDiffPercent = (difference / currentRent) * 100;
    if (marketDiffPercent <= 6) {
      setResult(`Market Difference: ${marketDiffPercent.toFixed(2)}%\nNo increase allowed (≤ 6%). Refer to legislation.`);
      return;
    }
    const usedDiffPercent = Math.min(marketDiffPercent, 24);
    const newRent = Math.floor(
      currentRent * ((106 + ((usedDiffPercent - 6) / 3)) / 100)
    );
    const increaseAmount = newRent - currentRent;
    let capNote = '';
    if (marketDiffPercent > 24) {
      capNote = `(Original difference was ${marketDiffPercent.toFixed(2)}%, capped at 24%.)\n`;
    }
    setResult(
      `Market Difference: ${marketDiffPercent.toFixed(2)}%\n${capNote}New Rent (rounded down): £${newRent.toFixed(2)}\nIncrease Amount: £${increaseAmount.toFixed(2)}`
    );
  }
  function reset() {
    setCurrentRent(0);
    setOpenMarketRent(0);
    setResult(null);
  }
  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Rental Increase Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentRent">Current Rent (£)</Label>
            <Input
              id="currentRent"
              type="number"
              value={currentRent}
              onChange={e => setCurrentRent(Number(e.target.value))}
              min={0}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="openMarketRent">Open Market Rent (£)</Label>
            <Input
              id="openMarketRent"
              type="number"
              value={openMarketRent}
              onChange={e => setOpenMarketRent(Number(e.target.value))}
              min={0}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={calculateIncrease} className="w-1/2">Calculate Allowed Increase</Button>
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

export default RentalIncreasePage;
