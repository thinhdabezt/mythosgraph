
---

# Software Requirements Specification

## Project: MythosGraph API + CreatureDex Module

## Version: 1.0

---

# 1. Introduction

## 1.1 Purpose

Tài liệu này mô tả yêu cầu phần mềm cho **MythosGraph API**, một public API cung cấp dữ liệu có cấu trúc về thần thoại, truyền thuyết, sinh vật dân gian, nhân vật huyền thoại, artifact, pantheon, region, tradition và quan hệ giữa chúng.

Hệ thống được thiết kế theo hướng **API-first**. Người dùng chính là developer, học sinh/sinh viên, người làm nội dung, writer, worldbuilder, game designer hoặc bất kỳ ai muốn truy vấn dữ liệu mythology/folklore dưới dạng có cấu trúc.

Điểm cốt lõi:

```text
Mythology Graph là nền móng.
CreatureDex là module mở rộng dựa trên dữ liệu Creature trong Graph.
```

---

## 1.2 Product Scope

Hệ thống sẽ cung cấp:

```text
- Public REST API cho mythology/folklore entities
- Knowledge graph giữa các entities
- Search/filter/pagination
- Pathfinding giữa hai entities
- Taxonomy cho entity type, creature type, domain, region, tradition
- Source/citation metadata
- Admin API để quản trị dữ liệu
- CreatureDex module để tra cứu creature/monster/spirit/ghost/beast
```

Hệ thống **không tập trung vào ảnh/video/audio** trong MVP. Dữ liệu chủ yếu là text metadata, relationship và classification.

---

## 1.3 Intended Audience

Tài liệu này dành cho:

```text
- Backend developer
- Frontend developer
- Database designer
- Project owner
- Tester
- Technical reviewer
- Người dùng project để đưa vào portfolio/CV
```

---

## 1.4 Definitions

| Thuật ngữ    | Ý nghĩa                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| Entity       | Một đối tượng trong hệ thống, ví dụ Thor, Mjolnir, Ma Da, Zeus, Sơn Tinh.         |
| Graph Entity | Entity có thể tham gia quan hệ graph.                                             |
| Relation     | Quan hệ có hướng giữa 2 entity. Ví dụ Thor `wields` Mjolnir.                      |
| Tradition    | Hệ thống văn hóa/thần thoại/dân gian. Ví dụ Vietnamese Folklore, Greek Mythology. |
| Creature     | Entity thuộc nhóm sinh vật siêu nhiên, monster, ghost, spirit, beast.             |
| CreatureDex  | Module chuyên tra cứu creature.                                                   |
| Taxonomy     | Hệ phân loại. Ví dụ Spirit > Water Spirit.                                        |
| Source       | Nguồn tham khảo hoặc ghi chú nguồn dữ liệu.                                       |
| Pathfinding  | Chức năng tìm đường quan hệ ngắn nhất giữa 2 entity.                              |

---

# 2. Overall Description

## 2.1 Product Perspective

MythosGraph API là một hệ thống public API độc lập. Có thể có frontend documentation site đi kèm, nhưng sản phẩm chính là API.

Kiến trúc đề xuất:

```text
Client / Docs Site / API Consumer
        |
        v
ASP.NET Core Web API
        |
        v
Application Layer
        |
        v
Domain Layer
        |
        v
PostgreSQL Database
```

Trong tương lai có thể thêm:

```text
Redis cache
Full-text search engine
Graph visualization frontend
API key dashboard
Neo4j nếu graph query phức tạp
```

Nhưng MVP nên dùng **PostgreSQL trước** để tránh over-engineering.

---

## 2.2 Product Functions

Các chức năng chính:

```text
1. Tra cứu entity thần thoại/dân gian
2. Tìm kiếm entity theo keyword
3. Lọc entity theo type, tradition, domain, region
4. Xem relation của entity
5. Tìm đường quan hệ giữa hai entity
6. Quản lý tradition/pantheon/region/source
7. Quản lý taxonomy
8. Tra cứu CreatureDex
9. Lọc creature theo type, habitat, danger level, tradition
10. Admin CRUD dữ liệu
11. API documentation bằng Swagger/OpenAPI
```

---

## 2.3 User Classes

| User class     | Mô tả                                                        |
| -------------- | ------------------------------------------------------------ |
| Public Visitor | Người dùng đọc docs hoặc gọi public API không cần đăng nhập. |
| Developer      | Người tích hợp API vào app khác.                             |
| Admin          | Người quản trị dữ liệu entity, relation, source, taxonomy.   |
| Contributor    | Người đề xuất dữ liệu mới, cần duyệt trước khi publish.      |
| Reviewer       | Người kiểm tra và approve dữ liệu contributor gửi.           |

MVP có thể chỉ cần:

```text
Public User
Admin
```

Contributor/Reviewer để phase sau.

---

## 2.4 Operating Environment

Backend:

```text
- ASP.NET Core 8 Web API
- PostgreSQL
- Entity Framework Core
- Swagger/OpenAPI
- Docker optional
```

Frontend docs:

```text
- Next.js hoặc React
- Hoặc chỉ dùng Swagger UI trong MVP
```

Deployment:

```text
- Backend: Render / Railway / Fly.io / VPS
- Database: Supabase Postgres / Render Postgres / Railway Postgres
- Frontend docs: Vercel / Netlify
```

---

# 3. Product Goals

## 3.1 Main Goals

| ID   | Goal                                                             |
| ---- | ---------------------------------------------------------------- |
| G-01 | Xây dựng một public API có cấu trúc cho mythology/folklore data. |
| G-02 | Cho phép mô hình hóa quan hệ giữa các entity bằng graph.         |
| G-03 | Cho phép mở rộng CreatureDex mà không phải viết lại data model.  |
| G-04 | Cung cấp search/filter/pathfinding rõ ràng cho developer.        |
| G-05 | Dễ deploy, chi phí thấp, phù hợp portfolio backend ASP.NET.      |

---

## 3.2 Non-goals trong MVP

MVP **không** làm:

```text
- Không host video/audio
- Không xây full frontend phức tạp
- Không làm user-generated content public ngay
- Không làm AI auto-generate lore
- Không dùng Neo4j ngay từ đầu
- Không làm toàn bộ thần thoại thế giới
- Không lưu full text dài từ sách/tài liệu có bản quyền
```

---

# 4. System Scope

## 4.1 In Scope

```text
- Entity management
- Relation management
- Tradition management
- Taxonomy management
- Source metadata
- Public query API
- Graph pathfinding
- Search/filter/pagination
- CreatureDex module
- Admin authentication
- Swagger docs
```

## 4.2 Out of Scope for MVP

```text
- Payment
- User forum
- Comment system
- Real-time collaboration
- AI chatbot
- Mobile app
- Media-heavy CDN
- Multi-language full localization
```

---

# 5. System Architecture

## 5.1 Recommended Backend Architecture

Dùng Clean Architecture:

```text
MythosGraph.Api
- Controllers
- Middlewares
- Swagger
- Authentication setup

MythosGraph.Application
- Use cases
- DTOs
- Validators
- Interfaces
- CQRS commands/queries

MythosGraph.Domain
- Entities
- Enums
- Value objects
- Domain rules

MythosGraph.Infrastructure
- EF Core DbContext
- Repositories
- External services
- Seeders
```

---

## 5.2 Module Structure

```text
Modules
├── Entities
├── Relations
├── Traditions
├── Taxonomies
├── Sources
├── Search
├── Graph
├── Creatures
├── Admin
└── Auth
```

CreatureDex module **không nên có database riêng** ở MVP. Nó nên query từ `GraphEntities` với `EntityType = Creature`.

---

# 6. Functional Requirements

## 6.1 Entity Management

### FR-ENT-01: Create Entity

Admin shall be able to create a graph entity.

Priority: **P0**

Input fields:

```text
- Slug
- Name
- EntityType
- TraditionId
- Summary
- MetadataJson
- Status
```

Validation:

```text
- Slug is required
- Slug must be unique
- Name is required
- EntityType is required
- Summary max length should be limited
```

---

### FR-ENT-02: Get Entity by Slug

Public users shall be able to get entity detail by slug.

Priority: **P0**

Request:

```http
GET /api/v1/entities/{slug}
```

Response example:

```json
{
  "id": "entity_001",
  "slug": "son-tinh",
  "name": "Son Tinh",
  "entityType": "MythFigure",
  "tradition": {
    "slug": "vietnamese-mythology",
    "name": "Vietnamese Mythology"
  },
  "summary": "A mountain-associated figure in Vietnamese mythology, best known for his rivalry with Thuy Tinh.",
  "metadata": {
    "domains": ["Mountain", "Earth", "Protection"],
    "role": "Mountain Lord",
    "alignment": "Protective"
  },
  "links": {
    "relations": "/api/v1/entities/son-tinh/relations",
    "neighbors": "/api/v1/entities/son-tinh/neighbors"
  }
}
```

---

### FR-ENT-03: List Entities

Public users shall be able to list entities with pagination.

Priority: **P0**

Request:

```http
GET /api/v1/entities?page=1&pageSize=20
```

Supported query params:

```text
page
pageSize
type
tradition
region
domain
sortBy
sortDirection
```

---

### FR-ENT-04: Update Entity

Admin shall be able to update existing entity data.

Priority: **P0**

Request:

```http
PUT /api/v1/admin/entities/{id}
```

---

### FR-ENT-05: Soft Delete Entity

Admin shall be able to soft delete an entity.

Priority: **P1**

Soft-deleted entities should not appear in public API.

---

## 6.2 Relation Management

### FR-REL-01: Create Relation

Admin shall be able to create relation between two entities.

Priority: **P0**

Request:

```http
POST /api/v1/admin/relations
```

Request body:

```json
{
  "sourceSlug": "son-tinh",
  "relationType": "rival_of",
  "targetSlug": "thuy-tinh",
  "metadata": {
    "context": "Marriage contest for Mi Nuong",
    "confidence": "high"
  }
}
```

Response:

```json
{
  "id": "relation_001",
  "source": "son-tinh",
  "relationType": "rival_of",
  "target": "thuy-tinh",
  "createdAt": "2026-05-29T00:00:00Z"
}
```

---

### FR-REL-02: Get Entity Relations

Public users shall be able to get all relations of an entity.

Priority: **P0**

Request:

```http
GET /api/v1/entities/{slug}/relations
```

Response:

```json
{
  "entity": {
    "slug": "son-tinh",
    "name": "Son Tinh",
    "type": "MythFigure"
  },
  "relations": [
    {
      "relationType": "rival_of",
      "direction": "outgoing",
      "target": {
        "slug": "thuy-tinh",
        "name": "Thuy Tinh",
        "type": "MythFigure"
      },
      "metadata": {
        "context": "Marriage contest for Mi Nuong"
      }
    },
    {
      "relationType": "appears_in",
      "direction": "outgoing",
      "target": {
        "slug": "son-tinh-thuy-tinh",
        "name": "Son Tinh - Thuy Tinh",
        "type": "Legend"
      }
    }
  ]
}
```

---

### FR-REL-03: Delete Relation

Admin shall be able to delete or deactivate a relation.

Priority: **P1**

---

## 6.3 Graph Traversal

### FR-GPH-01: Find Shortest Path

Public users shall be able to find the shortest relationship path between two entities.

Priority: **P0**

Request:

```http
GET /api/v1/graph/path?from=son-tinh&to=water&maxDepth=5
```

Response:

```json
{
  "from": {
    "slug": "son-tinh",
    "name": "Son Tinh",
    "type": "MythFigure"
  },
  "to": {
    "slug": "water",
    "name": "Water",
    "type": "Domain"
  },
  "pathFound": true,
  "distance": 2,
  "path": [
    {
      "from": "son-tinh",
      "relation": "rival_of",
      "to": "thuy-tinh"
    },
    {
      "from": "thuy-tinh",
      "relation": "has_domain",
      "to": "water"
    }
  ]
}
```

Rules:

```text
- Default maxDepth = 4
- Maximum maxDepth = 6
- Timeout should be enforced
- Deleted/unpublished entities must not be included
```

---

### FR-GPH-02: Get Neighbors

Public users shall be able to get neighboring entities.

Priority: **P0**

Request:

```http
GET /api/v1/entities/thor/neighbors
```

Response:

```json
{
  "entity": {
    "slug": "thor",
    "name": "Thor"
  },
  "neighbors": [
    {
      "relationType": "wields",
      "entity": {
        "slug": "mjolnir",
        "name": "Mjolnir",
        "type": "Artifact"
      }
    },
    {
      "relationType": "son_of",
      "entity": {
        "slug": "odin",
        "name": "Odin",
        "type": "God"
      }
    }
  ]
}
```

---

### FR-GPH-03: Explain Entity from Relations

System should generate a short structured explanation based on entity metadata and relations.

Priority: **P2**

Request:

```http
GET /api/v1/entities/ma-da/explain
```

Response:

```json
{
  "entity": {
    "slug": "ma-da",
    "name": "Ma Da",
    "type": "Creature"
  },
  "explanation": [
    "Ma Da is categorized as a water-related spirit in Vietnamese folklore.",
    "It is associated with rivers, ponds, and drowning stories.",
    "In the graph, it connects to Vietnamese Folklore, Water, River, and other water-spirit entities."
  ],
  "generatedFromRelations": [
    "ma-da -> belongs_to_tradition -> vietnamese-folklore",
    "ma-da -> inhabits -> river",
    "ma-da -> has_domain -> water"
  ]
}
```

This should be template-based, not AI-based, in MVP.

---

## 6.4 Tradition Management

### FR-TRD-01: List Traditions

Public users shall be able to list mythology/folklore traditions.

Priority: **P0**

Request:

```http
GET /api/v1/traditions
```

Response:

```json
{
  "data": [
    {
      "slug": "vietnamese-mythology",
      "name": "Vietnamese Mythology",
      "region": "Vietnam",
      "description": "Myths, legends, and folk beliefs associated with Vietnamese culture."
    },
    {
      "slug": "greek-mythology",
      "name": "Greek Mythology",
      "region": "Ancient Greece"
    }
  ]
}
```

---

### FR-TRD-02: Get Tradition Detail

Request:

```http
GET /api/v1/traditions/vietnamese-mythology
```

Response should include:

```text
- Tradition info
- Related regions
- Entity count
- Main entity types
- Featured entities
```

---

## 6.5 Taxonomy Management

### FR-TAX-01: Get Taxonomy Tree

Public users shall be able to retrieve taxonomy trees.

Priority: **P1**

Request:

```http
GET /api/v1/taxonomies/creature-types
```

Response:

```json
{
  "taxonomy": "creature-types",
  "data": [
    {
      "slug": "spirit",
      "name": "Spirit",
      "children": [
        {
          "slug": "water-spirit",
          "name": "Water Spirit"
        },
        {
          "slug": "forest-spirit",
          "name": "Forest Spirit"
        }
      ]
    },
    {
      "slug": "monster",
      "name": "Monster",
      "children": [
        {
          "slug": "serpent-monster",
          "name": "Serpent Monster"
        }
      ]
    }
  ]
}
```

---

## 6.6 Search

### FR-SRC-01: Search Entities

Public users shall be able to search entities by keyword.

Priority: **P0**

Request:

```http
GET /api/v1/search?q=water&type=Creature,MythFigure
```

Response:

```json
{
  "query": "water",
  "results": [
    {
      "slug": "ma-da",
      "name": "Ma Da",
      "type": "Creature",
      "matchedFields": ["summary", "metadata.habitats"]
    },
    {
      "slug": "thuy-tinh",
      "name": "Thuy Tinh",
      "type": "MythFigure",
      "matchedFields": ["name", "domain", "summary"]
    },
    {
      "slug": "water",
      "name": "Water",
      "type": "Domain",
      "matchedFields": ["name"]
    }
  ],
  "total": 3
}
```

Search MVP can use PostgreSQL full-text search.

---

## 6.7 Source Management

### FR-SOU-01: Attach Source to Entity

Admin shall be able to attach source metadata to an entity.

Priority: **P1**

Source fields:

```text
- Title
- Author
- SourceType
- Url
- PublicationYear
- Language
- Notes
- LicenseNote
```

Important rule:

```text
The system should store metadata and short notes, not copyrighted full text.
```

---

### FR-SOU-02: Get Entity Sources

Public users shall be able to view source metadata of an entity.

Priority: **P1**

Request:

```http
GET /api/v1/entities/son-tinh/sources
```

---

## 6.8 CreatureDex Module

CreatureDex is a specialized module that exposes creature-focused endpoints using GraphEntity data.

### FR-CRD-01: List Creatures

Public users shall be able to list creature entities.

Priority: **P1**

Request:

```http
GET /api/v1/creatures?page=1&pageSize=20
```

Supported filters:

```text
tradition
region
country
creatureType
habitat
dangerLevel
domain
```

Response:

```json
{
  "data": [
    {
      "slug": "ma-da",
      "name": "Ma Da",
      "tradition": "Vietnamese Folklore",
      "classification": {
        "primaryType": "Spirit",
        "subTypes": ["Water Spirit", "Ghost"]
      },
      "dangerLevel": "Medium",
      "habitats": ["River", "Pond"],
      "summary": "A water-associated spirit in Vietnamese folklore."
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

### FR-CRD-02: Get Creature Detail

Public users shall be able to retrieve creature detail.

Priority: **P1**

Request:

```http
GET /api/v1/creatures/ma-da
```

Response:

```json
{
  "id": "entity_002",
  "slug": "ma-da",
  "name": "Ma Da",
  "entityType": "Creature",
  "tradition": "Vietnamese Folklore",
  "classification": {
    "primaryType": "Spirit",
    "subTypes": ["Water Spirit", "Ghost"]
  },
  "dangerLevel": "Medium",
  "habitats": ["River", "Pond", "Swamp"],
  "traits": [
    "Associated with drowning stories",
    "Appears near isolated water sources",
    "Often described as a restless water spirit"
  ],
  "abilities": [
    {
      "name": "Luring",
      "description": "Said to lure people near dangerous water."
    }
  ],
  "weaknesses": [
    {
      "name": "Ritual appeasement",
      "type": "Ritual"
    }
  ],
  "relations": [
    {
      "relationType": "inhabits",
      "target": "river"
    },
    {
      "relationType": "belongs_to_tradition",
      "target": "vietnamese-folklore"
    },
    {
      "relationType": "similar_to",
      "target": "water-ghost"
    }
  ]
}
```

---

### FR-CRD-03: Related Creatures

Public users shall be able to retrieve related creatures.

Priority: **P2**

Request:

```http
GET /api/v1/creatures/ma-da/related
```

Response:

```json
{
  "creature": {
    "slug": "ma-da",
    "name": "Ma Da"
  },
  "relatedCreatures": [
    {
      "slug": "water-ghost",
      "name": "Water Ghost",
      "relation": "similar_to",
      "reason": "Both are water-associated ghost entities."
    }
  ]
}
```

---

## 6.9 Admin Authentication

### FR-AUTH-01: Admin Login

Admin shall be able to login and receive JWT token.

Priority: **P0**

Request:

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response:

```json
{
  "accessToken": "jwt_token_here",
  "expiresIn": 3600,
  "role": "Admin"
}
```

---

### FR-AUTH-02: Role-based Authorization

System shall restrict admin endpoints to authenticated admin users.

Priority: **P0**

Roles:

```text
Admin
Contributor
Reviewer
```

MVP can implement only Admin.

---

## 6.10 API Documentation

### FR-DOC-01: Swagger/OpenAPI

System shall expose Swagger/OpenAPI documentation.

Priority: **P0**

Endpoint:

```http
GET /swagger
```

Docs must include:

```text
- Entity endpoints
- Relation endpoints
- Graph endpoints
- Creature endpoints
- Admin endpoints
- Response examples
- Error examples
```

---

# 7. Non-functional Requirements

## 7.1 Performance

| ID         | Requirement                                                            |
| ---------- | ---------------------------------------------------------------------- |
| NFR-PER-01 | Public GET entity endpoint should respond under 500ms for normal load. |
| NFR-PER-02 | Search endpoint should respond under 1s for MVP dataset.               |
| NFR-PER-03 | Graph pathfinding should enforce maxDepth and timeout.                 |
| NFR-PER-04 | Pagination must be required for list endpoints.                        |
| NFR-PER-05 | Default pageSize should be 20; maximum pageSize should be 100.         |

---

## 7.2 Scalability

| ID         | Requirement                                                          |
| ---------- | -------------------------------------------------------------------- |
| NFR-SCA-01 | Data model must allow new entity types without major schema rewrite. |
| NFR-SCA-02 | CreatureDex must reuse graph entity model.                           |
| NFR-SCA-03 | System should allow adding new traditions, regions, taxonomies.      |
| NFR-SCA-04 | Cache should be added for high-traffic GET endpoints in later phase. |

---

## 7.3 Security

| ID         | Requirement                                                   |
| ---------- | ------------------------------------------------------------- |
| NFR-SEC-01 | Admin endpoints must require JWT authentication.              |
| NFR-SEC-02 | Passwords must be hashed.                                     |
| NFR-SEC-03 | Public endpoints must be rate-limited.                        |
| NFR-SEC-04 | Input must be validated to prevent injection attacks.         |
| NFR-SEC-05 | Admin audit log should track create/update/delete operations. |

---

## 7.4 Reliability

| ID         | Requirement                                               |
| ---------- | --------------------------------------------------------- |
| NFR-REL-01 | API should return consistent error format.                |
| NFR-REL-02 | System should support database migrations.                |
| NFR-REL-03 | Deleted records should be soft-deleted where appropriate. |
| NFR-REL-04 | Health check endpoint should be provided.                 |

Health check:

```http
GET /health
```

---

## 7.5 Maintainability

| ID         | Requirement                                                   |
| ---------- | ------------------------------------------------------------- |
| NFR-MAI-01 | Codebase should follow Clean Architecture.                    |
| NFR-MAI-02 | Business logic should not be placed in controllers.           |
| NFR-MAI-03 | DTOs should be separated from domain entities.                |
| NFR-MAI-04 | Unit tests should cover graph traversal and validation logic. |

---

## 7.6 Data Quality

| ID        | Requirement                                                                |
| --------- | -------------------------------------------------------------------------- |
| NFR-DQ-01 | Entity slug must be unique.                                                |
| NFR-DQ-02 | Relation source and target must exist.                                     |
| NFR-DQ-03 | Source metadata should be attached for curated entities when possible.     |
| NFR-DQ-04 | Entity status must control public visibility.                              |
| NFR-DQ-05 | MetadataJson must follow expected schema per entity type where applicable. |

---

# 8. Business Rules

## 8.1 Entity Rules

| ID        | Rule                                                                    |
| --------- | ----------------------------------------------------------------------- |
| BR-ENT-01 | Every public entity must have a unique slug.                            |
| BR-ENT-02 | EntityType must be one of the supported types or defined in taxonomy.   |
| BR-ENT-03 | Draft entities must not appear in public API.                           |
| BR-ENT-04 | Deleted entities must not appear in public API.                         |
| BR-ENT-05 | Entity summary should be original or paraphrased, not copied full text. |

---

## 8.2 Relation Rules

| ID        | Rule                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| BR-REL-01 | A relation must have valid source and target entity.                              |
| BR-REL-02 | RelationType must be normalized. Example: `wields`, not `has weapon maybe`.       |
| BR-REL-03 | Some relation types may be directional. Example: `father_of`.                     |
| BR-REL-04 | Some relation types may imply inverse relation. Example: `wields` ↔ `wielded_by`. |
| BR-REL-05 | Duplicate relations should be prevented unless metadata differs meaningfully.     |

---

## 8.3 Creature Rules

| ID        | Rule                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| BR-CRD-01 | A creature must be stored as GraphEntity with EntityType = `Creature`.       |
| BR-CRD-02 | Creature-specific data should live in metadata or taxonomy mapping.          |
| BR-CRD-03 | CreatureDex endpoints must not duplicate core graph storage.                 |
| BR-CRD-04 | Creature danger level should use controlled values.                          |
| BR-CRD-05 | Creature type should come from taxonomy, not hard-coded enum where possible. |

Danger level values:

```text
Unknown
Low
Medium
High
Extreme
```

---

## 8.4 Graph Traversal Rules

| ID        | Rule                                                                        |
| --------- | --------------------------------------------------------------------------- |
| BR-GPH-01 | Pathfinding must exclude draft/deleted entities.                            |
| BR-GPH-02 | Maximum traversal depth must be limited.                                    |
| BR-GPH-03 | Public users cannot request unlimited graph traversal.                      |
| BR-GPH-04 | If no path is found, system must return `pathFound = false`, not 500 error. |

---

# 9. Data Model

## 9.1 Main Tables

### GraphEntities

```text
Id
Slug
Name
EntityType
TraditionId
Summary
MetadataJson
Status
CreatedAt
UpdatedAt
DeletedAt
```

### GraphRelations

```text
Id
SourceEntityId
TargetEntityId
RelationType
MetadataJson
Status
CreatedAt
UpdatedAt
DeletedAt
```

### Traditions

```text
Id
Slug
Name
Region
Description
CreatedAt
UpdatedAt
```

### Taxonomies

```text
Id
Slug
Name
Category
ParentId
Description
CreatedAt
UpdatedAt
```

### EntityTaxonomies

```text
EntityId
TaxonomyId
```

### Sources

```text
Id
Title
Author
SourceType
Url
PublicationYear
Language
LicenseNote
Notes
CreatedAt
UpdatedAt
```

### EntitySources

```text
EntityId
SourceId
Notes
```

### Users

```text
Id
Email
PasswordHash
Role
Status
CreatedAt
UpdatedAt
```

### AuditLogs

```text
Id
UserId
Action
EntityType
EntityId
OldValueJson
NewValueJson
CreatedAt
```

---

## 9.2 Entity Type Suggestions

```text
God
Goddess
MythFigure
Hero
Creature
Monster
Spirit
Ghost
Artifact
Weapon
Legend
Pantheon
Tradition
Region
Country
Domain
Ritual
Location
Concept
```

But technically, `Spirit`, `Ghost`, `Monster` can either be:

```text
Option A: EntityType
Option B: Creature taxonomy
```

Recommended:

```text
EntityType = Creature
Taxonomy = Spirit / Ghost / Monster / Beast / Dragon
```

This is more flexible.

---

## 9.3 Relation Type Suggestions

```text
appears_in
belongs_to_tradition
originates_from
inhabits
has_domain
wields
created_by
parent_of
child_of
sibling_of
rival_of
enemy_of
ally_of
slain_by
slays
guards
associated_with
similar_to
inspired_by
has_weakness
countered_by
requires_ritual
located_in
```

---

# 10. API Specification Summary

## 10.1 Public Endpoints

```http
GET /api/v1/entities
GET /api/v1/entities/{slug}
GET /api/v1/entities/{slug}/relations
GET /api/v1/entities/{slug}/neighbors
GET /api/v1/entities/{slug}/sources
GET /api/v1/entities/{slug}/explain

GET /api/v1/search?q={keyword}

GET /api/v1/graph/path?from={slug}&to={slug}&maxDepth={n}

GET /api/v1/traditions
GET /api/v1/traditions/{slug}

GET /api/v1/taxonomies/{category}

GET /api/v1/creatures
GET /api/v1/creatures/{slug}
GET /api/v1/creatures/{slug}/related
```

---

## 10.2 Admin Endpoints

```http
POST /api/v1/auth/login

POST /api/v1/admin/entities
PUT /api/v1/admin/entities/{id}
DELETE /api/v1/admin/entities/{id}

POST /api/v1/admin/relations
PUT /api/v1/admin/relations/{id}
DELETE /api/v1/admin/relations/{id}

POST /api/v1/admin/traditions
PUT /api/v1/admin/traditions/{id}

POST /api/v1/admin/taxonomies
PUT /api/v1/admin/taxonomies/{id}

POST /api/v1/admin/sources
PUT /api/v1/admin/sources/{id}
```

---

# 11. Error Response Standard

All errors should follow one format.

Example 404:

```json
{
  "status": 404,
  "error": "ResourceNotFound",
  "message": "Entity with slug 'unknown-entity' was not found.",
  "traceId": "00-abc123"
}
```

Example validation error:

```json
{
  "status": 400,
  "error": "ValidationError",
  "message": "One or more validation errors occurred.",
  "details": [
    {
      "field": "slug",
      "message": "Slug is required."
    },
    {
      "field": "name",
      "message": "Name must not exceed 150 characters."
    }
  ]
}
```

Example graph path not found:

```json
{
  "from": "ma-da",
  "to": "zeus",
  "pathFound": false,
  "message": "No path was found within maxDepth 5."
}
```

---

# 12. Use Cases

## UC-01: Developer searches for an entity

Actor: Public User

Flow:

```text
1. User calls GET /api/v1/search?q=thor.
2. System searches entity name, summary, metadata.
3. System returns matched entities.
```

Expected result:

```text
User receives a list of relevant mythology entities.
```

---

## UC-02: Developer gets graph path between two entities

Actor: Public User

Flow:

```text
1. User calls GET /api/v1/graph/path?from=thor&to=fenrir.
2. System validates both entities exist.
3. System performs BFS traversal up to maxDepth.
4. System returns shortest path.
```

Expected result:

```text
User receives relationship chain between Thor and Fenrir.
```

---

## UC-03: Admin creates a new creature

Actor: Admin

Flow:

```text
1. Admin logs in.
2. Admin creates GraphEntity with EntityType = Creature.
3. Admin assigns creature taxonomy.
4. Admin creates relations.
5. System stores entity and relations.
6. Creature appears in /api/v1/creatures after publishing.
```

---

## UC-04: User browses CreatureDex

Actor: Public User

Flow:

```text
1. User calls GET /api/v1/creatures?habitat=river.
2. System filters GraphEntities where EntityType = Creature.
3. System applies habitat filter from metadata/taxonomy.
4. System returns paginated creature list.
```

---

# 13. MVP Requirements

## 13.1 MVP Must Have

```text
- ASP.NET Core Web API
- PostgreSQL
- EF Core
- Swagger
- GraphEntity CRUD
- GraphRelation CRUD
- Public entity detail
- Public relation list
- Public search
- Graph shortest path
- Tradition management
- Creature list/detail using existing GraphEntity
- JWT admin login
```

---

## 13.2 MVP Seed Data

Recommended MVP data:

```text
3 traditions:
- Vietnamese Mythology
- Greek Mythology
- Norse Mythology

50 entities:
- Gods
- Myth figures
- Creatures
- Artifacts
- Legends
- Domains
- Regions

100 relations:
- rival_of
- wields
- appears_in
- belongs_to_tradition
- has_domain
- inhabits
- slain_by
- parent_of
```

---

## 13.3 MVP Success Criteria

| ID    | Criteria                                                        |
| ----- | --------------------------------------------------------------- |
| AC-01 | User can retrieve entity by slug.                               |
| AC-02 | User can view relations of an entity.                           |
| AC-03 | User can search entities.                                       |
| AC-04 | User can find path between two connected entities.              |
| AC-05 | User can list and view creatures through CreatureDex endpoints. |
| AC-06 | Admin can create/update entities and relations.                 |
| AC-07 | Swagger docs are available.                                     |
| AC-08 | API returns standardized errors.                                |

---

# 14. Future Enhancements

## Phase 2

```text
- Contributor role
- Review/approval workflow
- Better source tracking
- Entity versioning
- Audit log UI
```

## Phase 3

```text
- Similar entity recommendation
- Related creature recommendation
- Graph visualization frontend
- API key system
- Rate limit per API key
```

## Phase 4

```text
- Multi-language fields
- Image thumbnail support
- Public contribution form
- Export dataset as JSON/CSV
```

## Phase 5

```text
- Redis cache
- Meilisearch/Typesense
- Neo4j optional migration
- Advanced graph analytics
```

---

# 15. Recommended Tech Stack

## Backend

```text
ASP.NET Core 8 Web API
Entity Framework Core
PostgreSQL
MediatR
FluentValidation
JWT Authentication
Serilog
Swagger/OpenAPI
```

## Frontend Docs

```text
Next.js
Tailwind CSS
Swagger UI / Scalar API Reference
```

## Deployment

```text
Backend: Render / Railway / Fly.io
Database: Supabase Postgres / Railway Postgres / Render Postgres
Docs: Vercel
```

---

# 16. Suggested Folder Structure

```text
src/
  MythosGraph.Api/
    Controllers/
      EntitiesController.cs
      RelationsController.cs
      GraphController.cs
      CreaturesController.cs
      TraditionsController.cs
      TaxonomiesController.cs
      AdminEntitiesController.cs
    Middlewares/
    Extensions/

  MythosGraph.Application/
    Features/
      Entities/
        Commands/
        Queries/
        DTOs/
        Validators/
      Relations/
      Graph/
      Creatures/
      Traditions/
      Taxonomies/
      Sources/
      Auth/
    Interfaces/

  MythosGraph.Domain/
    Entities/
      GraphEntity.cs
      GraphRelation.cs
      Tradition.cs
      Taxonomy.cs
      Source.cs
      User.cs
    Enums/
    ValueObjects/

  MythosGraph.Infrastructure/
    Persistence/
      AppDbContext.cs
      Configurations/
      Migrations/
      Seeders/
    Repositories/
    Services/
```

---

# 17. Testing Requirements

## Unit Tests

```text
- Slug validation
- Entity creation validation
- Relation creation validation
- BFS shortest path logic
- Creature filter logic
```

## Integration Tests

```text
- GET /api/v1/entities/{slug}
- GET /api/v1/entities/{slug}/relations
- GET /api/v1/graph/path
- GET /api/v1/creatures
- POST /api/v1/admin/entities
```

## Test Cases

Example:

```text
Given:
Son Tinh -> rival_of -> Thuy Tinh
Thuy Tinh -> has_domain -> Water

When:
GET /api/v1/graph/path?from=son-tinh&to=water

Then:
System returns path with distance = 2.
```

---

# 18. Key Risks

| Risk                                       | Impact                     | Mitigation                                          |
| ------------------------------------------ | -------------------------- | --------------------------------------------------- |
| Scope quá rộng                             | Project bị chết giữa đường | MVP chỉ 3 traditions, 50 entities.                  |
| Data không sạch                            | API mất giá trị            | Dùng source metadata, status draft/published.       |
| Graph query chậm                           | Performance kém            | Giới hạn maxDepth, index DB, cache.                 |
| Taxonomy sai từ đầu                        | Khó mở rộng CreatureDex    | Để taxonomy là data, không hard-code quá nhiều.     |
| Bản quyền nội dung                         | Rủi ro pháp lý             | Không copy full text, lưu metadata/tóm tắt tự viết. |
| Frontend graph visualization tốn thời gian | Lệch khỏi backend goal     | Để frontend graph viewer ở phase sau.               |

---