import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RentAffordabilityPage: React.FC = () => {
  // Sub-tab state
  const [activeTab, setActiveTab] = useState<'standard' | 'enhanced'>('standard');
  // Standard inputs
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(0);
  // Enhanced inputs
  const [grossIncome, setGrossIncome] = useState(24000);
  const [ehePercent, setEhePercent] = useState(20);
  const [useAvgCredit, setUseAvgCredit] = useState(true);
  const [creditCommitments, setCreditCommitments] = useState(150);
  // Results
  const [result, setResult] = useState<string | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);

  // Standard calculation
  function calculateStandard() {
    if (monthlyRent <= 0 || annualIncome <= 0) {
      setResult('Please enter valid rent and income.');
      return;
    }
    const tenantIncomeRequired = monthlyRent * 30;
    const guarantorIncomeRequired = monthlyRent * 36;
    const maxAffordableRent = (annualIncome / 30).toFixed(2);
    let affordability = '';
    if (annualIncome >= tenantIncomeRequired) {
      affordability = 'Your income is AFFORDABLE for this rent.';
    } else {
      affordability = 'Your income is UNAFFORDABLE for this rent.';
    }
    setResult(
      `Minimum Tenant Annual Income: £${tenantIncomeRequired.toLocaleString()}\nMinimum Guarantor Annual Income: £${guarantorIncomeRequired.toLocaleString()}\n${affordability}\nMaximum Affordable Monthly Rent: £${maxAffordableRent}`
    );
  }

  // Enhanced calculation
  function calculateEnhanced() {
    if (grossIncome <= 0) {
      setEnhancedResult('Please enter a valid gross income.');
      return;
    }
    // Estimate net income (simple UK 2024/25 tax bands)
    let net = grossIncome;
    if (grossIncome > 12570) {
      net -= Math.min(grossIncome - 12570, 37700) * 0.2;
    }
    if (grossIncome > 50270) {
      net -= Math.min(grossIncome - 50270, 100000) * 0.4;
    }
    if (grossIncome > 150000) {
      net -= (grossIncome - 150000) * 0.45;
    }
    const ehe = (ehePercent / 100) * net;
    const credit = useAvgCredit ? 150 : creditCommitments;
    const disposable = net - ehe - (credit * 12);
    setEnhancedResult(
      `Estimated Net Income: £${net.toLocaleString(undefined, {maximumFractionDigits:0})}\nEssential Household Expenditure: £${ehe.toLocaleString(undefined, {maximumFractionDigits:0})}/yr\nCredit Commitments: £${(credit*12).toLocaleString(undefined, {maximumFractionDigits:0})}/yr\n\nEstimated Disposable Income: £${disposable.toLocaleString(undefined, {maximumFractionDigits:0})}/yr\n\nDivide by 12 for monthly.`
    );
  }

  function resetStandard() {
    setMonthlyRent(0);
    setAnnualIncome(0);
    setResult(null);
  }
  function resetEnhanced() {
    setGrossIncome(24000);
    setEhePercent(20);
    setUseAvgCredit(true);
    setCreditCommitments(150);
    setEnhancedResult(null);
  }

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Rent Affordability Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={activeTab === 'standard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('standard')}
            className="w-1/2"
          >
            Standard
          </Button>
          <Button
            variant={activeTab === 'enhanced' ? 'default' : 'outline'}
            onClick={() => setActiveTab('enhanced')}
            className="w-1/2"
          >
            Enhanced
          </Button>
        </div>
        {activeTab === 'standard' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyRent">Monthly Rent (£) [Optional]</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={monthlyRent}
                onChange={e => setMonthlyRent(Number(e.target.value))}
                min={0}
                placeholder="Enter monthly rent (optional)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="annualIncome">Your Annual Income (£)</Label>
              <Input
                id="annualIncome"
                type="number"
                value={annualIncome}
                onChange={e => setAnnualIncome(Number(e.target.value))}
                min={0}
                placeholder="Enter your annual income"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={calculateStandard} className="w-1/2">Calculate</Button>
              <Button variant="outline" onClick={resetStandard} className="w-1/2">Reset</Button>
            </div>
            {result && (
              <pre className="bg-muted p-4 rounded text-base mt-4 border border-green-200 dark:border-green-700 whitespace-pre-wrap text-green-700 dark:text-green-300">{result}</pre>
            )}
          </div>
        )}
        {activeTab === 'enhanced' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="grossIncome">Annual Gross Income (£)</Label>
              <Input
                id="grossIncome"
                type="number"
                value={grossIncome}
                onChange={e => setGrossIncome(Number(e.target.value))}
                min={0}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ehePercent">Essential Household Expenditure (% of Net Income)</Label>
              <Input
                id="ehePercent"
                type="number"
                value={ehePercent}
                onChange={e => setEhePercent(Number(e.target.value))}
                min={0}
                max={100}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAvgCredit"
                checked={useAvgCredit}
                onChange={e => setUseAvgCredit(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              <Label htmlFor="useAvgCredit">Use average monthly credit commitments (£150)</Label>
            </div>
            <div>
              <Label htmlFor="creditCommitments">Monthly Credit Commitments (£)</Label>
              <Input
                id="creditCommitments"
                type="number"
                value={creditCommitments}
                onChange={e => setCreditCommitments(Number(e.target.value))}
                min={0}
                disabled={useAvgCredit}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={calculateEnhanced} className="w-1/2">Calculate Enhanced</Button>
              <Button variant="outline" onClick={resetEnhanced} className="w-1/2">Reset</Button>
            </div>
            {enhancedResult && (
              <pre className="bg-muted p-4 rounded text-base mt-4 border border-green-200 dark:border-green-700 whitespace-pre-wrap text-green-700 dark:text-green-300">{enhancedResult}</pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RentAffordabilityPage;
