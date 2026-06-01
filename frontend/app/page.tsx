"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ComponentType, ReactNode } from "react";
import {
  BookOpen,
  Database,
  GitFork,
  Globe,
  KeyRound,
  Network,
  Search,
  SquareArrowOutUpRight,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatItem = {
  label: string;
  value: number;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accentClass: string;
};

type FeaturedItem = {
  title: string;
  summary: string;
  badge: string;
  danger?: "Low" | "Medium" | "High";
};

type ApiMock = {
  id: string;
  label: string;
  response: Record<string, unknown>;
};

const stats: StatItem[] = [
  {
    label: "Entities",
    value: 50,
    description: "Curated mythological figures & artifacts",
    icon: Globe,
    accentClass: "text-violet-400",
  },
  {
    label: "Relations",
    value: 100,
    description: "Active knowledge graph connections",
    icon: GitFork,
    accentClass: "text-emerald-400",
  },
  {
    label: "Traditions",
    value: 3,
    description: "Norse, Greek, and Vietnamese Folklore",
    icon: BookOpen,
    accentClass: "text-amber-400",
  },
];

const featuredTraditions: FeaturedItem[] = [
  {
    title: "Vietnamese Folklore",
    badge: "Tradition",
    summary: "River spirits, mountain deities, and oral legends rooted in local cosmology.",
  },
  {
    title: "Greek Pantheon",
    badge: "Tradition",
    summary: "Olympian lineages, hero archetypes, and layered divine conflicts.",
  },
  {
    title: "Norse Myth",
    badge: "Tradition",
    summary: "Cosmic cycles, giant realms, and fate threads woven through Yggdrasil.",
  },
];

const featuredCreatures: FeaturedItem[] = [
  {
    title: "Ma Da",
    badge: "Creature",
    summary: "A waterbound entity said to lure travelers into murky river currents.",
    danger: "Medium",
  },
  {
    title: "Hydra",
    badge: "Creature",
    summary: "A many-headed serpent whose regeneration marks it as a persistent threat.",
    danger: "High",
  },
  {
    title: "Fenrir",
    badge: "Creature",
    summary: "A colossal wolf tied to apocalyptic cycles and divine reckoning.",
    danger: "High",
  },
];

const apiMocks: ApiMock[] = [
  {
    id: "entity",
    label: "GET /entities/son-tinh",
    response: {
      id: "ent_son_tinh",
      slug: "son-tinh",
      name: "Son Tinh",
      type: "deity",
      tradition: "vietnamese-folklore",
      metadata: {
        domains: ["mountains", "weather", "protection"],
        alignment: "neutral-good",
      },
      links: {
        relations: [
          { type: "opposes", target: "thuy-tinh" },
          { type: "protects", target: "van-lang" },
        ],
        neighbors: ["thuy-tinh", "my-nuong", "hung-kings"],
      },
    },
  },
  {
    id: "path",
    label: "GET /graph/path",
    response: {
      source: "son-tinh",
      target: "ma-da",
      path: [
        { node: "son-tinh", relation: "guards" },
        { node: "river-border", relation: "haunted-by" },
        { node: "ma-da", relation: "manifests" },
      ],
      hops: 3,
    },
  },
  {
    id: "creature",
    label: "GET /creatures/ma-da",
    response: {
      id: "cre_ma_da",
      name: "Ma Da",
      type: "water-spirit",
      dangerLevel: "medium",
      habitats: ["river", "floodplain"],
      signs: ["cold-current", "echoing-whispers"],
    },
  },
];

function renderJson(value: unknown, indent = 0): ReactNode {
  const pad = "  ".repeat(indent);
  const nextPad = "  ".repeat(indent + 1);

  if (value === null) {
    return <span className="text-zinc-500">null</span>;
  }

  if (typeof value === "string") {
    return <span className="text-emerald-400">&quot;{value}&quot;</span>;
  }

  if (typeof value === "number") {
    return <span className="text-amber-400">{value}</span>;
  }

  if (typeof value === "boolean") {
    return <span className="text-sky-400">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span>[]</span>;
    }

    return (
      <>
        <span>[</span>
        {value.map((item, index) => (
          <div key={`${indent}-arr-${index}`}>
            <span>{nextPad}</span>
            {renderJson(item, indent + 1)}
            {index < value.length - 1 ? <span>,</span> : null}
          </div>
        ))}
        <span>{pad}]</span>
      </>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return <span>{"{}"}</span>;
    }

    return (
      <>
        <span>{"{"}</span>
        {entries.map(([key, val], index) => (
          <div key={`${indent}-obj-${key}`}>
            <span>{nextPad}</span>
            <span className="text-violet-400">&quot;{key}&quot;</span>
            <span>: </span>
            {renderJson(val, indent + 1)}
            {index < entries.length - 1 ? <span>,</span> : null}
          </div>
        ))}
        <span>{pad}{"}"}</span>
      </>
    );
  }

  return <span>{String(value)}</span>;
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.2),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.16),transparent_30%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav className="mb-10 flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-violet-400" />
            <span className="font-serif text-xl tracking-wide text-zinc-50">MythosGraph</span>
          </div>

          <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <Link href="#" className="transition hover:text-violet-300">Docs</Link>
            <Link href="#" className="transition hover:text-violet-300">CreatureDex</Link>
            <Link href="#" className="transition hover:text-violet-300">Graph Explorer</Link>
            <Link href="#" className="inline-flex items-center gap-1.5 transition hover:text-violet-300">
              <SquareArrowOutUpRight className="h-4 w-4" /> GitHub
            </Link>
          </div>

          <Button variant="outline" className="border-zinc-700 bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800">
            <KeyRound className="mr-2 h-4 w-4" />
            Get API Key
          </Button>
        </nav>

        <section className="mb-12 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="font-serif text-4xl leading-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Unlock the World&apos;s Mythology Data Grid.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-zinc-300 sm:text-lg">
              A public, structured Knowledge Graph API for folklore, legends, pantheons, and mythical creatures.
            </p>

            <div className="relative mx-auto mt-8 max-w-3xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <Input
                className="h-16 border-zinc-700/90 bg-zinc-900/60 pl-14 pr-24 text-base text-zinc-100 shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_0_35px_rgba(139,92,246,0.12)] placeholder:text-zinc-500 focus-visible:ring-violet-500"
                placeholder="Search mythology entities (e.g., Son Tinh, Thor, Hydra, Ma Da)..."
              />
              <Badge variant="secondary" className="absolute right-4 top-1/2 -translate-y-1/2 border border-zinc-700 bg-zinc-800/80 font-mono text-xs text-zinc-300">
                Ctrl K
              </Badge>
            </div>
          </div>
        </section>

        <section className="mb-12 grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                whileHover={{ y: -3, scale: 1.01 }}
              >
                <Card className="h-full border-zinc-800 bg-zinc-900/50 backdrop-blur-md transition-colors hover:border-violet-700/60">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-zinc-400">Live Stats</CardDescription>
                    <CardTitle className="flex items-center justify-between text-2xl text-zinc-50">
                      <span>
                        {stat.label}: <span className={stat.accentClass}>{stat.value}</span>
                      </span>
                      <span className="rounded-md border border-zinc-800 bg-zinc-950/60 p-2">
                        <Icon className={`h-4 w-4 ${stat.accentClass}`} />
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </section>

        <section className="mb-12">
          <Tabs defaultValue="traditions" className="w-full">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl text-zinc-50">Featured Knowledge</h2>
              <TabsList className="bg-zinc-900/70">
                <TabsTrigger value="traditions">Featured Traditions</TabsTrigger>
                <TabsTrigger value="creatures">Featured Creatures</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="traditions" className="mt-0 grid gap-4 md:grid-cols-3">
              {featuredTraditions.map((item) => (
                <Card key={item.title} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                  <CardHeader className="gap-3">
                    <Badge className="w-fit border-zinc-700 bg-zinc-800 text-zinc-200">{item.badge}</Badge>
                    <CardTitle className="text-zinc-50">{item.title}</CardTitle>
                    <CardDescription className="text-zinc-400">{item.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <button className="inline-flex items-center gap-1 text-sm text-violet-300 transition hover:text-violet-200">
                      Explore Graph Connection <Network className="h-3.5 w-3.5" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="creatures" className="mt-0 grid gap-4 md:grid-cols-3">
              {featuredCreatures.map((item) => (
                <Card key={item.title} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-zinc-700 bg-zinc-800 text-zinc-200">{item.badge}</Badge>
                      {item.danger ? (
                        <Badge variant="outline" className="border-amber-700/50 bg-amber-950/40 text-amber-300">
                          Danger: {item.danger}
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-zinc-50">{item.title}</CardTitle>
                    <CardDescription className="text-zinc-400">{item.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <button className="inline-flex items-center gap-1 text-sm text-violet-300 transition hover:text-violet-200">
                      Explore Graph Connection <Network className="h-3.5 w-3.5" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="mb-4 font-serif text-2xl text-zinc-50">Interactive API Snapshot</h2>
          <Tabs defaultValue={apiMocks[0].id} className="grid gap-4 lg:grid-cols-2">
            <TabsList className="flex h-auto flex-col items-stretch gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 backdrop-blur-md">
              {apiMocks.map((mock) => (
                <TabsTrigger
                  key={mock.id}
                  value={mock.id}
                  className="w-full justify-start rounded-lg border border-transparent bg-zinc-900/70 px-4 py-3 text-left font-mono text-xs text-zinc-300 data-[state=active]:border-violet-700/60 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                >
                  {mock.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {apiMocks.map((mock) => (
              <TabsContent key={mock.id} value={mock.id} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
                    <p className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400">
                      <Database className="h-3.5 w-3.5 text-emerald-400" /> JSON Response
                    </p>
                    <Sparkles className="h-4 w-4 text-violet-400" />
                  </div>
                  <pre className="overflow-auto font-mono text-xs leading-6 text-zinc-200">
                    {renderJson(mock.response)}
                  </pre>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </main>
  );
}
