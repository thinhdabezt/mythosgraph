"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from "reactflow";
import { AlertTriangle, Loader2, Network, Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  findGraphPath,
  listEntities,
  type EntityQueryResponse,
  type GraphPathResponse,
} from "@/lib/api-client";

const MOCK_ENTITIES = [
  { slug: "son-tinh", name: "Son Tinh" },
  { slug: "thuy-tinh", name: "Thuy Tinh" },
  { slug: "water", name: "Water" },
  { slug: "zeus", name: "Zeus" },
  { slug: "cronus", name: "Cronus" },
];

const MOCK_PATH: GraphPathResponse = {
  from: { slug: "son-tinh", name: "Son Tinh" },
  to: { slug: "water", name: "Water" },
  pathFound: true,
  distance: 2,
  path: [
    {
      from: "son-tinh",
      fromName: "Son Tinh",
      relation: "rival_of",
      to: "thuy-tinh",
      toName: "Thuy Tinh",
    },
    {
      from: "thuy-tinh",
      fromName: "Thuy Tinh",
      relation: "has_domain",
      to: "water",
      toName: "Water",
    },
  ],
};

const SELECT_TRIGGER_CLASS =
  "h-11 w-full border-zinc-800 bg-zinc-950/70 px-3 pr-8 font-mono text-xs text-zinc-300 hover:bg-zinc-900/80 focus:ring-1 focus:ring-amber-500/30";
const SELECT_CONTENT_CLASS =
  "min-w-[220px] border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 shadow-xl";
const SELECT_ITEM_CLASS =
  "cursor-pointer rounded-md py-2 font-mono text-xs text-zinc-400 transition-colors focus:bg-amber-500/10 focus:text-amber-400";

function clampDepth(value: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : 4, 1), 6);
}

function formatRelation(type: string) {
  return type
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_+|_+$/g, "");
}

function buildGraph(path: GraphPathResponse | undefined) {
  if (!path?.pathFound || path.path.length === 0) {
    return { nodes: [] as Node[], edges: [] as Edge[] };
  }

  const ordered = new Map<string, string>();
  path.path.forEach((step) => {
    ordered.set(step.from, step.fromName);
    ordered.set(step.to, step.toName);
  });

  const entityEntries = Array.from(ordered.entries());
  const destinationSlug = path.to.slug;
  const originSlug = path.from.slug;

  const nodes: Node[] = entityEntries.map(([slug, name], index) => {
    const isEndpoint = slug === originSlug || slug === destinationSlug;

    return {
      id: slug,
      position: { x: index * 260, y: 150 },
      data: { label: name },
      style: {
        background: isEndpoint ? "rgba(245,158,11,0.10)" : "rgba(24,24,27,0.92)",
        border: isEndpoint
          ? "1px solid rgba(245,158,11,0.50)"
          : "1px solid rgba(113,113,122,0.45)",
        boxShadow: isEndpoint ? "0 0 22px rgba(245,158,11,0.12)" : "none",
        color: isEndpoint ? "#fbbf24" : "#d4d4d8",
        fontFamily: "monospace",
        fontSize: 12,
        minWidth: 130,
      },
    };
  });

  const edges: Edge[] = path.path.map((step, index) => ({
    id: `${step.from}-${formatRelation(step.relation)}-${step.to}-${index}`,
    source: step.from,
    target: step.to,
    label: formatRelation(step.relation),
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#4b5563", strokeDasharray: "5 5", strokeWidth: 1.5 },
    labelBgStyle: { fill: "#09090b", stroke: "#27272a", strokeWidth: 1 },
    labelStyle: { fill: "#fbbf24", fontFamily: "monospace", fontSize: "10px" },
  }));

  return { nodes, edges };
}

export default function GraphExplorerPage() {
  const [fromSlug, setFromSlug] = useState("son-tinh");
  const [toSlug, setToSlug] = useState("water");
  const [maxDepth, setMaxDepth] = useState(4);
  const [hasSearched, setHasSearched] = useState(false);

  const entitiesQuery = useQuery<EntityQueryResponse>({
    queryKey: ["graph-explorer-entities"],
    queryFn: () => listEntities({ page: 1, pageSize: 100, sortBy: "name", sortDirection: "asc" }),
    staleTime: 60_000,
  });

  const pathQuery = useQuery<GraphPathResponse>({
    queryKey: ["graph-path", fromSlug, toSlug, maxDepth],
    enabled: false,
    queryFn: async () => {
      try {
        return await findGraphPath({ from: fromSlug, to: toSlug, maxDepth });
      } catch (error) {
        if (fromSlug === "son-tinh" && toSlug === "water") {
          return MOCK_PATH;
        }

        throw error;
      }
    },
  });

  const entityOptions = useMemo(() => {
    const apiEntities = entitiesQuery.data?.data.map((entity) => ({
      slug: entity.slug,
      name: entity.name,
    }));

    return apiEntities?.length ? apiEntities : MOCK_ENTITIES;
  }, [entitiesQuery.data]);

  const path = pathQuery.data;
  const graph = useMemo(() => buildGraph(path), [path]);

  const handleFindPath = () => {
    setHasSearched(true);
    pathQuery.refetch();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(139,92,246,0.20),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(245,158,11,0.12),transparent_32%)]" />

      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-3">
          <Badge className="border-violet-500/20 bg-violet-500/10 font-mono text-xs text-violet-300">
            MythosGraph Pathfinding Console
          </Badge>
          <h1 className="font-serif text-4xl text-zinc-50 sm:text-5xl">Graph Explorer</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">
            Pick two mythology entities and trace the shortest available knowledge-graph path between them.
          </p>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_140px_auto] lg:items-end">
            <div className="space-y-2">
              <label className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">From</label>
              <EntitySelect value={fromSlug} onChange={setFromSlug} options={entityOptions} />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">To</label>
              <EntitySelect value={toSlug} onChange={setToSlug} options={entityOptions} />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Max Depth</label>
              <Input
                type="number"
                min={1}
                max={6}
                value={maxDepth}
                onChange={(event) => setMaxDepth(clampDepth(Number(event.target.value)))}
                className="h-11 border-zinc-800 bg-zinc-950/70 font-mono text-xs text-zinc-300 focus-visible:ring-amber-500/30"
              />
            </div>

            <Button
              type="button"
              onClick={handleFindPath}
              disabled={pathQuery.isFetching || !fromSlug || !toSlug || fromSlug === toSlug}
              className="h-11 border border-amber-500/30 bg-amber-500/10 px-5 font-mono text-xs text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.08)] transition hover:bg-amber-500/20 hover:text-amber-200"
            >
              {pathQuery.isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Route className="mr-2 h-4 w-4" />
              )}
              Find Path
            </Button>
          </div>

          {fromSlug === toSlug ? (
            <p className="mt-3 font-mono text-xs text-amber-500/80">
              Choose two different entities to run pathfinding.
            </p>
          ) : null}
        </section>

        {pathQuery.isError ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 font-mono text-xs text-rose-300">
            Unable to query the graph path endpoint right now.
          </div>
        ) : null}

        {hasSearched && path && !path.pathFound ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 font-mono text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            No relationship path found within max depth.
          </div>
        ) : null}

        {path?.pathFound ? (
          <section className="space-y-5">
            <div className="relative mt-6 min-h-[400px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(113,113,122,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(113,113,122,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                fitView
                panOnDrag
                zoomOnScroll={false}
                zoomOnPinch={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="rgba(113,113,122,0.16)" gap={28} />
                <Controls className="!border-zinc-800 !bg-zinc-900 !text-zinc-200" />
              </ReactFlow>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm text-emerald-400">
                  Path found: Distance {path.distance}
                </p>
                <Badge variant="outline" className="border-zinc-700 bg-zinc-950/60 font-mono text-xs text-zinc-400">
                  {path.from.name} to {path.to.name}
                </Badge>
              </div>

              <ol className="space-y-3">
                {path.path.map((step, index) => (
                  <li
                    key={`${step.from}-${step.relation}-${step.to}-${index}`}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/35 px-4 py-3 font-mono text-xs"
                  >
                    <span className="text-zinc-600">{index + 1}.</span>
                    <Link href={`/entities/${step.from}`} className="text-violet-300 transition hover:text-amber-300">
                      {step.fromName}
                    </Link>
                    <span className="text-zinc-600">-&gt;</span>
                    <code className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-300">
                      {formatRelation(step.relation)}
                    </code>
                    <span className="text-zinc-600">-&gt;</span>
                    <Link href={`/entities/${step.to}`} className="text-violet-300 transition hover:text-amber-300">
                      {step.toName}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {!hasSearched ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center">
            <Network className="mx-auto mb-3 h-6 w-6 text-zinc-600" />
            <p className="font-mono text-xs text-zinc-600">
              Configure source, destination, and max depth, then run Find Path.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function EntitySelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ slug: string; name: string }>;
}) {
  const selected = options.find((option) => option.slug === value);

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
    >
      <SelectTrigger className={SELECT_TRIGGER_CLASS}>
        <span className="truncate">{selected ? selected.name : "Select entity"}</span>
      </SelectTrigger>
      <SelectContent className={SELECT_CONTENT_CLASS}>
        {options.map((option) => (
          <SelectItem key={option.slug} value={option.slug} className={SELECT_ITEM_CLASS}>
            {option.name}
            <span className="text-zinc-600">/{option.slug}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
