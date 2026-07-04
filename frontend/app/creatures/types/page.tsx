"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  BookOpen, 
  ShieldAlert, 
  Compass, 
  Skull, 
  Sparkles,
  Search,
  Folder,
  FolderOpen,
  ArrowRight
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getTaxonomyTree, 
  listCreatures, 
  type TaxonomyNode, 
  type CreaturesListResponse, 
  type ApiClientError 
} from "@/lib/api-client";

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

function TreeNode({ 
  node, 
  activeSlug, 
  onSelect, 
  depth = 0 
}: { 
  node: TaxonomyNode; 
  activeSlug: string | null; 
  onSelect: (slug: string, name: string) => void; 
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = activeSlug === node.slug;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer select-none font-mono text-xs ${
          isSelected 
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
        }`}
        style={{ paddingLeft: `${Math.max(12, depth * 16 + 12)}px` }}
        onClick={() => onSelect(node.slug, node.name)}
      >
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-zinc-300"
          >
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-500/60" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-3.5 h-3.5 border-l border-b border-zinc-800 rounded-bl ml-1 mr-1" />}
        <span className="truncate font-medium">{node.name}</span>
        <span className="text-[9px] text-zinc-600 ml-auto font-mono">/{node.slug}</span>
      </div>

      {hasChildren && isOpen && (
        <div className="relative">
          {/* Vertical line indicator */}
          <div 
            className="absolute left-4 top-0 bottom-2 w-[1px] bg-zinc-900"
            style={{ left: `${depth * 16 + 20}px` }}
          />
          <div className="space-y-1">
            {node.children.map((child) => (
              <TreeNode 
                key={child.slug} 
                node={child} 
                activeSlug={activeSlug} 
                onSelect={onSelect} 
                depth={depth + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatureTypesPage() {
  const [selectedType, setSelectedType] = useState<{ slug: string; name: string } | null>(null);

  // Fetch Taxonomy Tree
  const treeQuery = useQuery({
    queryKey: ["taxonomy-tree", "creature-types"],
    queryFn: () => getTaxonomyTree("creature-types"),
  });

  // Fetch Creatures of Selected Type
  const creaturesQuery = useQuery<CreaturesListResponse, ApiClientError>({
    queryKey: ["creatures-by-type", selectedType?.slug],
    queryFn: () => listCreatures({ creatureType: selectedType?.slug ?? undefined, pageSize: 50 }),
    enabled: !!selectedType?.slug,
  });

  const roots = treeQuery.data?.data ?? [];
  const creatures = creaturesQuery.data?.items ?? [];

  const handleSelect = (slug: string, name: string) => {
    setSelectedType({ slug, name });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden pb-20">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/creatures" className="text-xs text-zinc-500 hover:text-amber-500 transition-colors font-mono flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to CreatureDex
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-zinc-800/80 pb-8">
          <div>
            <div className="flex items-center gap-2 text-violet-400 font-mono text-xs tracking-widest uppercase mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Taxonomical Categorization</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Creature Types Tree
            </h1>
            <p className="mt-3 text-sm text-zinc-400 max-w-xl font-sans leading-relaxed">
              Explore the supernatural hierarchy of monsters, spirits, and mythological beasts sorted by taxonomic classification.
            </p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Tree Viewer */}
          <div className="lg:col-span-1 bg-zinc-900/10 border border-zinc-800/60 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="font-mono text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Classifications</h3>
            
            {treeQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full bg-zinc-800" />
                <Skeleton className="h-9 w-5/6 bg-zinc-800 ml-4" />
                <Skeleton className="h-9 w-2/3 bg-zinc-800 ml-8" />
                <Skeleton className="h-9 w-full bg-zinc-800" />
              </div>
            ) : roots.length === 0 ? (
              <div className="text-center py-8">
                <Skull className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <span className="text-xs text-zinc-500 font-mono">No classifications loaded.</span>
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
                {roots.map((root) => (
                  <TreeNode 
                    key={root.slug} 
                    node={root} 
                    activeSlug={selectedType?.slug ?? null} 
                    onSelect={handleSelect} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Creatures of Selected Category */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedType ? (
              <div className="h-[400px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-zinc-900/5 backdrop-blur-sm">
                <Layers className="w-10 h-10 text-zinc-700 mb-3" />
                <h3 className="text-sm font-mono font-medium text-zinc-400">Select a Classification Type</h3>
                <p className="text-xs text-zinc-600 mt-2 max-w-xs leading-relaxed">
                  Choose any node in the taxonomic tree on the left to list all supernatural creatures categorized under that folder.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Active Category Header */}
                <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">Active Folder</span>
                    <h2 className="text-xl font-bold text-zinc-100 font-mono">
                      {selectedType.name}
                    </h2>
                  </div>
                  <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-xs px-2.5 py-1 rounded-full">
                    {creatures.length} Entities
                  </Badge>
                </div>

                {/* Creatures Grid */}
                {creaturesQuery.isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border border-zinc-800 bg-zinc-900/10 rounded-xl p-5 space-y-3">
                        <Skeleton className="h-5 w-2/3 bg-zinc-800" />
                        <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                        <Skeleton className="h-12 w-full bg-zinc-800" />
                      </div>
                    ))}
                  </div>
                ) : creatures.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-900/5 border border-zinc-800/40 rounded-2xl">
                    <Skull className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <h4 className="text-sm font-mono text-zinc-400">No Creatures Indexed</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      No creatures have been linked to the classification <strong className="text-zinc-300 font-mono">"{selectedType.slug}"</strong> yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {creatures.map((creature) => (
                      <motion.div
                        key={creature.slug}
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                        className="bg-zinc-900/15 hover:bg-zinc-900/30 border border-zinc-800/80 hover:border-zinc-700/80 transition-all rounded-xl p-5 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-500">{creature.tradition}</span>
                            <Badge variant="outline" className={`${getDangerBadgeClass(creature.dangerLevel)} font-mono text-[9px] uppercase px-1.5 py-0`}>
                              {creature.dangerLevel}
                            </Badge>
                          </div>
                          <h3 className="text-sm font-bold text-zinc-100 font-mono hover:text-amber-400 transition-colors">
                            <Link href={`/creatures/${creature.slug}`}>{creature.name}</Link>
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {creature.summary || "No description indexed."}
                          </p>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-zinc-900/60 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {creature.habitats.slice(0, 2).map((hab) => (
                              <span key={hab} className="text-[9px] font-mono px-2 py-0.5 bg-zinc-950 text-zinc-500 rounded border border-zinc-900">
                                {hab}
                              </span>
                            ))}
                          </div>
                          <Link 
                            href={`/creatures/${creature.slug}`}
                            className="text-[10px] font-mono text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 shrink-0"
                          >
                            Codex <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
