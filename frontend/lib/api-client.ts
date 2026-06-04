export type ApiErrorPayload = {
  status: number;
  error: string;
  message: string;
  traceId?: string;
  details?: Record<string, string[]>;
};

export class ApiClientError extends Error {
  status: number;
  error: string;
  traceId?: string;
  details?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message || payload.error || "API request failed");
    this.name = "ApiClientError";
    this.status = payload.status;
    this.error = payload.error;
    this.traceId = payload.traceId;
    this.details = payload.details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5098";

type QueryValue = string | number | boolean | null | undefined;

function toQueryString(params?: Record<string, QueryValue>) {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function readErrorPayload(response: Response): Promise<ApiErrorPayload> {
  const fallback: ApiErrorPayload = {
    status: response.status,
    error: response.statusText || "Request failed",
    message: response.statusText || "The backend rejected the request.",
  };

  try {
    const body = (await response.json()) as Partial<ApiErrorPayload> & {
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };

    return {
      status: body.status ?? response.status,
      error: body.error ?? body.title ?? fallback.error,
      message: body.message ?? body.detail ?? body.title ?? fallback.message,
      traceId: body.traceId,
      details: body.details ?? body.errors,
    };
  } catch {
    return fallback;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  // Avoid unnecessary CORS preflight for read-only GET requests.
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiClientError(await readErrorPayload(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type EntityType =
  | "God"
  | "Goddess"
  | "MythFigure"
  | "Hero"
  | "Creature"
  | "Artifact"
  | "Weapon"
  | "Legend"
  | "Pantheon"
  | "Tradition"
  | "Region"
  | "Country"
  | "Domain"
  | "Ritual"
  | "Location"
  | "Concept"
  | "PrimordialDeity"
  | "MythGroup"
  | "Titan"
  | "Personification"
  | "Realm";

export type SortBy = "name" | "type" | "tradition";
export type SortDirection = "asc" | "desc";

export type EntityTraditionDto = {
  slug: string;
  name: string;
};

export type EntityMetadataDto = {
  aliases: string[];
  domains: string[];
  symbols: string[];
  description?: string | null;
};

export type EntityLinksDto = {
  relations: string;
  neighbors: string;
};

export type EntityListItemDto = {
  id: string;
  slug: string;
  name: string;
  entityType: EntityType;
  traditionSlug?: string | null;
  traditionName?: string | null;
  summary?: string | null;
};

export type EntityListResponseDto = {
  page: number;
  pageSize: number;
  totalItems: number;
  items: EntityListItemDto[];
};

export type EntityDetailDto = {
  id: string;
  slug: string;
  name: string;
  entityType: EntityType;
  tradition?: EntityTraditionDto | null;
  summary?: string | null;
  metadata: EntityMetadataDto;
  links: EntityLinksDto;
};

export type EntityRelationItemDto = {
  relationType: string;
  direction: "outgoing" | "incoming" | string;
  counterpartSlug: string;
  counterpartName: string;
};

export type EntityRelationsDto = {
  slug: string;
  name: string;
  relations: EntityRelationItemDto[];
};

export type EntitySourceItemDto = {
  id: string;
  slug?: string | null;
  title: string;
  author?: string | null;
  sourceType: string;
  url?: string | null;
  publicationYear?: number | null;
  language?: string | null;
  licenseNote?: string | null;
  notes?: string | null;
  usage?: string | null;
};

export type EntitySourcesDto = {
  slug: string;
  name: string;
  sources: EntitySourceItemDto[];
};

export type ExploreEntity = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  type: EntityType;
  tradition: string;
  traditionSlug: string;
  domain: string;
};

export type EntityQueryResponse = {
  data: ExploreEntity[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type EntityListQuery = {
  search?: string;
  q?: string;
  type?: string;
  tradition?: string;
  domain?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SortBy;
  sortDirection?: SortDirection;
};

export type EntityDetail = {
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
    description?: string;
  };
};

export type EntityRelation = {
  relationType: string;
  targetName: string;
  targetSlug: string;
  direction: "outgoing" | "incoming";
};

export type EntityRelationsResponse = {
  sourceSlug: string;
  relations: EntityRelation[];
  neighbors: EntityRelation[];
};

export type EntitySource = {
  id: string;
  slug?: string;
  title: string;
  author: string;
  sourceType: string;
  url?: string;
  publicationYear: number;
  language?: string;
  licenseNote?: string;
  notes: string;
  usage?: string;
};

export type HomeStats = {
  entities: number;
  relations: number;
  traditions: number;
};

export type GraphPathStep = {
  from: string;
  fromName: string;
  relation: string;
  to: string;
  toName: string;
};

export type GraphPathResponse = {
  from: { slug: string; name: string };
  to: { slug: string; name: string };
  pathFound: boolean;
  distance: number;
  path: GraphPathStep[];
};

type GraphPathNodeDto = {
  id?: string;
  slug: string;
  name: string;
  entityType?: EntityType;
};

type GraphPathEdgeDto = {
  id?: string;
  sourceSlug: string;
  targetSlug: string;
  relationType: string;
};

type GraphPathBackendResponseDto = {
  from: string | { slug: string; name: string };
  to: string | { slug: string; name: string };
  distance?: number | null;
  pathFound?: boolean;
  path?: Array<{ from: string; relation: string; to: string }>;
  nodes?: GraphPathNodeDto[];
  edges?: GraphPathEdgeDto[];
};

export type ApiSnapshot = {
  id: string;
  path: string;
  response: Record<string, unknown>;
};

function normalizeListItem(item: EntityListItemDto): ExploreEntity {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    summary: item.summary ?? "No summary has been indexed for this entity yet.",
    type: item.entityType,
    tradition: item.traditionName ?? item.traditionSlug ?? "Unknown Tradition",
    traditionSlug: item.traditionSlug ?? "unknown-tradition",
    domain: "Unknown",
  };
}

function normalizeEntityDetail(dto: EntityDetailDto): EntityDetail {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    entityType: dto.entityType,
    tradition: dto.tradition?.name ?? "Unknown Tradition",
    traditionId: dto.tradition?.slug ?? "unknown-tradition",
    status: "canonical",
    summary:
      dto.summary ?? dto.metadata.description ?? "No summary has been indexed for this entity yet.",
    createdAt: new Date(0).toISOString(),
    apiStatusCode: 200,
    metadata: {
      domains: dto.metadata.domains ?? [],
      alignment: dto.metadata.symbols?.[0],
      description: dto.metadata.description ?? undefined,
    },
  };
}

function normalizeRelations(dto: EntityRelationsDto): EntityRelationsResponse {
  const relations = dto.relations.map((item) => ({
    relationType: item.relationType,
    targetName: item.counterpartName,
    targetSlug: item.counterpartSlug,
    direction: item.direction === "incoming" ? "incoming" : "outgoing",
  } satisfies EntityRelation));

  return {
    sourceSlug: dto.slug,
    relations,
    neighbors: relations,
  };
}

function normalizeSources(dto: EntitySourcesDto): EntitySource[] {
  return dto.sources.map((source) => ({
    id: source.id,
    slug: source.slug ?? undefined,
    title: source.title,
    author: source.author ?? "Unknown author",
    sourceType: source.sourceType,
    url: source.url ?? undefined,
    publicationYear: source.publicationYear ?? 0,
    language: source.language ?? undefined,
    licenseNote: source.licenseNote ?? undefined,
    notes: source.notes ?? source.usage ?? source.licenseNote ?? "Metadata-only citation record.",
    usage: source.usage ?? undefined,
  }));
}

export async function listEntities(params: EntityListQuery): Promise<EntityQueryResponse> {
  const query = toQueryString({
    search: params.search,
    q: params.q ?? params.search,
    type: params.type,
    tradition: params.tradition,
    domain: params.domain,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
  });

  const response = await apiRequest<EntityListResponseDto>(`/api/v1/entities${query}`);
  const items = response.items.map(normalizeListItem);
  const totalPages = Math.max(1, Math.ceil(response.totalItems / response.pageSize));

  return {
    data: items,
    meta: {
      total: response.totalItems,
      page: response.page,
      pageSize: response.pageSize,
      totalPages,
    },
  };
}

export async function getEntityDetail(slug: string): Promise<EntityDetail> {
  const dto = await apiRequest<EntityDetailDto>(`/api/v1/entities/${encodeURIComponent(slug)}`);
  return normalizeEntityDetail(dto);
}

export async function getEntityRelations(slug: string): Promise<EntityRelationsResponse> {
  const dto = await apiRequest<EntityRelationsDto>(
    `/api/v1/entities/${encodeURIComponent(slug)}/relations`
  );
  return normalizeRelations(dto);
}

export async function getEntitySources(slug: string): Promise<EntitySource[]> {
  const dto = await apiRequest<EntitySourcesDto>(
    `/api/v1/entities/${encodeURIComponent(slug)}/sources`
  );
  return normalizeSources(dto);
}

export async function getHomeStats(): Promise<HomeStats> {
  const response = await apiRequest<EntityListResponseDto>("/api/v1/entities?page=1&pageSize=100");
  const traditions = new Set(
    response.items.map((item) => item.traditionSlug).filter(Boolean) as string[]
  );

  const relationResults = await Promise.allSettled(
    response.items.map((item) => getEntityRelations(item.slug))
  );

  const relations = relationResults.reduce((total, result) => {
    if (result.status !== "fulfilled") {
      return total;
    }

    return total + result.value.relations.length;
  }, 0);

  return {
    entities: response.totalItems,
    relations,
    traditions: traditions.size,
  };
}

function toEndpoint(value: string | { slug: string; name: string }, names: Map<string, string>) {
  if (typeof value === "string") {
    return { slug: value, name: names.get(value) ?? value };
  }

  return value;
}

function normalizeGraphPath(dto: GraphPathBackendResponseDto): GraphPathResponse {
  const names = new Map<string, string>();
  dto.nodes?.forEach((node) => names.set(node.slug, node.name));

  if (dto.path) {
    const from = toEndpoint(dto.from, names);
    const to = toEndpoint(dto.to, names);

    return {
      from,
      to,
      pathFound: dto.pathFound ?? dto.path.length > 0,
      distance: dto.distance ?? dto.path.length,
      path: dto.path.map((step) => ({
        ...step,
        fromName: names.get(step.from) ?? step.from,
        toName: names.get(step.to) ?? step.to,
      })),
    };
  }

  const edges = dto.edges ?? [];
  const from = toEndpoint(dto.from, names);
  const to = toEndpoint(dto.to, names);

  return {
    from,
    to,
    pathFound: edges.length > 0,
    distance: dto.distance ?? edges.length,
    path: edges.map((edge) => ({
      from: edge.sourceSlug,
      fromName: names.get(edge.sourceSlug) ?? edge.sourceSlug,
      relation: edge.relationType,
      to: edge.targetSlug,
      toName: names.get(edge.targetSlug) ?? edge.targetSlug,
    })),
  };
}

export async function findGraphPath(params: {
  from: string;
  to: string;
  maxDepth: number;
}): Promise<GraphPathResponse> {
  const query = toQueryString({
    from: params.from,
    to: params.to,
    maxDepth: Math.min(Math.max(params.maxDepth, 1), 6),
  });

  try {
    const response = await apiRequest<GraphPathBackendResponseDto>(`/api/v1/graph/path${query}`);
    return normalizeGraphPath(response);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return {
        from: { slug: params.from, name: params.from },
        to: { slug: params.to, name: params.to },
        pathFound: false,
        distance: 0,
        path: [],
      };
    }

    throw error;
  }
}

function shuffleItems<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function getRandomEntitySnapshots(count = 5): Promise<ApiSnapshot[]> {
  const response = await apiRequest<EntityListResponseDto>("/api/v1/entities?page=1&pageSize=100");

  if (response.items.length === 0) {
    throw new ApiClientError({
      status: 404,
      error: "No entities available",
      message: "The API returned no entities for the snapshot workspace.",
    });
  }

  const randomEntities = shuffleItems(response.items).slice(0, Math.min(count, response.items.length));
  const details = await Promise.all(
    randomEntities.map((entity) =>
      apiRequest<EntityDetailDto>(`/api/v1/entities/${encodeURIComponent(entity.slug)}`)
    )
  );

  return randomEntities.map((entity, index) => ({
    id: `entity-${entity.slug}`,
    path: `GET /entities/${entity.slug}`,
    response: details[index] as unknown as Record<string, unknown>,
  }));
}

export const apiClientConfig = {
  baseUrl: API_BASE_URL,
};
