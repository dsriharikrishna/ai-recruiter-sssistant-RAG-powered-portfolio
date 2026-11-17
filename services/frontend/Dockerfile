FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package manifest
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
