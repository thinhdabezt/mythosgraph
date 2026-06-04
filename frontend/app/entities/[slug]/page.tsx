"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from "reactflow";
import {
  BookOpen,
  Database,
  ExternalLink,
  Shield,
  Sparkles,
  Sword,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ApiClientError,
  getEntityDetail,
  getEntityRelations,
  getEntitySources,
  type EntityDetail,
  type EntityRelationsResponse,
  type EntitySource,
  type EntityType,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getEntityGlowClass(entityType: EntityType): string {
  if (entityType === "God" || entityType === "Goddess") {
    return "from-violet-950/35";
  }

  if (entityType === "Creature") {
    return "from-emerald-950/30";
  }

  if (entityType === "Artifact" || entityType === "Weapon") {
    return "from-amber-950/35";
  }

  return "from-zinc-800/40";
}

function getEntityIconElement(entityType: EntityType) {
  if (entityType === "Artifact" || entityType === "Weapon") {
    return <Sword className="h-4 w-4 text-amber-400" />;
  }

  if (entityType === "Creature") {
    return <Sparkles className="h-4 w-4 text-emerald-400" />;
  }

  return <Shield className="h-4 w-4 text-violet-400" />;
}

function formatRelationType(type: string) {
  return type
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_+|_+$/g, "");
}

function LoadingShell() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8">
          <Skeleton className="mb-4 h-10 w-72 bg-zinc-800" />
          <Skeleton className="mb-3 h-4 w-96 bg-zinc-800" />
          <Skeleton className="h-20 w-full max-w-3xl bg-zinc-900" />
        </div>
        <Skeleton className="h-96 rounded-xl bg-zinc-900" />
      </div>
    </main>
  );
}

function NotFoundShell({ slug }: { slug: string }) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Entity Not Found
        </p>
        <h1 className="font-serif text-4xl text-zinc-50">No entity mapped for {slug}</h1>
        <p className="mt-4 leading-7 text-zinc-400">
          This dynamic route is valid, but no API response or local mock record exists for this
          slug yet.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex font-mono text-xs text-amber-400 transition hover:text-amber-300"
        >
          Back to Explore -&gt;
        </Link>
      </div>
    </main>
  );
}

export default function EntityDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  const detailQuery = useQuery<EntityDetail, ApiClientError>({
    queryKey: ["entity-detail", slug],
    queryFn: () => getEntityDetail(slug),
  });

  const relationsQuery = useQuery<EntityRelationsResponse, ApiClientError>({
    queryKey: ["entity-relations", slug],
    queryFn: () => getEntityRelations(slug),
  });

  const sourcesQuery = useQuery<EntitySource[], ApiClientError>({
    queryKey: ["entity-sources", slug],
    queryFn: () => getEntitySources(slug),
  });

  const entity = detailQuery.data;
  const relations = useMemo(
    () =>
      relationsQuery.data ?? {
        sourceSlug: slug,
        relations: [],
        neighbors: [],
      },
    [relationsQuery.data, slug]
  );
  const sources = sourcesQuery.data ?? [];
  const isLoading = detailQuery.isLoading || relationsQuery.isLoading || sourcesQuery.isLoading;

  const graph = useMemo(() => {
    if (!entity || !relations) {
      return { nodes: [] as Node[], edges: [] as Edge[] };
    }

    const centerPosition = { x: 420, y: 240 };
    const dx = 320;
    const dy = 180;
    const uniqueNeighbors = Array.from(
      new Map(relations.neighbors.map((neighbor) => [neighbor.targetSlug, neighbor])).values()
    );

    const centerNode: Node = {
      id: entity.slug,
      position: centerPosition,
      data: { label: entity.name },
      style: {
        background: "rgba(245, 158, 11, 0.1)",
        border: "1px solid rgba(245, 158, 11, 0.55)",
        boxShadow: "0 0 22px rgba(245, 158, 11, 0.12)",
        color: "#fbbf24",
        fontFamily: "monospace",
        fontSize: 12,
      },
    };

    const layoutSlots = [
      { x: centerPosition.x + dx, y: centerPosition.y },
      { x: centerPosition.x - dx, y: centerPosition.y },
      { x: centerPosition.x, y: centerPosition.y - dy },
      { x: centerPosition.x, y: centerPosition.y + dy },
      { x: centerPosition.x + dx, y: centerPosition.y - dy },
      { x: centerPosition.x + dx, y: centerPosition.y + dy },
      { x: centerPosition.x - dx, y: centerPosition.y - dy },
      { x: centerPosition.x - dx, y: centerPosition.y + dy },
    ];

    const outerNodes = uniqueNeighbors.map((neighbor, index) => {
      const slot = layoutSlots[index % layoutSlots.length];
      const tier = Math.floor(index / layoutSlots.length);
      const position = {
        x: slot.x + tier * 110,
        y: slot.y + (index % 2 === 0 ? tier * 60 : tier * -60),
      };

      return {
        id: neighbor.targetSlug,
        position,
        data: { label: neighbor.targetName },
        style: {
          background: "rgba(24, 24, 27, 0.9)",
          border: "1px solid rgba(113, 113, 122, 0.45)",
          color: "#d4d4d8",
          fontFamily: "monospace",
          fontSize: 11,
        },
      } satisfies Node;
    });

    const edges = relations.neighbors.map((neighbor, index) => {
      const isIncoming = neighbor.direction === "incoming";
      const relationLabel = formatRelationType(neighbor.relationType);
      const source = isIncoming ? neighbor.targetSlug : entity.slug;
      const target = isIncoming ? entity.slug : neighbor.targetSlug;

      return {
        id: `${source}-${relationLabel}-${target}-${index}`,
        source,
        target,
        label: relationLabel,
        animated: true,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#4b5563", strokeDasharray: "5 5", strokeWidth: 1.5 },
        labelBgStyle: { fill: "#09090b", stroke: "#27272a", strokeWidth: 1 },
        labelStyle: { fill: "#fbbf24", fontFamily: "monospace", fontSize: "10px" },
      };
    });

    return { nodes: [centerNode, ...outerNodes], edges };
  }, [entity, relations]);

  if (isLoading) {
    return <LoadingShell />;
  }

  if (!entity) {
    return <NotFoundShell slug={slug} />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/35 p-8 backdrop-blur-md">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] via-zinc-950/20 to-transparent",
              getEntityGlowClass(entity.entityType)
            )}
          />
          <div className="relative z-10 max-w-4xl">
            <h1 className="font-serif text-4xl text-zinc-50 sm:text-6xl">{entity.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                {getEntityIconElement(entity.entityType)}
                {entity.entityType}
              </span>
              <span className="text-zinc-700">.</span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-violet-400" />
                {entity.tradition}
              </span>
            </div>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400">{entity.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {entity.metadata.domains.map((domain) => (
                <Link key={domain} href={`/explore?domain=${encodeURIComponent(domain)}`}>
                  <Badge
                    variant="outline"
                    className="border-amber-500/20 bg-amber-500/10 text-amber-300 transition hover:border-amber-400/40"
                  >
                    {domain}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 h-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 backdrop-blur-md">
            {["overview", "relations", "graph", "sources"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 border border-transparent rounded-md px-4 py-2 text-sm font-mono text-zinc-500 transition-all duration-200"
              >
                {tab === "graph" ? "Graph Preview" : tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3">
              <MetadataCard
                icon={<Shield className="h-4 w-4 text-violet-400" />}
                title="Classification Specs"
                rows={[
                  ["Type", entity.entityType],
                  ["Status", entity.status],
                  ["Tradition ID", entity.traditionId],
                ]}
              />
              <MetadataCard
                icon={<Sparkles className="h-4 w-4 text-amber-400" />}
                title="Domain Properties"
                rows={entity.metadata.domains.map((domain) => ["Domain", domain])}
              />
              <MetadataCard
                icon={<Database className="h-4 w-4 text-emerald-400" />}
                title="System Technical Logs"
                rows={[
                  ["Slug", entity.slug],
                  [
                    "Created At",
                    entity.createdAt && !entity.createdAt.includes("1970")
                      ? new Date(entity.createdAt).toLocaleDateString()
                      : "Curated Content",
                  ],
                  ["API Status", String(entity.apiStatusCode)],
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="relations">
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              {relations.relations.map((relation) => {
                const isIncoming = relation.direction === "incoming";
                const relationLabel = formatRelationType(relation.relationType);

                return (
                  <div
                    key={`${relation.relationType}-${relation.targetSlug}`}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/70 bg-zinc-950/35 px-4 py-3"
                  >
                    {isIncoming ? (
                      <Link
                        href={`/entities/${relation.targetSlug}`}
                        className="inline-flex items-center gap-1 text-sm text-violet-300 transition hover:text-amber-300"
                      >
                        {relation.targetName}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="font-serif text-base text-zinc-100">{entity.name}</span>
                    )}
                    <span className="font-mono text-zinc-600">--</span>
                    <code className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-mono text-xs text-amber-300">
                      {relationLabel}
                    </code>
                    <span className="font-mono text-zinc-600">--&gt;</span>
                    {isIncoming ? (
                      <span className="font-serif text-base text-zinc-100">{entity.name}</span>
                    ) : (
                      <Link
                        href={`/entities/${relation.targetSlug}`}
                        className="inline-flex items-center gap-1 text-sm text-violet-300 transition hover:text-amber-300"
                      >
                        {relation.targetName}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="graph">
            <div className="h-[460px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/70">
              <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                fitView
                panOnDrag
                zoomOnScroll={false}
                zoomOnPinch={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="rgba(113,113,122,0.18)" gap={22} />
                <Controls className="!border-zinc-800 !bg-zinc-900 !text-zinc-200" />
              </ReactFlow>
            </div>
          </TabsContent>

          <TabsContent value="sources">
            {sources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-8 text-center font-mono text-xs text-zinc-600">
                No external citations attached to this entity. Content is community-curated.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {sources.map((source) => (
                  <article
                    key={source.id}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-200 hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-serif text-lg font-bold leading-snug text-zinc-200">
                          {source.title}
                        </h3>
                        <p className="font-mono text-xs text-zinc-500">
                          By {source.author} • Pub:{" "}
                          {source.publicationYear > 0 ? source.publicationYear : "Unknown"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-zinc-700 bg-zinc-950/70 font-mono text-[10px] uppercase tracking-wider text-zinc-400"
                      >
                        {source.sourceType}
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-emerald-400/90">
                      {source.notes}
                    </div>

                    {source.url ? (
                      <div className="mt-auto space-y-2 border-t border-zinc-800/80 pt-3">
                        <Link
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950/50 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-300"
                        >
                          View Digital Source <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <p className="font-mono text-[11px] leading-relaxed text-zinc-600">
                          {source.licenseNote ?? "For research and curation purposes only."}
                        </p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function MetadataCard({
  icon,
  title,
  rows,
}: {
  icon: ReactNode;
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/40 text-zinc-100">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([key, value], index) => (
          <div key={`${key}-${index}`} className="flex items-start justify-between gap-4">
            <span className="font-mono text-xs text-zinc-500">{key}</span>
            <span className="text-right text-sm text-zinc-200">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
