# MERN-Stack One-Way Naming & Folder Convention v2.0

## Global Rules
- **File name case**: kebab-case, except:
  - React component files & folders → PascalCase when colocated styles/tests exist.
  - Mongoose model export → PascalCase.
- **Code identifiers**: camelCase.
- **Resource glossary (base)**:
  - `user`, `trainingSample`, `session`.

## Transform Rules
| Base Word | File/Folder | Code/Path Param |
|-----------|-------------|-----------------|
| trainingSample | training-sample | trainingSampleId |
| user | user | userId |
| session | session | sessionId |

## Backend (Express + Mongoose)
```
/src
 ├─ /models
 │   ├─ user.model.js
 │   ├─ training-sample.model.js
 │   └─ session.model.js
 ├─ /controllers
 │   ├─ users.controller.js
 │   ├─ training-samples.controller.js
 │   └─ sessions.controller.js
 ├─ /routes
 │   ├─ users.routes.js
 │   ├─ training-samples.routes.js
 │   └─ sessions.routes.js
 ├─ /middleware
 │   └─ error-handler.middleware.js
 ├─ /utils
 │   └─ async-handler.util.js
 ├─ /mocks
 │   └─ users.mocks.js
 ├─ /dtos
 │   └─ user-dto.js
 └─ server.js
```

Naming Matrix
| Artifact | File | Export / Role | Route | Param |
|---|---|---|---|---|
| Model | `*.model.js` | `PascalCase` | — | — |
| Controller | `*-s.controller.js` | camelCase functions | — | camelCase+Id |
| Route | `*-s.routes.js` | `router` | `/api/*-s` | camelCase+Id |
| DTO | `*-dto.js` | camelCase helpers | — | — |
| Mock | `*.mocks.js` | camelCase helpers | — | — |
| Test | `*.controller.test.js` | — | — | — |

Sub-resources
- Sub-resource routes → `users-roles.controller.js`, `/api/users/:userId/roles`
- Aggregates → stay inside main controller (`searchUsers`)

## Front-End (React + Redux Toolkit)
```
/src
 ├─ /store
 │   ├─ /users
 │   │   ├─ users.api.js
 │   │   └─ users.slice.js
 ├─ /features
 │   └─ /UsersList
 │       ├─ UsersList.jsx
 │       ├─ UsersList.module.css
 │       └─ UsersList.test.jsx
 ├─ /hooks
 │   └─ use-*.js
 ├─ /utils
 │   └─ *.js
 ├─ /styles
 │   └─ global.css
 └─ /mocks
     ├─ browser.js
     └─ handlers/*.handlers.js
```

Extension & Naming Matrix
| Item | File Pattern | Extension | Export |
|---|---|---|---|
| Component (colocated) | PascalCase folder + PascalCase file | `.jsx` | `export function` |
| Component (standalone) | kebab-case file | `.jsx` | `export function` |
| Hook | kebab-case file | `.js` | `camelCase` |
| Utility | kebab-case file | `.js` | `camelCase` |
| Test | `*.test.jsx` or `*.test.js` | — | — |
| Mock handler | `*.handlers.js` | `.js` | `camelCase` |
| Style module | `*.module.css` | `.css` | — |

## RTK Query & Redux
- API slice: `users.api.js` → `usersApi`
- Redux slice: `users.slice.js` → `usersSlice`
- Hooks: camelCase, auto-generated (`useListUsersQuery`)

## Path Param ↔ DB Field
- Path param camelCase + `Id` (`:userId`)
- Map to DB field in controller: `User.findById(req.params.userId)`

## ESLint / Prettier
```json
"filenames/match-regex": [
  "error",
  "^[a-z0-9-]+(.(model|controller|routes|middleware|util|api|slice|hook|test|spec|config|dto|mocks?))?(\\.(js|jsx))?$"
]
```

## Quick Cheat Sheet
| Layer | Plural | Singular | Path Param |
|---|---|---|---|
| Route | `/api/training-samples` | `/api/training-samples/:trainingSampleId` | `trainingSampleId` |
| Controller | `listTrainingSamples` | `getTrainingSampleById` | `req.params.trainingSampleId` |
| RTK Query | `useListTrainingSamplesQuery` | `useGetTrainingSampleByIdQuery` | `trainingSampleId` |
```