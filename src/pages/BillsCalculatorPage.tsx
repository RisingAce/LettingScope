import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const councilTaxData = {
  A: { total: 1329.39 },
  B: { total: 1550.95 },
  C: { total: 1772.52 },
  D: { total: 1994.08 },
  E: { total: 2569.91 },
  F: { total: 3141.73 },
  G: { total: 3745.71 },
  H: { total: 4639.62 },
};

const BillsCalculatorPage: React.FC = () => {
  // Sub-tab state
  const [activeTab, setActiveTab] = useState<'energy' | 'council'>('energy');

  // Energy calculator state
  const [householdSize, setHouseholdSize] = useState('2-3');
  const [epcRating, setEpcRating] = useState('off');
  const [combineCouncilTax, setCombineCouncilTax] = useState(false);
  const [energyResult, setEnergyResult] = useState<string | null>(null);

  // Council tax calculator state
  const [councilBand, setCouncilBand] = useState('D');
  const [councilResult, setCouncilResult] = useState<string | null>(null);

  // Energy calculation logic
  function calculateUtilityBill() {
    let electricityUsage = 0, gasUsage = 0;
    if (householdSize === '1-2') {
      electricityUsage = 1800; gasUsage = 7500;
    } else if (householdSize === '2-3') {
      electricityUsage = 2700; gasUsage = 11500;
    } else {
      electricityUsage = 4100; gasUsage = 17000;
    }
    const elecUnitRate = 0.2396;
    const elecStanding = 0.6417;
    const gasUnitRate = 0.0609;
    const gasStanding = 0.3180;
    let elecAnnual = electricityUsage * elecUnitRate + (elecStanding * 365);
    let gasAnnual  = gasUsage * gasUnitRate + (gasStanding * 365);
    let totalAnnual = elecAnnual + gasAnnual;
    // EPC multiplier
    let multiplier = epcRating !== 'off' ? parseFloat(epcRating) : 1.0;
    totalAnnual *= multiplier;
    const displayMonthly = totalAnnual / 12;
    let combinedText = '';
    if (combineCouncilTax) {
      const councilTaxAnnual = councilTaxData[councilBand]?.total || 0;
      const combinedAnnual = totalAnnual + councilTaxAnnual;
      const combinedMonthly = combinedAnnual / 12;
      combinedText = `\nCombined with Council Tax:\nCombined Monthly: £${combinedMonthly.toFixed(2)}\nCombined Annual: £${combinedAnnual.toFixed(2)}`;
    }
    setEnergyResult(
      `Energy cost per month: £${displayMonthly.toFixed(2)}\nEnergy cost per year: £${totalAnnual.toFixed(2)}${combinedText}\n\nThese are estimations only. Actual figures may vary.`
    );
  }

  // Council tax calculation logic
  function updateCouncilTax() {
    const bandData = councilTaxData[councilBand];
    if (!bandData) {
      setCouncilResult('Invalid band selected.');
      return;
    }
    const councilTaxAnnual = bandData.total;
    const monthly = councilTaxAnnual / 12;
    setCouncilResult(
      `Band ${councilBand} Annual: £${councilTaxAnnual.toFixed(2)}\nMonthly (approx): £${monthly.toFixed(2)}\n(Water & Sewerage included)`
    );
  }

  // Reset functions
  function resetEnergyCalculator() {
    setHouseholdSize('2-3');
    setEpcRating('off');
    setCombineCouncilTax(false);
    setEnergyResult(null);
  }
  function resetCouncilTax() {
    setCouncilBand('D');
    setCouncilResult(null);
  }

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Bills Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={activeTab === 'energy' ? 'default' : 'outline'}
            onClick={() => setActiveTab('energy')}
            className="w-1/2"
          >
            Energy Costs
          </Button>
          <Button
            variant={activeTab === 'council' ? 'default' : 'outline'}
            onClick={() => setActiveTab('council')}
            className="w-1/2"
          >
            Council Tax 2024/25
          </Button>
        </div>
        {/* ENERGY TAB */}
        {activeTab === 'energy' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="householdSize">Household Size</Label>
              <Select value={householdSize} onValueChange={setHouseholdSize}>
                <SelectTrigger id="householdSize" className="mt-1" aria-label="Household Size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2">1-2 people</SelectItem>
                  <SelectItem value="2-3">2-3 people</SelectItem>
                  <SelectItem value="4-5">4-5 people</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="epcRating">EPC Rating Multiplier</Label>
              <Select value={epcRating} onValueChange={setEpcRating}>
                <SelectTrigger id="epcRating" className="mt-1" aria-label="EPC Rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off (No multiplier)</SelectItem>
                  <SelectItem value="0.8">A (0.8×)</SelectItem>
                  <SelectItem value="0.9">B (0.9×)</SelectItem>
                  <SelectItem value="1.0">C (1.0×)</SelectItem>
                  <SelectItem value="1.1">D (1.1×)</SelectItem>
                  <SelectItem value="1.2">E (1.2×)</SelectItem>
                  <SelectItem value="1.3">F (1.3×)</SelectItem>
                  <SelectItem value="1.4">G (1.4×)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="combineCouncilTaxToggle"
                checked={combineCouncilTax}
                onChange={e => setCombineCouncilTax(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              <Label htmlFor="combineCouncilTaxToggle">Include Council Tax in total?</Label>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={calculateUtilityBill} className="w-1/2">Calculate Energy Costs</Button>
              <Button variant="outline" onClick={resetEnergyCalculator} className="w-1/2">Reset</Button>
            </div>
            {energyResult && (
              <pre className="bg-muted p-4 rounded text-green-700 dark:text-green-300 whitespace-pre-wrap text-base mt-4 border border-green-200 dark:border-green-700">{energyResult}</pre>
            )}
          </div>
        )}
        {/* COUNCIL TAX TAB */}
        {activeTab === 'council' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="councilBand">Council Tax Band</Label>
              <Select value={councilBand} onValueChange={setCouncilBand}>
                <SelectTrigger id="councilBand" className="mt-1" aria-label="Council Tax Band">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Band A</SelectItem>
                  <SelectItem value="B">Band B</SelectItem>
                  <SelectItem value="C">Band C</SelectItem>
                  <SelectItem value="D">Band D</SelectItem>
                  <SelectItem value="E">Band E</SelectItem>
                  <SelectItem value="F">Band F</SelectItem>
                  <SelectItem value="G">Band G</SelectItem>
                  <SelectItem value="H">Band H</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={updateCouncilTax} className="w-1/2">Show Council Tax</Button>
              <Button variant="outline" onClick={resetCouncilTax} className="w-1/2">Reset</Button>
            </div>
            {councilResult && (
              <pre className="bg-muted p-4 rounded text-green-700 dark:text-green-300 whitespace-pre-wrap text-base mt-4 border border-green-200 dark:border-green-700">{councilResult}</pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillsCalculatorPage;
