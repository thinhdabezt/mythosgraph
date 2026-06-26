"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  MapPin, 
  Sparkles, 
  Database, 
  Network,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getTraditionDetail, 
  type TraditionDetail, 
  type ApiClientError 
} from "@/lib/api-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getEntityBadgeClass(type: string): string {
  switch (type) {
    case "God":
    case "Goddess":
      return "border-violet-500/20 bg-violet-500/10 text-violet-400";
    case "Creature":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "Artifact":
    case "Weapon":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    default:
      return "border-zinc-700/50 bg-zinc-800/50 text-zinc-400";
  }
}

export default function TraditionDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  const query = useQuery<TraditionDetail, ApiClientError>({
    queryKey: ["tradition-detail", slug],
    queryFn: () => getTraditionDetail(slug),
  });

  const tradition = query.data;

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-8 space-y-4">
            <Skeleton className="h-4 w-28 bg-zinc-800" />
            <Skeleton className="h-10 w-72 bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl bg-zinc-900/10" />
            <Skeleton className="h-96 rounded-2xl bg-zinc-900/10" />
          </div>
        </div>
      </main>
    );
  }

  if (!tradition) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-20 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center rounded-2xl border border-zinc-850 bg-zinc-900/20 p-8 backdrop-blur-md">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-mono font-bold text-zinc-50">Tradition Not Found</h1>
          <p className="mt-2 text-zinc-400 text-xs font-sans leading-relaxed">
            No cultural tradition was found mapped to the slug <strong className="font-mono text-zinc-200">"{slug}"</strong>.
          </p>
          <Link href="/traditions" className="mt-6 inline-flex font-mono text-xs text-amber-500 hover:text-amber-400 transition-colors">
            &lt;- Back to Traditions
          </Link>
        </div>
      </main>
    );
  }

  // Calculate percentages for statistics
  const totalCount = tradition.entityCount;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden pb-20">
      {/* Background Gradient */}
      <div className="absolute top-[-10%] right-[10%] w-[50%] h-[50%] bg-amber-500/3 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/traditions" className="text-xs text-zinc-500 hover:text-amber-500 transition-colors font-mono">
            &lt;- Back to Traditions
          </Link>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/10 p-8 md:p-10 mb-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3 text-amber-500 font-mono text-xs tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mythos Tradition</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100">
                {tradition.name}
              </h1>
              {tradition.region && (
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono mt-2.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Region: {tradition.region}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 border-l border-zinc-800 pl-6 h-14">
              <div className="text-center">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-200 block leading-none">
                  {totalCount}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Entities</span>
              </div>
            </div>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed max-w-4xl font-sans bg-zinc-950/20 border border-zinc-900/50 p-5 rounded-2xl">
            {tradition.description || "No full description has been written for this mythology system yet."}
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Featured Entities Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-3xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Featured Entities</CardTitle>
                </div>
                <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-[9px] rounded-full px-2 py-0.5">
                  Codex Sample
                </Badge>
              </CardHeader>
              <CardContent className="divide-y divide-zinc-900/80">
                {tradition.featuredEntities.length > 0 ? (
                  tradition.featuredEntities.map((entity) => {
                    const isCreature = entity.entityType.toLowerCase() === "creature";
                    const linkUrl = isCreature ? `/creatures/${entity.slug}` : `/entities/${entity.slug}`;

                    return (
                      <div 
                        key={entity.slug} 
                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group"
                      >
                        <div className="space-y-1">
                          <Link 
                            href={linkUrl}
                            className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors font-mono"
                          >
                            {entity.name}
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-mono">slug: {entity.slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${getEntityBadgeClass(entity.entityType)}`}>
                            {entity.entityType}
                          </Badge>
                          <Link href={linkUrl}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-500 group-hover:text-amber-400 group-hover:border-amber-500/20 transition-all"
                            >
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-zinc-600 font-mono block py-4">No entities mapped to this tradition in the database.</span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Statistics) */}
          <div className="space-y-6">
            
            {/* Entity Types breakdown */}
            <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-3xl">
              <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                <Database className="w-4 h-4 text-violet-400" />
                <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Classification Density</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tradition.mainEntityTypes.length > 0 ? (
                  tradition.mainEntityTypes.map((type) => {
                    const percentage = totalCount > 0 ? Math.round((type.value / totalCount) * 100) : 0;
                    
                    return (
                      <div key={type.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-300 font-semibold">{type.key}</span>
                          <span className="text-zinc-500">{type.value} ({percentage}%)</span>
                        </div>
                        {/* Progressive Bar */}
                        <div className="h-1.5 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-zinc-600 font-mono">No classification statistics recorded.</span>
                )}
              </CardContent>
            </Card>

            {/* Geographical Influence */}
            {tradition.relatedRegions.length > 0 && (
              <Card className="bg-zinc-900/10 border-zinc-800/80 rounded-3xl">
                <CardHeader className="pb-3 flex flex-row items-center gap-2 space-y-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <CardTitle className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Geographic Zones</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {tradition.relatedRegions.map((region) => (
                    <span key={region} className="text-xs font-mono px-3 py-1.5 bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-xl">
                      {region}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}