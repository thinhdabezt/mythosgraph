"use client";

import Link from "next/link";
import { useState } from "react";
import { Clipboard, Loader2, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ApiClientError, apiRequest } from "@/lib/api-client";
import type { ReactNode } from "react";

type EndpointId = "entity" | "search" | "graphPath" | "listCreatures" | "creatureDetail";
type ParamKind = "text" | "number" | "select";

type ParamConfig = {
  key: string;
  label: string;
  kind: ParamKind;
  placeholder?: string;
  options?: string[];
};

type EndpointConfig = {
  id: EndpointId;
  label: string;
  method: "GET";
  path: string;
  description: string;
  params: ParamConfig[];
};

type RequestState = {
  status: "idle" | "success" | "error";
  statusText: string;
  latencyMs?: number;
  payload?: unknown;
};

const ENDPOINTS: EndpointConfig[] = [
  {
    id: "entity",
    label: "GET Entity by Slug",
    method: "GET",
    path: "/api/v1/entities/{slug}",
    description: "Fetch a canonical mythology entity detail payload.",
    params: [{ key: "slug", label: "Slug", kind: "text", placeholder: "zeus" }],
  },
  {
    id: "search",
    label: "Search Entities",
    method: "GET",
    path: "/api/v1/search?q={keyword}&type={type}",
    description: "Search indexed names, translations, and aliases.",
    params: [
      { key: "q", label: "Keyword", kind: "text", placeholder: "thor" },
      {
        key: "type",
        label: "Type",
        kind: "select",
        options: ["All", "Creature", "God", "Goddess", "MythFigure", "Artifact"],
      },
    ],
  },
  {
    id: "graphPath",
    label: "Find Graph Path",
    method: "GET",
    path: "/api/v1/graph/path?from={slug}&to={slug}&maxDepth={depth}",
    description: "Trace a path between two graph nodes.",
    params: [
      { key: "from", label: "From", kind: "text", placeholder: "zeus" },
      { key: "to", label: "To", kind: "text", placeholder: "cronus" },
      { key: "maxDepth", label: "Max Depth", kind: "number", placeholder: "4" },
    ],
  },
  {
    id: "listCreatures",
    label: "List Creatures",
    method: "GET",
    path: "/api/v1/creatures?habitat={habitat}&dangerLevel={level}",
    description: "CreatureDex list sandbox until the API module is fully active.",
    params: [
      { key: "habitat", label: "Habitat", kind: "select", options: ["All", "River", "Pond", "Cave", "Mountain", "Forest", "Swamp"] },
      { key: "dangerLevel", label: "Danger Level", kind: "select", options: ["All", "Unknown", "Low", "Medium", "High", "Extreme"] },
    ],
  },
  {
    id: "creatureDetail",
    label: "Get Creature Detail",
    method: "GET",
    path: "/api/v1/creatures/{slug}",
    description: "CreatureDex detail sandbox response.",
    params: [{ key: "slug", label: "Slug", kind: "text", placeholder: "ma-da" }],
  },
];

const DEFAULT_PARAMS: Record<EndpointId, Record<string, string>> = {
  entity: { slug: "zeus" },
  search: { q: "thor", type: "All" },
  graphPath: { from: "zeus", to: "cronus", maxDepth: "4" },
  listCreatures: { habitat: "All", dangerLevel: "All" },
  creatureDetail: { slug: "ma-da" },
};

const MOCK_CREATURES = [
  {
    slug: "ma-da",
    name: "Ma Da",
    tradition: "Vietnamese Folklore",
    classification: { primaryType: "Spirit", subTypes: ["Water Spirit", "Ghost"] },
    dangerLevel: "Medium",
    habitats: ["River", "Pond"],
    summary: "A water-associated spirit in Vietnamese folklore.",
  },
  {
    slug: "hydra",
    name: "Hydra",
    tradition: "Greek Mythology",
    classification: { primaryType: "Monster", subTypes: ["Serpent", "Regenerating Beast"] },
    dangerLevel: "High",
    habitats: ["Swamp", "Cave"],
    summary: "A multi-headed monster whose severed heads regenerate.",
  },
];

const SELECT_TRIGGER_CLASS =
  "h-10 w-full border-zinc-800 bg-zinc-950/60 px-3 pr-8 font-mono text-xs text-zinc-300 transition hover:bg-zinc-900/80 focus:ring-1 focus:ring-amber-500/30";
const SELECT_CONTENT_CLASS =
  "min-w-[260px] border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 shadow-xl";
const SELECT_ITEM_CLASS =
  "cursor-pointer rounded-md py-2 font-mono text-xs text-zinc-400 transition-colors focus:bg-amber-500/10 focus:text-amber-400";

function getRequestTimestamp() {
  return Date.now();
}

function clampMaxDepth(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "4";
  }

  return String(Math.min(Math.max(parsed, 1), 6));
}

function renderJson(value: unknown, indent = 0): ReactNode {
  const pad = "  ".repeat(indent);
  const nextPad = "  ".repeat(indent + 1);

  if (value === null) return <span className="text-zinc-500">null</span>;
  if (typeof value === "string") return <span className="text-emerald-400">&quot;{value}&quot;</span>;
  if (typeof value === "number") return <span className="text-amber-400">{value}</span>;
  if (typeof value === "boolean") return <span className="text-sky-400">{String(value)}</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>;
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
    if (entries.length === 0) return <span>{"{}"}</span>;
    return (
      <>
        <span>{"{"}</span>
        {entries.map(([key, item], index) => (
          <div key={`${indent}-obj-${key}`}>
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

function getParam(params: Record<string, string>, key: string) {
  return params[key]?.trim() ?? "";
}

function buildPath(endpoint: EndpointConfig, params: Record<string, string>) {
  if (endpoint.id === "entity") {
    return `/api/v1/entities/${encodeURIComponent(getParam(params, "slug"))}`;
  }

  if (endpoint.id === "search") {
    const query = new URLSearchParams();
    query.set("q", getParam(params, "q"));
    if (getParam(params, "type") && getParam(params, "type") !== "All") {
      query.set("type", getParam(params, "type"));
    }
    return `/api/v1/search?${query.toString()}`;
  }

  if (endpoint.id === "graphPath") {
    const query = new URLSearchParams({
      from: getParam(params, "from"),
      to: getParam(params, "to"),
      maxDepth: clampMaxDepth(getParam(params, "maxDepth") || "4"),
    });
    return `/api/v1/graph/path?${query.toString()}`;
  }

  if (endpoint.id === "listCreatures") {
    const query = new URLSearchParams();
    if (getParam(params, "habitat") !== "All") query.set("habitat", getParam(params, "habitat"));
    if (getParam(params, "dangerLevel") !== "All") query.set("dangerLevel", getParam(params, "dangerLevel"));
    return `/api/v1/creatures?${query.toString()}`;
  }

  return `/api/v1/creatures/${encodeURIComponent(getParam(params, "slug"))}`;
}

async function executeEndpoint(endpoint: EndpointConfig, params: Record<string, string>) {
  const path = buildPath(endpoint, params);

  if (endpoint.id === "listCreatures") {
    const habitat = getParam(params, "habitat");
    const dangerLevel = getParam(params, "dangerLevel");
    const filtered = MOCK_CREATURES.filter((creature) => {
      const matchesHabitat = habitat === "All" || creature.habitats.includes(habitat);
      const matchesDanger = dangerLevel === "All" || creature.dangerLevel === dangerLevel;
      return matchesHabitat && matchesDanger;
    });

    return {
      request: { method: endpoint.method, path },
      data: filtered,
      pagination: { page: 1, pageSize: 20, totalItems: filtered.length, totalPages: 1 },
    };
  }

  if (endpoint.id === "creatureDetail") {
    const slug = getParam(params, "slug") || "ma-da";
    const creature = MOCK_CREATURES.find((item) => item.slug === slug) ?? MOCK_CREATURES[0];
    return { request: { method: endpoint.method, path }, ...creature };
  }

  const data = await apiRequest<unknown>(path);
  return { request: { method: endpoint.method, path }, response: data };
}

function toErrorPayload(error: unknown) {
  if (error instanceof ApiClientError) {
    return {
      status: error.status,
      error: error.error,
      message: error.message,
      traceId: error.traceId,
      details: error.details,
    };
  }

  return {
    status: 0,
    error: error instanceof Error ? error.name : "RequestError",
    message: error instanceof Error ? error.message : "Request failed",
  };
}

export default function PlaygroundPage() {
  const [endpointId, setEndpointId] = useState<EndpointId>("entity");
  const [paramsByEndpoint, setParamsByEndpoint] = useState(DEFAULT_PARAMS);
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle", statusText: "Idle" });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoint = ENDPOINTS.find((item) => item.id === endpointId) ?? ENDPOINTS[0];
  const params = paramsByEndpoint[endpoint.id];

  const setParam = (key: string, value: string) => {
    setParamsByEndpoint((current) => ({
      ...current,
      [endpoint.id]: {
        ...current[endpoint.id],
        [key]: value,
      },
    }));
  };

  const handleSend = async () => {
    setIsLoading(true);
    const startedAt = getRequestTimestamp();

    try {
      const payload = await executeEndpoint(endpoint, params);
      setRequestState({
        status: "success",
        statusText: "Status: 200 OK",
        latencyMs: getRequestTimestamp() - startedAt,
        payload,
      });
    } catch (error) {
      const payload = toErrorPayload(error);
      setRequestState({
        status: "error",
        statusText: payload.status ? `Status: ${payload.status} ${payload.error}` : "Status: Error",
        latencyMs: getRequestTimestamp() - startedAt,
        payload,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!requestState.payload) return;
    await navigator.clipboard.writeText(JSON.stringify(requestState.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(139,92,246,0.20),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.14),transparent_32%)]" />

      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="group mb-4 inline-flex items-center gap-2 font-mono text-xs text-zinc-500 transition-colors hover:text-amber-400"
        >
          <span className="transform transition-transform group-hover:-translate-x-1">←</span>
          Back to Dashboard
        </Link>

        <header className="space-y-3">
          <h1 className="font-serif text-4xl text-zinc-50 sm:text-5xl">API Interactive Playground</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">
            Test live HTTP request targets and inspect structural mythology JSON payloads in real-time.
          </p>
        </header>

        <section className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md lg:col-span-1">
            <div className="space-y-2">
              <label className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Endpoint</label>
              <Select
                value={endpoint.id}
                onValueChange={(value) => {
                  if (value) setEndpointId(value as EndpointId);
                }}
              >
                <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                  <span className="truncate">
                    <span className="font-bold text-emerald-400">GET</span> {endpoint.label}
                  </span>
                </SelectTrigger>
                <SelectContent className={SELECT_CONTENT_CLASS}>
                  {ENDPOINTS.map((item) => (
                    <SelectItem key={item.id} value={item.id} className={SELECT_ITEM_CLASS}>
                      <span className="font-bold text-emerald-400">{item.method}</span>
                      <span>{item.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="font-mono text-[11px] leading-relaxed text-zinc-600">{endpoint.description}</p>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-950/30 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Parameters</p>
              {endpoint.params.map((param) => (
                <div key={param.key} className="space-y-2">
                  <label className="font-mono text-xs text-zinc-500">{param.label}</label>
                  {param.kind === "select" ? (
                    <Select
                      value={params[param.key] ?? param.options?.[0] ?? ""}
                      onValueChange={(value) => {
                        if (value) setParam(param.key, value);
                      }}
                    >
                      <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                        <span className="truncate">{params[param.key] ?? param.options?.[0]}</span>
                      </SelectTrigger>
                      <SelectContent className={SELECT_CONTENT_CLASS}>
                        {param.options?.map((option) => (
                          <SelectItem key={option} value={option} className={SELECT_ITEM_CLASS}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={param.kind === "number" ? "number" : "text"}
                      value={params[param.key] ?? ""}
                      onChange={(event) =>
                        setParam(
                          param.key,
                          param.key === "maxDepth"
                            ? clampMaxDepth(event.target.value)
                            : event.target.value
                        )
                      }
                      placeholder={param.placeholder}
                      className="h-10 border-zinc-800 bg-zinc-950/50 font-mono text-xs text-zinc-200 focus-visible:ring-amber-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 font-mono text-[11px] text-zinc-500">
              {endpoint.method} {buildPath(endpoint, params)}
            </div>

            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="h-11 w-full border border-amber-500/30 bg-amber-500/10 font-mono text-xs text-amber-300 transition hover:bg-amber-500/20 hover:text-amber-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Request
            </Button>
          </div>

          <div className="flex min-h-[500px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </span>
                <Badge
                  variant="outline"
                  className={`border-zinc-800 bg-zinc-900/70 font-mono text-[11px] ${
                    requestState.status === "success"
                      ? "text-emerald-400"
                      : requestState.status === "error"
                        ? "text-rose-400"
                        : "text-zinc-500"
                  }`}
                >
                  {requestState.statusText}
                  {requestState.latencyMs ? ` • ${requestState.latencyMs}ms` : ""}
                </Badge>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!requestState.payload}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-2.5 py-1.5 font-mono text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Clipboard className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <pre className="font-mono text-xs leading-6 text-zinc-200">
                {requestState.payload ? (
                  renderJson(requestState.payload)
                ) : (
                  <span className="text-zinc-600">
                    {"// Select an endpoint configuration and trigger Send Request to log backend network wireframes."}
                  </span>
                )}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
