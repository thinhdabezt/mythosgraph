"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApiClientError,
  listEntities,
  type EntityQueryResponse,
  type EntityType,
  type SortBy,
  type SortDirection,
} from "@/lib/api-client";

const PAGE_SIZE = 5;

const ENTITY_TYPES: EntityType[] = [
  "God",
  "Goddess",
  "MythFigure",
  "Hero",
  "Creature",
  "Artifact",
  "Weapon",
  "Legend",
];

const DOMAINS = ["Mountain", "Earth", "Water", "Sky", "Thunder"];

type SelectOption = {
  value: string;
  label: string;
};

const SELECT_TRIGGER_CLASS =
  "w-full lg:w-[165px] bg-zinc-900/50 border-zinc-800 text-zinc-300 font-mono text-xs h-10 px-3 pr-8 relative transition-all duration-200 hover:bg-zinc-800/50 hover:text-zinc-100 text-left rounded-lg focus:ring-1 focus:ring-amber-500/30";

const SELECT_CONTENT_CLASS =
  "bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs rounded-lg shadow-xl backdrop-blur-md min-w-[165px]";

const SELECT_ITEM_CLASS =
  "focus:bg-amber-500/10 focus:text-amber-400 text-zinc-400 cursor-pointer transition-colors py-2 rounded-md font-mono text-xs data-[selected]:text-amber-400 data-[selected]:bg-amber-500/5";

const SORT_LABELS: Record<`${SortBy}|${SortDirection}`, string> = {
  "name|asc": "Sort: Name (A-Z)",
  "name|desc": "Sort: Name (Z-A)",
  "type|asc": "Sort: Type (A-Z)",
  "type|desc": "Sort: Type (Z-A)",
  "tradition|asc": "Sort: Tradition (A-Z)",
  "tradition|desc": "Sort: Tradition (Z-A)",
};

const TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Types" },
  ...ENTITY_TYPES.map((type) => ({
    value: type,
    label: type === "MythFigure" ? "Myth Figure" : type,
  })),
];

const TRADITION_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Traditions" },
  { value: "vietnamese-folklore", label: "Vietnamese Folklore" },
  { value: "greek-mythology", label: "Greek Mythology" },
  { value: "norse-mythology", label: "Norse Mythology" },
];

const DOMAIN_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Domains" },
  ...DOMAINS.map((item) => ({ value: item, label: item })),
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "name|asc", label: SORT_LABELS["name|asc"] },
  { value: "name|desc", label: SORT_LABELS["name|desc"] },
  { value: "type|asc", label: SORT_LABELS["type|asc"] },
  { value: "tradition|asc", label: SORT_LABELS["tradition|asc"] },
];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function getEntityBadgeClass(type: EntityType): string {
  if (type === "God" || type === "Goddess") {
    return "border-violet-500/20 bg-violet-500/10 text-violet-400";
  }

  if (type === "Creature") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (type === "Artifact" || type === "Weapon") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  return "border-zinc-700/50 bg-zinc-800/50 text-zinc-400";
}

function ExplorePageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [entityType, setEntityType] = useState<string>("all");
  const [tradition, setTradition] = useState<string>("all");
  const [domain, setDomain] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useQuery<EntityQueryResponse, ApiClientError>({
    queryKey: [
      "explore-entities",
      debouncedSearch,
      entityType,
      tradition,
      domain,
      page,
      sortBy,
      sortDirection,
    ],
    queryFn: () =>
      listEntities({
        search: debouncedSearch,
        q: debouncedSearch,
        type: entityType,
        tradition,
        domain,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDirection,
      }),
    placeholderData: (previousData) => previousData,
  });

  const entities = query.data?.data ?? [];
  const meta =
    query.data?.meta ?? ({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 } as const);

  const hasActiveFilters =
    search.trim().length > 0 ||
    entityType !== "all" ||
    tradition !== "all" ||
    domain !== "all" ||
    sortBy !== "name" ||
    sortDirection !== "asc";

  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1);

  const handleSortChange = (value: string) => {
    const [nextSortBy, nextSortDirection] = value.split("|") as [SortBy, SortDirection];
    setSortBy(nextSortBy);
    setSortDirection(nextSortDirection);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setEntityType("all");
    setTradition("all");
    setDomain("all");
    setSortBy("name");
    setSortDirection("asc");
    setPage(1);
  };

  const sortByDirection = `${sortBy}|${sortDirection}` as `${SortBy}|${SortDirection}`;
  const filterConfigs = [
    {
      id: "type",
      value: entityType,
      setValue: (value: string) => {
        setEntityType(value);
        setPage(1);
      },
      placeholder: "All Types",
      options: TYPE_OPTIONS,
    },
    {
      id: "tradition",
      value: tradition,
      setValue: (value: string) => {
        setTradition(value);
        setPage(1);
      },
      placeholder: "All Traditions",
      options: TRADITION_OPTIONS,
    },
    {
      id: "domain",
      value: domain,
      setValue: (value: string) => {
        setDomain(value);
        setPage(1);
      },
      placeholder: "All Domains",
      options: DOMAIN_OPTIONS,
    },
    {
      id: "sort",
      value: sortByDirection,
      setValue: handleSortChange,
      placeholder: "Sort: Name (A-Z)",
      options: SORT_OPTIONS,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 space-y-2">
          <Link
            href="/"
            className="group mb-4 inline-flex items-center gap-2 font-mono text-xs text-zinc-500 transition-colors hover:text-amber-400"
          >
            <span className="transform transition-transform group-hover:-translate-x-1">←</span>
            Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl">Explore Mythology Data Grid</h1>
          <p className="text-sm text-zinc-400">Found {meta.total} entities</p>
        </header>

        <section className="mb-6 grid gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search entities..."
              className="border-zinc-700 bg-zinc-900/70 pl-9 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 lg:col-span-8 lg:w-auto">
            {filterConfigs.map((config) => (
              <Select
                key={config.id}
                onValueChange={(value) => {
                  if (value) {
                    config.setValue(value);
                  }
                }}
                value={config.value}
              >
                <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                  <span className="truncate">
                    {config.value === "all" || config.value === ""
                      ? config.placeholder
                      : config.options.find((opt) => opt.value === config.value)?.label ||
                        config.value}
                  </span>
                </SelectTrigger>

                <SelectContent className={SELECT_CONTENT_CLASS}>
                  {config.options.map((opt) => (
                    <SelectItem
                      className={SELECT_ITEM_CLASS}
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {hasActiveFilters ? (
            <div className="ml-auto lg:col-span-12">
              <Button
                variant="ghost"
                className="h-auto p-0 font-mono text-xs text-zinc-400 hover:bg-transparent hover:text-zinc-200"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          ) : null}
        </section>

        <section className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/20">
          {query.isError ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
              <p className="text-sm text-rose-300">Unable to load entities right now. Please try again.</p>
            </div>
          ) : null}

          <Table>
            <TableHeader className="bg-zinc-900/30">
              <TableRow className="border-zinc-900">
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Name</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Type</TableHead>
                <TableHead className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Tradition</TableHead>
                <TableHead className="text-right font-mono text-[11px] uppercase tracking-wider text-zinc-500">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="border-zinc-900 bg-transparent">
                      <TableCell>
                        <Skeleton className="mb-2 h-4 w-40 bg-zinc-800" />
                        <Skeleton className="h-3 w-64 bg-zinc-900" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <div className="ml-auto w-24">
                          <Skeleton className="h-4 w-full bg-zinc-800" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {!query.isLoading && entities.length === 0 ? (
                <TableRow className="border-zinc-900">
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-zinc-500">
                    No entities match your filters.
                  </TableCell>
                </TableRow>
              ) : null}

              {!query.isLoading
                ? entities.map((entity) => (
                    <TableRow
                      key={entity.id}
                      className="border-b border-l-2 border-l-transparent border-zinc-900 bg-transparent transition-all duration-200 hover:border-l-amber-500/50 hover:border-zinc-700/50 hover:bg-zinc-900/30"
                    >
                      <TableCell>
                        <p className="font-serif text-base font-semibold text-zinc-100">{entity.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{entity.summary}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getEntityBadgeClass(entity.type)}>
                          {entity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/traditions/${entity.traditionSlug}`}
                          className="text-sm text-violet-300 transition hover:text-amber-300"
                        >
                          {entity.tradition}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/entities/${entity.slug}`}
                          className="font-mono text-xs text-zinc-400 transition-colors duration-200 hover:text-amber-400"
                        >
                          View Details -&gt;
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/20 px-3 py-2">
          <Button
            variant="outline"
            disabled={meta.page === 1}
            className="border-zinc-700 bg-zinc-900/60"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`rounded-md border px-2.5 py-1 text-xs font-mono transition ${
                  pageNumber === meta.page
                    ? "border border-amber-500/30 bg-amber-500/10 font-mono text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                    : "border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={meta.page >= meta.totalPages}
            className="border-zinc-700 bg-zinc-900/60"
            onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
          >
            Next
          </Button>
        </section>
      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Skeleton className="mb-6 h-10 w-80 bg-zinc-800" />
            <Skeleton className="h-[520px] rounded-xl bg-zinc-900" />
          </div>
        </main>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
