# Claude Development Guidelines

## Package Manager

**Always use pnpm** for this project, not npm or yarn.

- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev`
- Build project: `pnpm build`
- Run tests: `pnpm test`

## Important Notes

- package-lock.json should not exist (we use pnpm-lock.yaml instead)
- Do not use `npm install` or `npm run` commands
