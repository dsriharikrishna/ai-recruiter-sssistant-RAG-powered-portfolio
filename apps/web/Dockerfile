FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root workspace and package manifests
COPY package.json pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm --filter web install

# Copy web app source code
COPY apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]

