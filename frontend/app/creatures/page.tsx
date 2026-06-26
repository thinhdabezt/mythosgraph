"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  ShieldAlert, 
  Compass, 
  Skull, 
  FilterX, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Waves,
  Trees
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listCreatures, type CreaturesListResponse, type ApiClientError } from "@/lib/api-client";

const PAGE_SIZE = 6;

const DANGER_LEVELS = ["Low", "Medium", "High", "Extreme"];
const HABITATS = ["River", "Pond", "Swamp", "Sea", "Ocean", "Forest", "Mountain", "Cave", "Underworld"];
const TRADITIONS = [
  { value: "vietnamese-folklore", label: "Vietnamese Folklore" },
  { value: "greek-mythology", label: "Greek Mythology" },
  { value: "norse-mythology", label: "Norse Mythology" },
];

const SELECT_TRIGGER_CLASS =
  "w-full bg-zinc-900/50 border-zinc-800 text-zinc-300 font-mono text-xs h-10 px-3 pr-8 relative transition-all duration-200 hover:bg-zinc-800/50 hover:text-zinc-100 text-left rounded-lg focus:ring-1 focus:ring-amber-500/30";

const SELECT_CONTENT_CLASS =
  "bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs rounded-lg shadow-xl backdrop-blur-md min-w-[165px]";

const SELECT_ITEM_CLASS =
  "focus:bg-amber-500/10 focus:text-amber-400 text-zinc-400 cursor-pointer transition-colors py-2 rounded-md font-mono text-xs";

function getDangerBadgeClass(level: string): string {
  switch (level.toLowerCase()) {
    case "low":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "medium":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "high":
      return "border-orange-500/20 bg-orange-500/10 text-orange-400";
    case "extreme":
      return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    default:
      return "border-zinc-700/50 bg-zinc-800/50 text-zinc-400";
  }
}

export default function CreaturesPage() {
  const [search, setSearch] = useState("");
  const [tradition, setTradition] = useState<string>("all");
  const [dangerLevel, setDangerLevel] = useState<string>("all");
  const [habitat, setHabitat] = useState<string>("all");
  const [page, setPage] = useState(1);

  const query = useQuery<CreaturesListResponse, ApiClientError>({
    queryKey: [
      "creatures",
      search,
      tradition,
      dangerLevel,
      habitat,
      page,
    ],
    queryFn: () =>
      listCreatures({
        domain: search ? search : undefined, // search by keyword in domains/summary
        tradition: tradition !== "all" ? tradition : undefined,
        dangerLevel: dangerLevel !== "all" ? dangerLevel : undefined,
        habitat: habitat !== "all" ? habitat : undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: (previousData) => previousData,
  });

  const creatures = query.data?.items ?? [];
  const totalItems = query.data?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const hasActiveFilters =
    search.trim().length > 0 ||
    tradition !== "all" ||
    dangerLevel !== "all" ||
    habitat !== "all" ||
    page !== 1;

  const resetFilters = () => {
    setSearch("");
    setTradition("all");
    setDangerLevel("all");
    setHabitat("all");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-zinc-800/80 pb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-mono text-xs tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CreatureDex Codex</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Supernatural Entities
            </h1>
            <p className="mt-3 text-sm text-zinc-400 max-w-xl font-sans leading-relaxed">
              Explore monsters, spirits, ghosts, and mythical beasts indexed from ancient oral traditions and classical texts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/graph-explorer">
              <Button variant="outline" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 font-mono text-xs h-10 hover:bg-zinc-800/50 hover:text-zinc-100">
                <Compass className="w-4 h-4 mr-2" />
                Inspect Graph
              </Button>
            </Link>
          </div>
        </div>

        {/* Toolbar / Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by traits or habitats (e.g. River, Drowning)..."
              className="pl-10 h-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 font-mono text-xs focus-visible:ring-1 focus-visible:ring-amber-500/30 rounded-lg placeholder-zinc-500 w-full"
            />
          </div>

          {/* Tradition Filter */}
          <Select value={tradition} onValueChange={(val) => { setTradition(val ?? "all"); setPage(1); }}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <span className="truncate">
                {tradition === "all" ? "All Traditions" : TRADITIONS.find(t => t.value === tradition)?.label}
              </span>
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="all" className={SELECT_ITEM_CLASS}>All Traditions</SelectItem>
              {TRADITIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className={SELECT_ITEM_CLASS}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Danger Level Filter */}
          <Select value={dangerLevel} onValueChange={(val) => { setDangerLevel(val ?? "all"); setPage(1); }}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <span className="truncate">
                {dangerLevel === "all" ? "All Danger Levels" : `${dangerLevel} Danger`}
              </span>
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="all" className={SELECT_ITEM_CLASS}>All Danger Levels</SelectItem>
              {DANGER_LEVELS.map((level) => (
                <SelectItem key={level} value={level} className={SELECT_ITEM_CLASS}>
                  {level} Danger
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Habitat Filter */}
          <Select value={habitat} onValueChange={(val) => { setHabitat(val ?? "all"); setPage(1); }}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <span className="truncate">
                {habitat === "all" ? "All Habitats" : `${habitat} Habitat`}
              </span>
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="all" className={SELECT_ITEM_CLASS}>All Habitats</SelectItem>
              {HABITATS.map((hab) => (
                <SelectItem key={hab} value={hab} className={SELECT_ITEM_CLASS}>
                  {hab}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-6 bg-zinc-900/10 border border-zinc-800/30 px-4 py-2 rounded-lg">
            <span className="text-xs text-zinc-400 font-mono">
              Found <strong className="text-zinc-200">{totalItems}</strong> entities matching filters
            </span>
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-xs text-amber-500 font-mono hover:text-amber-400 hover:bg-transparent h-auto p-0 flex items-center gap-1.5"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        )}

        {/* Content Section */}
        {query.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-zinc-800 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
                <Skeleton className="h-6 w-2/3 bg-zinc-800" />
                <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                <Skeleton className="h-20 w-full bg-zinc-800" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 bg-zinc-800 rounded-full" />
                  <Skeleton className="h-5 w-16 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : creatures.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-zinc-800/60 rounded-2xl">
            <Skull className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-zinc-300">No Supernatural Entities Found</h3>
            <p className="text-zinc-500 text-xs mt-2 max-w-sm mx-auto">
              We couldn't find any creatures matching your filters. Try adjusting search queries or resetting filters.
            </p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-6 border-zinc-800 bg-zinc-900/40 text-zinc-400 font-mono text-xs hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              <AnimatePresence mode="popLayout">
                {creatures.map((creature) => (
                  <motion.div
                    key={creature.slug}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="group border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/30 hover:border-zinc-700/80 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between hover:shadow-[0_0_25px_rgba(245,158,11,0.02)] backdrop-blur-sm relative"
                  >
                    <div>
                      {/* Badge / Metadata header */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="border-violet-500/20 bg-violet-500/10 text-violet-400 font-mono text-[10px] rounded-full uppercase px-2 py-0.5">
                          {creature.classification.primaryType || "Creature"}
                        </Badge>
                        <Badge variant="outline" className={`${getDangerBadgeClass(creature.dangerLevel)} font-mono text-[10px] rounded-full px-2 py-0.5`}>
                          {creature.dangerLevel} Danger
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-amber-400 transition-colors duration-200">
                        {creature.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono mt-1.5 mb-4">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{creature.tradition}</span>
                      </div>

                      {/* Summary */}
                      <p className="text-zinc-400 text-xs leading-relaxed font-sans line-clamp-3">
                        {creature.summary || "No summary available for this supernatural entity."}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-4">
                      {/* Habitats */}
                      {creature.habitats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {creature.habitats.slice(0, 3).map((hab) => (
                            <span 
                              key={hab} 
                              className="text-[9px] font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-800/80 text-zinc-400 rounded"
                            >
                              {hab}
                            </span>
                          ))}
                          {creature.habitats.length > 3 && (
                            <span className="text-[9px] font-mono text-zinc-600 px-1 py-0.5">
                              +{creature.habitats.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <Link href={`/creatures/${creature.slug}`} className="w-full">
                        <Button 
                          variant="ghost" 
                          className="w-full border border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/5 hover:border-amber-500/20 font-mono text-xs h-9 transition-colors duration-200"
                        >
                          Examine Codex
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-zinc-900/80">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-zinc-800 bg-zinc-950 text-zinc-400 font-mono text-xs h-9 hover:bg-zinc-900 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                
                <span className="text-xs text-zinc-500 font-mono px-4">
                  Page <strong className="text-zinc-300">{page}</strong> of <strong className="text-zinc-300">{totalPages}</strong>
                </span>

                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-zinc-800 bg-zinc-950 text-zinc-400 font-mono text-xs h-9 hover:bg-zinc-900 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
