"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, Clipboard, ExternalLink, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type NavSection = {
  href: string;
  label: string;
};

type EndpointInventoryItem = {
  method: "GET";
  path: string;
  description: string;
};

type CodeSnippet = {
  id: string;
  label: string;
  value: string;
};

type ResponseExample = {
  id: string;
  label: string;
  value: Record<string, unknown>;
};

const API_BASE_URL = "http://localhost:5076/api/v1";

const sidebarSections: NavSection[] = [
  { href: "#introduction", label: "Introduction" },
  { href: "#rate-limit", label: "Rate Limit" },
  { href: "#endpoints", label: "Endpoints" },
  { href: "#request-examples", label: "Request Examples" },
  { href: "#response-examples", label: "Response Examples" },
  { href: "#error-format", label: "Error Format" },
];

const endpointInventory: EndpointInventoryItem[] = [
  {
    method: "GET",
    path: "/entities",
    description: "List entities with server-side pagination.",
  },
  {
    method: "GET",
    path: "/entities/{slug}",
    description: "Retrieve a specific mythology figure by slug.",
  },
  {
    method: "GET",
    path: "/entities/{slug}/relations",
    description: "View active graph relationship links.",
  },
  {
    method: "GET",
    path: "/api/v1/search",
    description: "Full-text keyword entity query engine.",
  },
  {
    method: "GET",
    path: "/graph/path",
    description: "BFS shortest relationship path between two connected nodes.",
  },
];

const requestExamples: CodeSnippet[] = [
  {
    id: "pathfinding",
    label: "Pathfinding",
    value: `curl -X GET "http://localhost:5076/api/v1/graph/path?from=son-tinh&to=water&maxDepth=5"`,
  },
  {
    id: "entity-detail",
    label: "Entity Detail",
    value: `curl -X GET "http://localhost:5076/api/v1/entities/son-tinh" \\
  -H "Accept: application/json"`,
  },
  {
    id: "admin-auth",
    label: "Bearer Header",
    value: `curl -X POST "http://localhost:5076/api/v1/admin/entities" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "slug": "new-entity", "name": "New Entity" }'`,
  },
];

const responseExamples: ResponseExample[] = [
  {
    id: "entity-detail",
    label: "Entity Detail Response",
    value: {
      id: "ent_son_tinh",
      slug: "son-tinh",
      name: "Son Tinh",
      entityType: "MythFigure",
      tradition: {
        slug: "vietnamese-folklore",
        name: "Vietnamese Folklore",
      },
      summary:
        "A mountain spirit and mythic protector associated with the Son Tinh - Thuy Tinh flood legend.",
      metadata: {
        aliases: ["Mountain God", "Spirit of Tản Viên Mountain"],
        domains: ["Mountain", "Earth", "Protection"],
        symbols: ["Mountain", "Bamboo Staff"],
      },
      links: {
        relations: "/api/v1/entities/son-tinh/relations",
        neighbors: "/api/v1/entities/son-tinh/relations",
      },
    },
  },
  {
    id: "graph-path",
    label: "Graph Traversal Path Response",
    value: {
      from: { slug: "son-tinh", name: "Son Tinh" },
      to: { slug: "water", name: "Water" },
      pathFound: true,
      distance: 2,
      path: [
        { from: "son-tinh", relation: "rival_of", to: "thuy-tinh" },
        { from: "thuy-tinh", relation: "has_domain", to: "water" },
      ],
    },
  },
];

const errorExamples: ResponseExample[] = [
  {
    id: "validation-error",
    label: "400 ValidationError",
    value: {
      status: 400,
      error: "ValidationError",
      message: "One or more request fields failed validation.",
      traceId: "00-7f8d4e0f2c8b8a5e-3c9f0c8d9a1b2c3d-00",
      details: {
        slug: ["Slug is required.", "Slug must be URL-safe lowercase text."],
        entityType: ["Entity type must be one of the supported SRS taxonomy values."],
      },
    },
  },
  {
    id: "not-found",
    label: "404 ResourceNotFound",
    value: {
      status: 404,
      error: "ResourceNotFound",
      message: "Entity resource with slug 'unknown-spirit' was not found.",
      traceId: "00-4d2a2f8c9b1a7e6d-9c8b7a6f5e4d3c2b-00",
    },
  },
];

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
      {children}
    </code>
  );
}

function MethodBadge({ method }: { method: "GET" }) {
  return (
    <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[11px] font-bold text-emerald-400">
      {method}
    </span>
  );
}

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
          <div key={`${indent}-array-${index}`}>
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
        {entries.map(([key, item], index) => (
          <div key={`${indent}-object-${key}`}>
            <span>{nextPad}</span>
            <span className="text-violet-400">&quot;{key}&quot;</span>
            <span>: </span>
            {renderJson(item, indent + 1)}
            {index < entries.length - 1 ? <span>,</span> : null}
          </div>
        ))}
        <span>{pad}{"}"}</span>
      </>
    );
  }

  return <span>{String(value)}</span>;
}

function CopyButton({ value }: { value: string | unknown }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-2.5 py-1.5 font-mono text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function TerminalHeader({ title, copyValue }: { title: string; copyValue: string | unknown }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
      <div className="inline-flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        </span>
        <span className="font-mono text-xs text-zinc-400">{title}</span>
      </div>
      <CopyButton value={copyValue} />
    </div>
  );
}

function TextTerminal({ title, value }: { title: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
      <TerminalHeader title={title} copyValue={value} />
      <pre className="overflow-auto p-5 font-mono text-xs leading-6 text-emerald-400/90">
        {value}
      </pre>
    </div>
  );
}

function JsonTerminal({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
      <TerminalHeader title={title} copyValue={value} />
      <pre className="overflow-auto p-5 font-mono text-xs leading-6 text-zinc-200">
        {renderJson(value)}
      </pre>
    </div>
  );
}

export default function ApiDocumentationPage() {
  return (
    <main className="min-h-screen scroll-smooth bg-zinc-950 px-4 py-8 text-zinc-300 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(139,92,246,0.18),transparent_34%),radial-gradient(circle_at_82%_4%,rgba(245,158,11,0.12),transparent_32%)]" />

      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="group mb-4 inline-flex items-center gap-2 font-mono text-xs text-zinc-500 transition-colors hover:text-amber-400"
        >
          <span className="transform transition-transform group-hover:-translate-x-1">←</span>
          Back to Dashboard
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-4xl text-zinc-50 sm:text-5xl">API Documentation</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">
            Technical reference, base URL specifications, and JSON schemas for developers.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
          <aside className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md lg:sticky lg:top-6 lg:col-span-1">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              Documentation Index
            </p>
            <nav className="flex flex-col gap-3">
              {sidebarSections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  className="font-mono text-xs text-zinc-500 transition hover:text-amber-400"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-8 lg:col-span-3">
            <section
              id="introduction"
              className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex flex-col gap-3">
                <Badge className="w-fit border-violet-500/20 bg-violet-500/10 font-mono text-xs text-violet-300">
                  Public Knowledge Graph API
                </Badge>
                <h2 className="font-serif text-3xl text-zinc-100">Introduction</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                  MythosGraph API is a public, structured knowledge graph service for mythology entities,
                  folklore traditions, graph relations, and CreatureDex records. It exposes query-first REST
                  endpoints for search, entity details, and relationship traversal.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Base URL</p>
                  <code className="font-mono text-sm text-emerald-400">{API_BASE_URL}</code>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-amber-300">
                    <ShieldAlert className="h-4 w-4" />
                    <p className="font-mono text-[10px] uppercase tracking-widest">Write Access</p>
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">
                    Admin and contributor write pathways require <InlineCode>Authorization: Bearer &lt;token&gt;</InlineCode>.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="rate-limit"
              className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="font-serif text-3xl text-zinc-100">Rate Limit Specs</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                  NFR-SEC-03 limits public endpoint consumption to protect the graph service from burst abuse.
                  Public routes enforce <InlineCode>100 requests per minute per IP address</InlineCode>.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Limit</p>
                  <p className="mt-2 font-serif text-2xl text-zinc-100">100/min</p>
                  <p className="mt-1 font-mono text-xs text-zinc-500">per IP address</p>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-rose-300/80">Breach Status</p>
                  <p className="mt-2 font-mono text-sm text-rose-300">429 Too Many Requests</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300/80">Retry Header</p>
                  <p className="mt-2 font-mono text-sm text-amber-300">Retry-After: &lt;seconds&gt;</p>
                </div>
              </div>
            </section>

            <section
              id="endpoints"
              className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="font-serif text-3xl text-zinc-100">Endpoints Inventory</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                  Core read endpoints are versioned under <InlineCode>/api/v1</InlineCode>. Path values below are displayed relative to the API base URL unless explicitly noted.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
                <Table>
                  <TableHeader className="bg-zinc-900/40">
                    <TableRow className="border-zinc-800">
                      <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Method</TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Endpoint</TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpointInventory.map((endpoint) => (
                      <TableRow
                        key={endpoint.path}
                        className="border-zinc-900 bg-transparent transition-colors hover:bg-zinc-900/30"
                      >
                        <TableCell><MethodBadge method={endpoint.method} /></TableCell>
                        <TableCell className="font-mono text-xs text-zinc-200">{endpoint.path}</TableCell>
                        <TableCell className="text-sm leading-6 text-zinc-400">{endpoint.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section
              id="request-examples"
              className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="font-serif text-3xl text-zinc-100">Request Examples</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                  Use standard HTTP clients with <InlineCode>Accept: application/json</InlineCode>. Mutating admin calls also need <InlineCode>Authorization: Bearer &lt;token&gt;</InlineCode>.
                </p>
              </div>

              <Tabs defaultValue="pathfinding" className="w-full">
                <TabsList className="mb-4 flex h-auto flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
                  {requestExamples.map((example) => (
                    <TabsTrigger
                      key={example.id}
                      value={example.id}
                      className="border border-transparent px-3 py-2 font-mono text-xs text-zinc-500 transition-all duration-200 hover:text-zinc-300 data-[state=active]:border-amber-500/30 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                    >
                      {example.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {requestExamples.map((example) => (
                  <TabsContent key={example.id} value={example.id}>
                    <TextTerminal title={`${example.label} cURL`} value={example.value} />
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            <section
              id="response-examples"
              className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="font-serif text-3xl text-zinc-100">Response Examples</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                  The following payloads mirror the SRS response schema for entity details and BFS graph traversal.
                </p>
              </div>

              <Tabs defaultValue="entity-detail" className="w-full">
                <TabsList className="mb-4 flex h-auto flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
                  {responseExamples.map((example) => (
                    <TabsTrigger
                      key={example.id}
                      value={example.id}
                      className="border border-transparent px-3 py-2 font-mono text-xs text-zinc-500 transition-all duration-200 hover:text-zinc-300 data-[state=active]:border-amber-500/30 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400"
                    >
                      {example.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {responseExamples.map((example) => (
                  <TabsContent key={example.id} value={example.id}>
                    <JsonTerminal title={example.label} value={example.value} />
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            <section
              id="error-format"
              className="scroll-mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
            >
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="font-serif text-3xl text-zinc-100">Standardized Error Format</h2>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                  Section 11 defines a unified error envelope. Clients should parse <InlineCode>status</InlineCode>, <InlineCode>error</InlineCode>, <InlineCode>message</InlineCode>, and <InlineCode>traceId</InlineCode> before applying retry or fallback behavior.
                </p>
              </div>

              <div className="grid gap-5">
                {errorExamples.map((example) => (
                  <article key={example.id} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-serif text-xl text-zinc-100">{example.label}</h3>
                      <Badge className="border-rose-500/20 bg-rose-500/10 font-mono text-xs text-rose-300">
                        {example.label.split(" ")[0]}
                      </Badge>
                    </div>
                    <JsonTerminal title="Error JSON" value={example.value} />
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-xs leading-6 text-amber-200/80">
                  Use the API Playground to test request and error envelopes against the running backend.
                </p>
                <Link
                  href="/playground"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 font-mono text-xs text-amber-300 transition hover:bg-amber-500/20"
                >
                  Open Playground <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
