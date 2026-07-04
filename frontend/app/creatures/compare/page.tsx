"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitCompare, 
  ChevronLeft, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Globe, 
  HeartCrack,
  Info,
  Sparkles,
  Activity,
  Skull,
  BookOpen
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listCreatures, getCreatureDetail, type CreatureDetail, type ApiClientError } from "@/lib/api-client";

const SELECT_TRIGGER_CLASS =
  "w-full bg-zinc-900/60 border-zinc-800 text-zinc-300 font-mono text-xs h-12 px-4 pr-10 relative transition-all duration-200 hover:bg-zinc-800/60 hover:text-zinc-100 text-left rounded-xl focus:ring-1 focus:ring-amber-500/30";

const SELECT_CONTENT_CLASS =
  "bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs rounded-xl shadow-xl backdrop-blur-md max-h-[300px]";

const SELECT_ITEM_CLASS =
  "focus:bg-amber-500/10 focus:text-amber-400 text-zinc-400 cursor-pointer transition-colors py-2 rounded-lg font-mono text-xs";

function getDangerColor(level?: string): string {
  if (!level) return "text-zinc-400 border-zinc-700/50 bg-zinc-800/50";
  switch (level.toLowerCase()) {
    case "low":
      return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    case "medium":
      return "text-amber-400 border-amber-500/20 bg-amber-500/10";
    case "high":
      return "text-orange-400 border-orange-500/20 bg-orange-500/10";
    case "extreme":
      return "text-rose-400 border-rose-500/20 bg-rose-500/10";
    default:
      return "text-zinc-400 border-zinc-700/50 bg-zinc-800/50";
  }
}

function getDangerPercentage(level?: string): number {
  if (!level) return 0;
  switch (level.toLowerCase()) {
    case "low": return 25;
    case "medium": return 50;
    case "high": return 75;
    case "extreme": return 100;
    default: return 0;
  }
}

function CreatureSelector({ 
  label, 
  value, 
  onChange, 
  creatures 
}: { 
  label: string; 
  value: string | null; 
  onChange: (val: string | null) => void; 
  creatures: Array<{ slug: string; name: string }> 
}) {
  return (
    <div className="w-full space-y-2">
      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={SELECT_TRIGGER_CLASS}>
          <span className="truncate">
            {value === "none" ? "Select a creature..." : creatures.find(c => c.slug === value)?.name || value}
          </span>
        </SelectTrigger>
        <SelectContent className={SELECT_CONTENT_CLASS}>
          <SelectItem value="none" className={SELECT_ITEM_CLASS}>Select a creature...</SelectItem>
          {creatures.map((c) => (
            <SelectItem key={c.slug} value={c.slug} className={SELECT_ITEM_CLASS}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CreatureColumn({ 
  creature, 
  isLoading, 
  placeholderText 
}: { 
  creature?: CreatureDetail; 
  isLoading: boolean; 
  placeholderText: string 
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-6 space-y-4">
          <Skeleton className="h-6 w-1/3 bg-zinc-800" />
          <Skeleton className="h-4 w-1/4 bg-zinc-800" />
          <Skeleton className="h-16 w-full bg-zinc-800" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl bg-zinc-900/10" />
        <Skeleton className="h-48 w-full rounded-2xl bg-zinc-900/10" />
      </div>
    );
  }

  if (!creature) {
    return (
      <div className="h-[400px] border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-zinc-900/5 backdrop-blur-sm">
        <Skull className="w-8 h-8 text-zinc-700 mb-3" />
        <p className="text-sm font-mono text-zinc-500">{placeholderText}</p>
      </div>
    );
  }

  const dangerPercent = getDangerPercentage(creature.dangerLevel);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Identity Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br from-violet-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />
        
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded-full">
              {creature.classification.primaryType || "Creature"}
            </Badge>
            {creature.classification.subTypes.map((sub) => (
              <Badge key={sub} variant="outline" className="border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono text-[9px] px-2 py-0.5 rounded-full">
                {sub}
              </Badge>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">{creature.name}</h2>
          <span className="text-zinc-500 text-xs font-mono block mt-1">{creature.tradition} Tradition</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-4 bg-zinc-950/30 border border-zinc-900 p-3 rounded-lg">
          {creature.summary || "No lore summary has been detailed for this creature yet."}
        </p>
      </div>

      {/* Threat Meter */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Threat Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">Threat Class:</span>
            <span className={`font-semibold ${getDangerColor(creature.dangerLevel)} bg-transparent border-0 px-0`}>
              {creature.dangerLevel}
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
            <div 
              className={`h-full transition-all duration-500 ${
                creature.dangerLevel.toLowerCase() === "low" ? "bg-emerald-500" :
                creature.dangerLevel.toLowerCase() === "medium" ? "bg-amber-500" :
                creature.dangerLevel.toLowerCase() === "high" ? "bg-orange-500" : "bg-rose-500"
              }`} 
              style={{ width: `${dangerPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Habitats */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
          <Globe className="w-4 h-4 text-emerald-400" />
          <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Territories & Habitats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {creature.habitats.length > 0 ? (
              creature.habitats.map((hab) => (
                <span key={hab} className="text-[10px] font-mono px-2.5 py-0.5 bg-zinc-950 border border-zinc-800/70 text-zinc-300 rounded-md">
                  {hab}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-600 font-mono">No specific habitats recorded.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Abilities */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
          <Zap className="w-4 h-4 text-violet-400" />
          <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Powers & Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {creature.abilities.length > 0 ? (
            creature.abilities.map((ab, idx) => (
              <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-lg space-y-1">
                <strong className="text-xs font-semibold text-zinc-200 font-mono block">{ab.name}</strong>
                <p className="text-[11px] text-zinc-400 leading-normal font-sans">{ab.description}</p>
              </div>
            ))
          ) : (
            <span className="text-xs text-zinc-600 font-mono">No special abilities logged.</span>
          )}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
          <HeartCrack className="w-4 h-4 text-rose-400" />
          <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {creature.weaknesses.length > 0 ? (
            creature.weaknesses.map((wk, idx) => (
              <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-lg flex items-center justify-between">
                <strong className="text-xs font-medium text-zinc-200 font-mono">{wk.name}</strong>
                <span className="text-[9px] text-zinc-500 font-mono uppercase bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded">
                  {wk.type || "General"}
                </span>
              </div>
            ))
          ) : (
            <span className="text-xs text-zinc-600 font-mono">No known vulnerabilities recorded.</span>
          )}
        </CardContent>
      </Card>

      {/* Traits */}
      <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
          <Info className="w-4 h-4 text-amber-400" />
          <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Traits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {creature.traits.length > 0 ? (
              creature.traits.map((trait, idx) => (
                <li key={idx} className="text-xs text-zinc-300 font-sans flex items-start gap-2">
                  <span className="text-amber-500 font-mono select-none">•</span>
                  <span>{trait}</span>
                </li>
              ))
            ) : (
              <span className="text-xs text-zinc-600 font-mono">No traits mapped.</span>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CompareInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected slugs states
  const [creatureASlug, setCreatureASlug] = useState<string>("none");
  const [creatureBSlug, setCreatureBSlug] = useState<string>("none");

  // Sync state from query params on mount
  useEffect(() => {
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    if (a) setCreatureASlug(a);
    if (b) setCreatureBSlug(b);
  }, [searchParams]);

  // Update query params when slugs change
  const handleSelectA = (slug: string | null) => {
    const val = slug ?? "none";
    setCreatureASlug(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === "none") params.delete("a");
    else params.set("a", val);
    router.replace(`/creatures/compare?${params.toString()}`);
  };

  const handleSelectB = (slug: string | null) => {
    const val = slug ?? "none";
    setCreatureBSlug(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === "none") params.delete("b");
    else params.set("b", val);
    router.replace(`/creatures/compare?${params.toString()}`);
  };

  // Query list of all creatures for dropdowns
  const listQuery = useQuery({
    queryKey: ["creatures-all-for-compare"],
    queryFn: () => listCreatures({ pageSize: 100 }),
  });

  const allCreatures = listQuery.data?.items ?? [];

  // Query details of A
  const queryA = useQuery<CreatureDetail, ApiClientError>({
    queryKey: ["creature-detail-compare-a", creatureASlug],
    queryFn: () => getCreatureDetail(creatureASlug),
    enabled: creatureASlug !== "none",
  });

  // Query details of B
  const queryB = useQuery<CreatureDetail, ApiClientError>({
    queryKey: ["creature-detail-compare-b", creatureBSlug],
    queryFn: () => getCreatureDetail(creatureBSlug),
    enabled: creatureBSlug !== "none",
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden pb-20">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/creatures" className="text-xs text-zinc-500 hover:text-amber-500 transition-colors font-mono flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to CreatureDex
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-800/80 pb-8 mb-10">
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs tracking-widest uppercase mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Comparative Lore Analysis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Creature Comparison
          </h1>
          <p className="mt-2 text-xs text-zinc-400 max-w-xl font-sans leading-relaxed">
            Choose two legendary creatures to evaluate their mythological traits, danger evaluations, and abilities side-by-side.
          </p>
        </div>

        {/* Selectors Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/25 border border-zinc-800/60 p-6 rounded-2xl backdrop-blur-md mb-10">
          <CreatureSelector 
            label="Supernatural Subject Alpha" 
            value={creatureASlug} 
            onChange={handleSelectA} 
            creatures={allCreatures} 
          />
          <CreatureSelector 
            label="Supernatural Subject Beta" 
            value={creatureBSlug} 
            onChange={handleSelectB} 
            creatures={allCreatures} 
          />
        </div>

        {/* Side-by-side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <AnimatePresence mode="wait">
            <CreatureColumn 
              key={creatureASlug}
              creature={queryA.data} 
              isLoading={queryA.isLoading} 
              placeholderText="Select Creature Alpha to begin comparisons" 
            />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <CreatureColumn 
              key={creatureBSlug}
              creature={queryB.data} 
              isLoading={queryB.isLoading} 
              placeholderText="Select Creature Beta to begin comparisons" 
            />
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}

export default function CreatureComparePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-mono text-xs">
        <div className="space-y-2 text-center">
          <Sparkles className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
          <p className="text-zinc-400">Loading Comparative Matrix...</p>
        </div>
      </main>
    }>
      <CompareInner />
    </Suspense>
  );
}
