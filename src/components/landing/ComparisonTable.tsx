
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, HelpCircle } from "lucide-react";

const features = [
  {
    category: 'Core AI Capability',
    items: [
      { feature: 'Basic Content Generation', writers: true, trendsetter: true, toolkits: false },
      { feature: 'E-E-A-T Aligned Content', writers: false, trendsetter: true, toolkits: false },
      { feature: 'AI-Powered Trend Discovery', writers: false, trendsetter: true, toolkits: true },
      { feature: 'Competitor Content Analysis', writers: false, trendsetter: true, toolkits: true },
    ]
  },
  {
    category: 'Workflow & Strategy',
    items: [
      { feature: 'Integrated Workflow (Ideation to Publishing)', writers: false, trendsetter: true, toolkits: false },
      { feature: 'Topic Cluster & Keyword Strategy Generation', writers: false, trendsetter: true, toolkits: true },
      { feature: 'AI-Generated Content Angles ("Answer the AI")', writers: false, trendsetter: true, toolkits: false },
      { feature: '1-Click WordPress Publishing', writers: false, trendsetter: true, toolkits: false },
    ]
  },
  {
    category: 'The Competitive Moat',
    items: [
      { feature: 'AI-Powered Video Generation', writers: false, trendsetter: true, toolkits: false },
      { feature: 'Performance-Driven AI Audits & Recommendations', writers: false, trendsetter: true, toolkits: false },
      { feature: 'Personalized Suggestions Based on Your Results', writers: false, trendsetter: true, toolkits: false },
      { feature: 'Automated Social Media Post Generation', writers: 'partial', trendsetter: true, toolkits: false },
      { feature: 'AI Humanizer & Tone Analysis', writers: 'partial', trendsetter: true, toolkits: false },
    ]
  }
];

const renderCheckmark = (value: boolean | string) => {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-5 w-5 text-red-500 mx-auto" />;
  }
  return <HelpCircle className="h-5 w-5 text-yellow-500 mx-auto" />; // For 'partial'
};

export function ComparisonTable() {
  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Feature-by-Feature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] text-lg">Feature</TableHead>
              <TableHead className="text-center text-lg">Generic AI Writers</TableHead>
              <TableHead className="text-center text-lg text-primary border-x-2 border-primary/50 bg-primary/5">Trendsetter Pro</TableHead>
              <TableHead className="text-center text-lg">SEO Toolkits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((cat, catIndex) => (
              <React.Fragment key={cat.category}>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold text-foreground text-md">{cat.category}</TableCell>
                </TableRow>
                {cat.items.map((item) => (
                  <TableRow key={item.feature}>
                    <TableCell className="font-medium text-muted-foreground">{item.feature}</TableCell>
                    <TableCell className="text-center">{renderCheckmark(item.writers)}</TableCell>
                    <TableCell className="text-center bg-primary/5">{renderCheckmark(item.trendsetter)}</TableCell>
                    <TableCell className="text-center">{renderCheckmark(item.toolkits)}</TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
         <div className="mt-4 text-xs text-muted-foreground flex items-center gap-4">
            <div className="flex items-center gap-1"><HelpCircle className="h-4 w-4 text-yellow-500"/>= Partial or limited functionality</div>
        </div>
      </CardContent>
    </Card>
  );
}
