'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { AnswerTheAIOutput } from "@/ai/flows/answer-the-ai-flow";
import { Users, HelpCircle, Calendar, MapPin, Wrench, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

interface AnswerTheAiClientProps {
  data: AnswerTheAIOutput;
}

const categoryInfo = {
    who: { icon: Users, label: "Who", description: "Exploring the people, groups, and entities involved or affected." },
    what: { icon: HelpCircle, label: "What", description: "Detailing the events, concepts, and key information." },
    when: { icon: Calendar, label: "When", description: "Investigating the timeline, history, and future implications." },
    where: { icon: MapPin, label: "Where", description: "Focusing on the locations and geographical significance." },
    how: { icon: Wrench, label: "How", description: "Understanding the processes, mechanisms, and reasons behind the trends." },
};

type CategoryKey = keyof typeof categoryInfo;

export function AnswerTheAiClient({ data }: AnswerTheAiClientProps) {
  return (
    <section className="animate-fadeIn">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary h-7 w-7" />
            Answer the AI: Content Angles
          </CardTitle>
          <CardDescription>
            Use these AI-generated questions as a starting point for creating in-depth articles, videos, or social media posts based on the discovered trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['who', 'what']} className="w-full">
              {(Object.keys(data) as CategoryKey[]).map((key) => {
                const info = categoryInfo[key];
                const questions = data[key];
                if (!info || !questions || questions.length === 0) return null;
                const Icon = info.icon;
                return (
                  <AccordionItem value={key} key={key}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 text-primary/80" />
                            {info.label}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground pb-4">{info.description}</p>
                      <ul className="space-y-2 list-disc pl-5">
                          {questions.map((question, index) => (
                              <li key={index} className="text-base text-foreground">
                                  {question}
                              </li>
                          ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
