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