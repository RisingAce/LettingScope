import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RentalAffordabilityPage: React.FC = () => {
  // Sub-tab state
  const [activeTab, setActiveTab] = useState<'standard' | 'enhanced'>('standard');
  // Standard inputs
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('');
  const [annualIncome, setAnnualIncome] = useState<number | ''>('');
  // Enhanced inputs
  const [grossIncome, setGrossIncome] = useState<number | ''>(24000);
  const [ehePercent, setEhePercent] = useState<number | ''>(20);
  const [useAvgCredit, setUseAvgCredit] = useState(true);
  const [creditCommitments, setCreditCommitments] = useState<number | ''>(150);
  // Results
  const [result, setResult] = useState<string | null>(null);
  const [affordability, setAffordability] = useState<string | null>(null);
  const [maxRent, setMaxRent] = useState<string | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);

  // For chart
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Standard calculation
  function calculateStandard() {
    if (monthlyRent === '' || annualIncome === '' || Number(monthlyRent) <= 0 || Number(annualIncome) <= 0) {
      setResult('Please enter valid rent and income.');
      setAffordability(null);
      setMaxRent(null);
      drawAffordabilityChart(null, null);
      return;
    }
    const rent = Number(monthlyRent);
    const income = Number(annualIncome);
    const tenantIncomeRequired = rent * 30;
    const guarantorIncomeRequired = rent * 36;
    const maxAffordableRent = (income / 30).toFixed(2);
    let aff = '';
    if (income >= tenantIncomeRequired) {
      aff = 'Your income is AFFORDABLE for this rent.';
    } else {
      aff = 'Your income is UNAFFORDABLE for this rent.';
    }
    setResult(
      `Minimum Tenant Annual Income: £${tenantIncomeRequired.toLocaleString()}\nMinimum Guarantor Annual Income: £${guarantorIncomeRequired.toLocaleString()}`
    );
    setAffordability(aff);
    setMaxRent('Maximum Affordable Monthly Rent: £' + maxAffordableRent);
    drawAffordabilityChart(tenantIncomeRequired, income);
  }

  // Enhanced calculation
  function calculateEnhanced() {
    if (grossIncome === '' || Number(grossIncome) <= 0) {
      setEnhancedResult('Please enter a valid gross income.');
      return;
    }
    // Estimate net income (simple UK 2024/25 tax bands)
    let gross = Number(grossIncome);
    let net = gross;
    if (gross > 12570) {
      net -= Math.min(gross - 12570, 37700) * 0.2;
    }
    if (gross > 50270) {
      net -= Math.min(gross - 50270, 100000) * 0.4;
    }
    if (gross > 150000) {
      net -= (gross - 150000) * 0.45;
    }
    const ehe = (Number(ehePercent) / 100) * net;
    const credit = useAvgCredit ? 150 : Number(creditCommitments);
    const disposable = net - ehe - (credit * 12);
    setEnhancedResult(
      `Estimated Net Income: £${net.toLocaleString(undefined, {maximumFractionDigits:0})}\nEssential Household Expenditure: £${ehe.toLocaleString(undefined, {maximumFractionDigits:0})}/yr\nCredit Commitments: £${(credit*12).toLocaleString(undefined, {maximumFractionDigits:0})}/yr\n\nEstimated Disposable Income: £${disposable.toLocaleString(undefined, {maximumFractionDigits:0})}/yr\n\nDivide by 12 for monthly.`
    );
  }

  function resetStandard() {
    setMonthlyRent('');
    setAnnualIncome('');
    setResult(null);
    setAffordability(null);
    setMaxRent(null);
    drawAffordabilityChart(null, null);
  }
  function resetEnhanced() {
    setGrossIncome(24000);
    setEhePercent(20);
    setUseAvgCredit(true);
    setCreditCommitments(150);
    setEnhancedResult(null);
  }

  // Chart drawing
  function drawAffordabilityChart(threshold: number | null, userIncome: number | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (threshold === null || userIncome === null) return;
    const width = canvas.width;
    const height = canvas.height;
    const marginLeft = 50;
    const marginRight = 20;
    const marginTop = 30;
    const marginBottom = 40;
    const graphWidth = width - marginLeft - marginRight;
    let maxValue = Math.max(threshold, userIncome) * 1.2;
    // X axis
    ctx.beginPath();
    ctx.moveTo(marginLeft, height - marginBottom);
    ctx.lineTo(width - marginRight, height - marginBottom);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Ticks
    const numTicks = 5;
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= numTicks; i++) {
      const xPos = marginLeft + (i / numTicks) * graphWidth;
      const tickValue = (i / numTicks) * maxValue;
      ctx.beginPath();
      ctx.moveTo(xPos, height - marginBottom);
      ctx.lineTo(xPos, height - marginBottom + 5);
      ctx.stroke();
      ctx.fillText('£' + Math.round(tickValue).toLocaleString(), xPos, height - marginBottom + 8);
    }
    function valueToX(value: number) {
      return marginLeft + (value / maxValue) * graphWidth;
    }
    // Draw threshold line
    const thresholdX = valueToX(threshold);
    ctx.beginPath();
    ctx.moveTo(thresholdX, marginTop);
    ctx.lineTo(thresholdX, height - marginBottom);
    ctx.strokeStyle = 'red';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('Threshold: £' + threshold.toLocaleString(), thresholdX, marginTop - 20);
    // Draw user's income circle
    if (!isNaN(userIncome) && userIncome >= 0) {
      const userX = valueToX(userIncome);
      ctx.beginPath();
      ctx.arc(userX, height - marginBottom, 8, 0, Math.PI * 2);
      ctx.fillStyle = userIncome >= threshold ? 'green' : 'red';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('Your Income: £' + userIncome.toLocaleString(), userX, height - marginBottom + 15);
    }
  }

  // Redraw chart when inputs change
  useEffect(() => {
    if (
      monthlyRent !== '' && annualIncome !== '' && Number(monthlyRent) > 0 && Number(annualIncome) > 0
    ) {
      const rent = Number(monthlyRent);
      const income = Number(annualIncome);
      drawAffordabilityChart(rent * 30, income);
    } else {
      drawAffordabilityChart(null, null);
    }
    // eslint-disable-next-line
  }, [monthlyRent, annualIncome]);

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
                onChange={e => setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value))}
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
                onChange={e => setAnnualIncome(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                placeholder="Enter your annual income"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min={0}
                max={300000}
                step={100}
                value={annualIncome || 0}
                onChange={e => setAnnualIncome(Number(e.target.value))}
                className="w-full accent-green-700"
                aria-label="Income slider"
              />
              <span className="ml-2 text-xs text-muted-foreground">£{annualIncome || 0}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={calculateStandard} className="w-1/2">Calculate</Button>
              <Button variant="outline" onClick={resetStandard} className="w-1/2">Reset</Button>
            </div>
            {result && (
              <pre className="bg-muted p-4 rounded text-base mt-4 border border-green-200 dark:border-green-700 whitespace-pre-wrap text-green-700 dark:text-green-300">{result}</pre>
            )}
            {affordability && (
              <div className={`text-center font-semibold mt-2 ${affordability.includes('AFFORDABLE') ? 'text-green-600' : 'text-red-600'}`}>{affordability}</div>
            )}
            {maxRent && (
              <div className="text-center text-sm text-muted-foreground mt-1">{maxRent}</div>
            )}
            <canvas ref={canvasRef} width={500} height={220} className="mt-6 rounded border border-muted shadow" style={{background:'#fff',maxWidth:'100%'}} />
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
                onChange={e => setGrossIncome(e.target.value === '' ? '' : Number(e.target.value))}
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
                onChange={e => setEhePercent(e.target.value === '' ? '' : Number(e.target.value))}
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
                onChange={e => setCreditCommitments(e.target.value === '' ? '' : Number(e.target.value))}
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

export default RentalAffordabilityPage;
