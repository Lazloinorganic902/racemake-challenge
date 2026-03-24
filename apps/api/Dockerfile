FROM oven/bun:1 AS base
WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all packages and the api app (workspace deps need to be present)
COPY packages/ packages/
COPY apps/api/ apps/api/

# Bun can install from pnpm lockfiles directly
RUN bun install --frozen-lockfile

# Expose port
ENV PORT=3000
EXPOSE 3000

# Run the API
CMD ["bun", "run", "apps/api/src/index.ts"]
