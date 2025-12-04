"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Scale, AlertTriangle, Users, BookOpen, MessageSquare, Gavel, HeartHandshake, Brain, Zap, Skull } from "lucide-react";

interface Rule {
  title: string;
  description: string;
  example?: string;
  rule?: string;
}

const getIcon = (index: number) => {
  const icons = [
    Brain, // Logic RP
    Scale, // Reason RP
    Skull, // Mere RP
    Zap, // Gradation RP
    AlertTriangle, // Fail RP
    Gavel, // Force RP
    MessageSquare, // Interaction RP
    Users, // Involvement RP
    Shield, // Fear RP
    BookOpen, // Assuming RP
    BookOpen, // Lore RP
    AlertTriangle // Toxicity
  ];
  return icons[index] || Shield;
};

export default function RulesSection({ t }: { t: { serverRules: { title: string; subtitle: string; rules: Rule[] } } }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="rules" className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#081B2B] via-[#12181F] to-[#081B2B]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6">
              {t.serverRules.title}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              {t.serverRules.subtitle}
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {t.serverRules.rules.map((rule: Rule, index: number) => {
            const Icon = getIcon(index);
            return (
              <motion.div key={index} variants={item}>
                <Card className="h-full bg-[#12181F]/80 backdrop-blur-sm border-slate-800 hover:border-blue-500/50 transition-all duration-300 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="w-24 h-24 text-blue-400" />
                  </div>
                  
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <span className="text-blue-400 font-bold font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <CardTitle className="text-xl text-slate-100 group-hover:text-blue-400 transition-colors">
                        {rule.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 relative">
                    <p className="text-slate-400 leading-relaxed">
                      {rule.description}
                    </p>

                    {rule.example && (
                      <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                          <HeartHandshake className="w-4 h-4" />
                          Example
                        </div>
                        <p className="text-sm text-slate-300 italic">
                          &quot;{rule.example}&quot;
                        </p>
                      </div>
                    )}

                    {rule.rule && (
                      <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2 text-red-400 text-sm font-semibold uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          Rule
                        </div>
                        <p className="text-sm text-slate-300">
                          {rule.rule}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
