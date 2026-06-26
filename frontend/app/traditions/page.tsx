"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, MapPin, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listTraditions, type TraditionListItem, type ApiClientError } from "@/lib/api-client";

// Premium gradients for traditions
const GRADIENTS = [
  "from-amber-600/20 via-orange-600/5 to-transparent",
  "from-violet-600/20 via-purple-600/5 to-transparent",
  "from-emerald-600/20 via-teal-600/5 to-transparent",
  "from-rose-600/20 via-pink-600/5 to-transparent",
];

const CARD_GLOWS = [
  "hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] hover:border-amber-500/30",
  "hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] hover:border-violet-500/30",
  "hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:border-emerald-500/30",
  "hover:shadow-[0_0_30px_rgba(244,63,94,0.05)] hover:border-rose-500/30",
];

const ACCENTS = [
  "text-amber-400 border-amber-500/20 bg-amber-500/10",
  "text-violet-400 border-violet-500/20 bg-violet-500/10",
  "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "text-rose-400 border-rose-500/20 bg-rose-500/10",
];

export default function TraditionsPage() {
  const query = useQuery<{ data: TraditionListItem[] }, ApiClientError>({
    queryKey: ["traditions"],
    queryFn: () => listTraditions(),
  });

  const traditions = query.data?.data ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden pb-20">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/3 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/3 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mythological Systems</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Cultural Traditions
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-sans">
            Step into the sacred lineages and complex cosmologies of legendary cultures. Inspect gods, mortal heroes, monsters, and sacred relics cataloged by their mythic tradition.
          </p>
        </div>

        {/* Loading Shell */}
        {query.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-zinc-800 bg-zinc-900/10 rounded-3xl p-8 space-y-4">
                <Skeleton className="h-6 w-1/3 bg-zinc-800" />
                <Skeleton className="h-4 w-1/4 bg-zinc-800" />
                <Skeleton className="h-24 w-full bg-zinc-850" />
                <Skeleton className="h-10 w-24 bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : traditions.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-zinc-850 rounded-3xl">
            <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-zinc-300">No Traditions Indexed</h3>
            <p className="text-zinc-500 text-xs mt-2">
              There are currently no cultural traditions seeded in the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {traditions.map((tradition, index) => {
              const gradient = GRADIENTS[index % GRADIENTS.length];
              const glow = CARD_GLOWS[index % CARD_GLOWS.length];
              const accent = ACCENTS[index % ACCENTS.length];

              return (
                <motion.div
                  key={tradition.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`group relative rounded-3xl border border-zinc-800/80 bg-zinc-950/40 ${glow} transition-all duration-300 overflow-hidden flex flex-col justify-between`}
                >
                  {/* Decorative Banner Gradient */}
                  <div className={`absolute top-0 left-0 right-0 h-[140px] bg-gradient-to-b ${gradient} pointer-events-none z-0`} />
                  
                  <div className="p-8 relative z-10 space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-mono border uppercase tracking-wider rounded-full px-2.5 py-0.5 ${accent}`}>
                          Tradition
                        </span>
                        {tradition.region && (
                          <div className="flex items-center gap-1 text-zinc-500 text-xs font-mono">
                            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                            <span>{tradition.region}</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold tracking-tight text-zinc-100 group-hover:text-amber-400 transition-colors duration-300">
                        {tradition.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans min-h-[72px] line-clamp-3">
                      {tradition.description || "Explore legends, gods, and folktales connected with this cultural tradition."}
                    </p>
                  </div>

                  {/* Action Footer */}
                  <div className="px-8 pb-8 relative z-10 pt-2 flex items-center justify-between border-t border-zinc-900/50 mt-auto bg-zinc-950/20">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Slug: {tradition.slug}
                    </span>
                    <Link href={`/traditions/${tradition.slug}`}>
                      <Button
                        variant="ghost"
                        className="text-xs text-zinc-400 group-hover:text-amber-400 hover:bg-transparent font-mono flex items-center gap-1.5 p-0"
                      >
                        Enter Codex
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
