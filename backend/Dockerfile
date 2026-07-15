# backend/Dockerfile

# Fonts to find the prefixes and theirs meanings "https://docs.docker.com/reference/dockerfile/"
FROM node:20-alpine

# Creates the working directory for the bind mounts
WORKDIR /usr/src/app

# Copy the dependencies files (Builds faster)
COPY package*.json ./
RUN npm install

# Install the dependecies
RUN apk add --no-cache \
  make \
  g++ \
  libstdc++ \
  git \
  wget



# Copy the code
COPY . .

# Generate the Prisma client into the image's node_modules so a clean rebuild
# (docker compose down -v && up --build) produces a compilable backend. The
# backend_modules named volume is seeded from this image layer on first create,
# so PrismaService's model accessors exist without any manual `prisma generate`.
# A throwaway DATABASE_URL satisfies the prisma.config env resolver; `generate`
# never connects to the DB, so the placeholder is never used at runtime (the
# real DATABASE_URL is assembled from Vault by docker-entrypoint.sh).
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

RUN git clone https://github.com/official-stockfish/Stockfish.git /tmp/stockfish \
 && make -C /tmp/stockfish/src -j$(nproc) build \
 && install -m 755 /tmp/stockfish/src/stockfish /usr/bin/stockfish


ENV STOCKFISH_PATH=/usr/bin/stockfish

EXPOSE 3000

# Fetches secrets from Vault and exports them before Node starts (SECRET-03).
# Copied outside the bind-mounted /usr/src/app so the host mount never shadows it.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

# Command to start the dev server
CMD ["npm", "run", "start:dev"]