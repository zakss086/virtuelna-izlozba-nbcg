# Backend

Planned for Workshop 4. The frontend currently runs on mock data in `frontend/src/features/<name>/api/`.

The contract the frontend expects is in [`../docs/entities.md`](../docs/entities.md): entities, access rules and endpoints.

## Plan

1. **Database** modelled after `docs/entities.md`: users, exhibitions, sections, objects, videos, favorites.
2. **Authentication** with sessions or tokens, replacing the demo accounts; passwords are hashed and never reach the frontend.
3. **Authorization on the server** (the frontend guards are only a convenience):
   - anyone reads published exhibitions;
   - a curator creates exhibitions and edits or deletes only their own;
   - an admin edits any exhibition, publishes or returns pending ones, and lists users.
4. **Exhibition status flow**: `draft` -> `pending` (curator submits) -> `published` (admin).
5. **File upload** for images and videos (size and type limits, storage, URLs saved on the object and video records).
6. **Validation** of every request again on the server, using the same rules as the Zod schemas in `frontend/src/features/exhibitions/components/exhibition-form-model.ts`.
7. **Connect the frontend**: replace the `*-api.ts` functions (`list`, `get`, `create`, `update`, `remove`) with HTTP calls to these endpoints. Components and hooks stay unchanged, because they only talk to the hooks.

## Endpoints

- `GET /exhibitions?search=&template=&status=&authorId=` (anonymous sees only `published`)
- `GET /exhibitions/:slugOrId`
- `POST /exhibitions`, `PATCH /exhibitions/:id`, `DELETE /exhibitions/:id`
- `PATCH /exhibitions/:id/status`
- `POST /auth/sign-in`, `POST /auth/sign-out`, `GET /auth/me`
- `GET /users` (admin)
- `GET /favorites`, `PUT /favorites/:exhibitionId`, `DELETE /favorites/:exhibitionId`

## Rule of the monorepo

A change that touches both frontend and backend goes in one commit or pull request, and `docs/entities.md` is updated in the same change.
