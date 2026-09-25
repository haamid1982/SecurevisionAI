# SecureVision API

See the [root README](../README.md) for the complete frontend, PostgreSQL, Firebase, Python PDF and optional email/AI setup.

`npm run db:migrate` applies all pending SQL files in `server/migrations/` in order. Start the API with `npm run dev:api`, or start the API and client together with `npm run dev:all`.

Use `DEV_AUTH_BYPASS=false` for authenticated assessment. A configured empty PostgreSQL database and Firebase credentials are required to assess persistent company and role separation.
