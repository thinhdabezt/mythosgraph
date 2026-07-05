"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  Skull, 
  Compass, 
  Activity, 
  Info, 
  Flame, 
  Zap, 
  HeartCrack,
  Network,
  GitCompare
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getCreatureDetail, 
  getRelatedCreatures, 
  explainEntity, 
  type CreatureDetail,
  type RelatedCreaturesResponse,
  type EntityExplainResponse,
  type ApiClientError 
} from "@/lib/api-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getDangerColor(level: string): string {
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

export default function CreatureDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  // Queries
  const detailQuery = useQuery<CreatureDetail, ApiClientError>({
    queryKey: ["creature-detail", slug],
    queryFn: () => getCreatureDetail(slug),
  });

  const relatedQuery = useQuery<RelatedCreaturesResponse, ApiClientError>({
    queryKey: ["creature-related", slug],
    queryFn: () => getRelatedCreatures(slug),
  });

  const explainQuery = useQuery<EntityExplainResponse, ApiClientError>({
    queryKey: ["creature-explain", slug],
    queryFn: () => explainEntity(slug),
  });

  const creature = detailQuery.data;
  const related = relatedQuery.data?.relatedCreatures ?? [];
  const explanation = explainQuery.data;

  const isLoading = detailQuery.isLoading || relatedQuery.isLoading || explainQuery.isLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-8 space-y-4">
            <Skeleton className="h-4 w-28 bg-zinc-800" />
            <Skeleton className="h-10 w-72 bg-zinc-800" />
            <Skeleton className="h-6 w-96 bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl bg-zinc-900/10 border border-zinc-850" />
            <Skeleton className="h-96 rounded-2xl bg-zinc-900/10 border border-zinc-850" />
          </div>
        </div>
      </main>
    );
  }

  if (!creature) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-20 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-md">
          <Skull className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-mono font-bold text-zinc-50">Creature Not Found</h1>
          <p className="mt-2 text-zinc-400 text-xs font-sans leading-relaxed">
            No supernatural entity was found mapped to the slug <strong className="font-mono text-zinc-200">"{slug}"</strong>.
          </p>
          <Link href="/creatures" className="mt-6 inline-flex font-mono text-xs text-amber-500 hover:text-amber-400 transition-colors">
            &lt;- Back to CreatureDex
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden pb-20">
      {/* Glow Effect */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-violet-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/creatures" className="text-xs text-zinc-500 hover:text-amber-500 transition-colors font-mono">
            &lt;- Back to CreatureDex
          </Link>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/20 p-8 md:p-10 mb-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-violet-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400 font-mono text-[10px] uppercase px-2 py-0.5 rounded-full">
                  {creature.classification.primaryType || "Creature"}
                </Badge>
                {creature.classification.subTypes.map((sub) => (
                  <Badge key={sub} variant="outline" className="border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono text-[10px] px-2 py-0.5 rounded-full">
                    {sub}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100">
                {creature.name}
              </h1>
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono mt-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{creature.tradition} Tradition</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="outline" className={`${getDangerColor(creature.dangerLevel)} font-mono text-xs px-3 py-1 rounded-full border`}>
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5 inline" />
                {creature.dangerLevel} Threat Level
              </Badge>
              <Link href={`/creatures/compare?a=${creature.slug}`}>
                <Button variant="outline" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 font-mono text-[10px] h-8 hover:bg-zinc-800/50 hover:text-zinc-100 mt-1">
                  <GitCompare className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Compare Lore
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed max-w-4xl font-sans bg-zinc-950/30 border border-zinc-900 p-4 rounded-xl">
            {creature.summary || "No lore summary has been detailed for this creature yet."}
          </p>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns (Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-zinc-900/60 border border-zinc-800 p-1 rounded-xl h-11 w-full justify-start gap-1">
                <TabsTrigger value="overview" className="font-mono text-xs text-zinc-400 focus:text-zinc-100 data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400 rounded-lg px-4 h-9">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="explain" className="font-mono text-xs text-zinc-400 focus:text-zinc-100 data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400 rounded-lg px-4 h-9">
                  Explain Linkages
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                
                {/* Habitats & Traits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Habitats */}
                  <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
                    <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Known Habitats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {creature.habitats.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {creature.habitats.map((hab) => (
                            <span key={hab} className="text-xs font-mono px-3 py-1 bg-zinc-950 border border-zinc-800/70 text-zinc-300 rounded-lg">
                              {hab}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 font-mono">No habitat records available.</span>
                      )}
                    </CardContent>
                  </Card>

                  {/* Traits */}
                  <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
                    <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                      <Info className="w-4 h-4 text-amber-400" />
                      <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Distinguishing Traits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {creature.traits.length > 0 ? (
                        <ul className="space-y-2">
                          {creature.traits.map((trait, idx) => (
                            <li key={idx} className="text-xs text-zinc-300 font-sans flex items-start gap-2">
                              <span className="text-amber-500 font-mono select-none mt-0.5">•</span>
                              <span>{trait}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-zinc-600 font-mono">No traits mapped.</span>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Abilities */}
                <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Powers & Abilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {creature.abilities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creature.abilities.map((ab, idx) => (
                          <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-1.5">
                            <strong className="text-sm font-semibold text-zinc-200 font-mono block">
                              {ab.name}
                            </strong>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                              {ab.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 font-mono block py-2">No supernatural abilities logged in the codex.</span>
                    )}
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
                  <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                    <HeartCrack className="w-4 h-4 text-rose-400" />
                    <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Vulnerabilities & Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {creature.weaknesses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creature.weaknesses.map((wk, idx) => (
                          <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <strong className="text-sm font-medium text-zinc-200 font-mono block">{wk.name}</strong>
                              <span className="text-[10px] text-zinc-500 font-mono uppercase">Type: {wk.type || "General"}</span>
                            </div>
                            <Flame className="w-4 h-4 text-rose-500/40 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 font-mono">No vulnerability records exist.</span>
                    )}
                  </CardContent>
                </Card>

              </TabsContent>

              {/* Explain linkages Tab */}
              <TabsContent value="explain" className="mt-6">
                <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-amber-500" />
                      <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Structured Lore Narrative</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-[9px]">
                      Relation-driven
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {explanation && explanation.explanation.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {explanation.explanation.map((sentence, idx) => (
                            <p key={idx} className="text-sm text-zinc-300 font-sans leading-relaxed pl-4 border-l-2 border-amber-500/30 py-0.5">
                              {sentence}
                            </p>
                          ))}
                        </div>

                        {/* Raw links */}
                        <div className="pt-6 border-t border-zinc-900 space-y-3">
                          <strong className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Generated Path Triplets</strong>
                          <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-1.5 overflow-x-auto">
                            {explanation.generatedFromRelations.map((triplet, idx) => (
                              <div key={idx} className="whitespace-nowrap">
                                <span className="text-zinc-600 select-none">[{idx + 1}] </span>
                                {triplet}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-600 font-mono">This entity does not have enough active graph relations to explain.</span>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar (Relations & Similar) */}
          <div className="space-y-6">
            
            {/* Direct Connections / Relations */}
            <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
              <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                <Network className="w-4 h-4 text-violet-400" />
                <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Linked Graph Entities</CardTitle>
              </CardHeader>
              <CardContent>
                {creature.relations.length > 0 ? (
                  <div className="space-y-2">
                    {creature.relations.map((rel, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl"
                      >
                        <Link 
                          href={`/entities/${rel.targetSlug}`}
                          className="text-xs text-zinc-300 font-mono hover:text-amber-400 transition-colors"
                        >
                          {rel.targetSlug}
                        </Link>
                        <span className="text-[9px] font-mono text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">
                          {rel.relationType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-600 font-mono">This creature is currently isolated in the knowledge graph.</span>
                )}
              </CardContent>
            </Card>

            {/* Related Creatures */}
            <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-2xl">
              <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                <Compass className="w-4 h-4 text-emerald-400" />
                <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Similar Creatures</CardTitle>
              </CardHeader>
              <CardContent>
                {related.length > 0 ? (
                  <div className="space-y-3">
                    {related.map((item) => (
                      <div 
                        key={item.slug} 
                        className="bg-zinc-950/40 border border-zinc-900/80 hover:border-zinc-800/80 transition-all p-4 rounded-xl space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/creatures/${item.slug}`}
                            className="text-xs font-bold text-zinc-300 group-hover:text-amber-400 transition-colors font-mono block"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.relation}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-600 font-mono">No similar creatures cataloged.</span>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </main>
  );
}