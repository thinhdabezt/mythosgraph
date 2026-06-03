"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
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
  FileText,
  Shield,
  Sparkles,
  Sword,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type EntityType = "God" | "Goddess" | "MythFigure" | "Creature" | "Artifact" | "Weapon" | "Legend";

type EntityDetail = {
  id: string;
  slug: string;
  name: string;
  entityType: EntityType;
  tradition: string;
  traditionId: string;
  status: string;
  summary: string;
  createdAt: string;
  apiStatusCode: number;
  metadata: {
    domains: string[];
    alignment?: string;
  };
};

type EntityRelation = {
  relationType: string;
  targetName: string;
  targetSlug: string;
  direction: "outgoing" | "incoming";
};

type EntityRelationsResponse = {
  sourceSlug: string;
  relations: EntityRelation[];
  neighbors: EntityRelation[];
};

type EntitySource = {
  id: string;
  title: string;
  author: string;
  sourceType: string;
  publicationYear: number;
  notes: string;
};

interface PageProps {
  params: { slug: string };
}

const MOCK_DETAILS: Record<string, EntityDetail> = {
  "son-tinh": {
    id: "ent_son_tinh",
    slug: "son-tinh",
    name: "Son Tinh",
    entityType: "MythFigure",
    tradition: "Vietnamese Mythology",
    traditionId: "vietnamese-mythology",
    status: "canonical",
    summary:
      "A mountain spirit and protector figure associated with earth, highlands, and the recurring struggle against destructive floods.",
    createdAt: "2026-05-28T09:20:00.000Z",
    apiStatusCode: 200,
    metadata: {
      domains: ["Mountain", "Earth", "Protection"],
      alignment: "protective-neutral",
    },
  },
  thor: {
    id: "ent_thor",
    slug: "thor",
    name: "Thor",
    entityType: "God",
    tradition: "Norse Mythology",
    traditionId: "norse-mythology",
    status: "canonical",
    summary:
      "A thunder god associated with storms, strength, protection, and the enchanted hammer Mjolnir.",
    createdAt: "2026-05-29T10:10:00.000Z",
    apiStatusCode: 200,
    metadata: {
      domains: ["Thunder", "Sky"],
      alignment: "protective-chaotic",
    },
  },
};

const MOCK_RELATIONS: Record<string, EntityRelationsResponse> = {
  "son-tinh": {
    sourceSlug: "son-tinh",
    relations: [
      {
        relationType: "rival_of",
        targetName: "Thuy Tinh",
        targetSlug: "thuy-tinh",
        direction: "outgoing",
      },
      {
        relationType: "appears_in",
        targetName: "Son Tinh - Thuy Tinh",
        targetSlug: "son-tinh-thuy-tinh",
        direction: "outgoing",
      },
      {
        relationType: "has_domain",
        targetName: "Mountain",
        targetSlug: "mountain",
        direction: "outgoing",
      },
    ],
    neighbors: [
      {
        relationType: "rival_of",
        targetName: "Thuy Tinh",
        targetSlug: "thuy-tinh",
        direction: "outgoing",
      },
      {
        relationType: "appears_in",
        targetName: "Son Tinh - Thuy Tinh",
        targetSlug: "son-tinh-thuy-tinh",
        direction: "outgoing",
      },
      {
        relationType: "has_domain",
        targetName: "Mountain",
        targetSlug: "mountain",
        direction: "outgoing",
      },
    ],
  },
  thor: {
    sourceSlug: "thor",
    relations: [
      {
        relationType: "wields",
        targetName: "Mjolnir",
        targetSlug: "mjolnir",
        direction: "outgoing",
      },
    ],
    neighbors: [
      {
        relationType: "wields",
        targetName: "Mjolnir",
        targetSlug: "mjolnir",
        direction: "outgoing",
      },
    ],
  },
};

const MOCK_SOURCES: Record<string, EntitySource[]> = {
  "son-tinh": [
    {
      id: "src_001",
      title: "Vietnamese Folklore Reference Notes",
      author: "MythosGraph Editorial Index",
      sourceType: "curated-summary",
      publicationYear: 2026,
      notes:
        "Metadata-only citation record. The API stores source attribution, not copyrighted full text.",
    },
    {
      id: "src_002",
      title: "Son Tinh - Thuy Tinh Motif Record",
      author: "Public Domain Motif Catalog",
      sourceType: "motif-index",
      publicationYear: 2025,
      notes:
        "Used for relation modeling, domain tags, and canonical entity linkage.",
    },
  ],
  thor: [
    {
      id: "src_thor_001",
      title: "Norse Mythology Entity Index",
      author: "MythosGraph Editorial Index",
      sourceType: "curated-summary",
      publicationYear: 2026,
      notes:
        "Metadata-only citation record for Thor. The API stores source attribution, not copyrighted full text.",
    },
  ],
};

async function fetchWithFallback<T>(url: string, fallback: T | null): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
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
  const { slug } = params;

  const detailQuery = useQuery({
    queryKey: ["entity-detail", slug],
    queryFn: () =>
      fetchWithFallback<EntityDetail>(
        `/api/v1/entities/${slug}`,
        MOCK_DETAILS[slug] ?? null
      ),
  });

  const relationsQuery = useQuery({
    queryKey: ["entity-relations", slug],
    queryFn: () =>
      fetchWithFallback<EntityRelationsResponse>(
        `/api/v1/entities/${slug}/relations`,
        MOCK_RELATIONS[slug] ?? null
      ),
  });

  const sourcesQuery = useQuery({
    queryKey: ["entity-sources", slug],
    queryFn: () =>
      fetchWithFallback<EntitySource[]>(
        `/api/v1/entities/${slug}/sources`,
        MOCK_SOURCES[slug] ?? null
      ),
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

    const centerNode: Node = {
      id: entity.slug,
      position: { x: 250, y: 160 },
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

    const outerNodes = relations.neighbors.map((neighbor, index) => {
      const angle = (index / Math.max(relations.neighbors.length, 1)) * Math.PI * 2;
      const radius = 170;

      return {
        id: neighbor.targetSlug,
        position: {
          x: 250 + Math.cos(angle) * radius,
          y: 160 + Math.sin(angle) * radius,
        },
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

    const edges = relations.neighbors.map((neighbor) => ({
      id: `${entity.slug}-${neighbor.targetSlug}`,
      source: entity.slug,
      target: neighbor.targetSlug,
      label: neighbor.relationType,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "rgba(245, 158, 11, 0.55)", strokeDasharray: "6 6" },
      labelStyle: { fill: "#fbbf24", fontFamily: "monospace", fontSize: 10 },
    }));

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
                className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 px-4 py-2 border border-transparent rounded-md text-sm font-mono text-zinc-500 hover:text-zinc-300 transition-all duration-200"
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
                  ["Created At", new Date(entity.createdAt).toLocaleString()],
                  ["API Status", String(entity.apiStatusCode)],
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="relations">
            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              {relations.relations.map((relation) => (
                <div
                  key={`${relation.relationType}-${relation.targetSlug}`}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/70 bg-zinc-950/35 px-4 py-3"
                >
                  <span className="font-serif text-base text-zinc-100">{entity.name}</span>
                  <span className="font-mono text-zinc-600">--</span>
                  <code className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-mono text-xs text-amber-300">
                    {relation.relationType}
                  </code>
                  <span className="font-mono text-zinc-600">--&gt;</span>
                  <Link
                    href={`/entities/${relation.targetSlug}`}
                    className="inline-flex items-center gap-1 text-sm text-violet-300 transition hover:text-amber-300"
                  >
                    {relation.targetName}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
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
            <div className="grid gap-4 lg:grid-cols-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                >
                  <div className="mb-3 flex items-center gap-2 border-b border-zinc-800 pb-3 font-mono text-xs text-zinc-500">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Citation Metadata
                  </div>
                  <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-300">
                    {JSON.stringify(
                      {
                        title: source.title,
                        author: source.author,
                        sourceType: source.sourceType,
                        publicationYear: source.publicationYear,
                        notes: source.notes,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              ))}
            </div>
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
