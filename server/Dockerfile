FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy the entire workspace configuration
COPY package*.json ./
COPY services/*/package.json ./services/
COPY packages/*/package.json ./packages/

# We'll just copy everything right away because we need the source files
# to build the packages and services anyway, and we rely on npm workspaces
COPY . .

# Install dependencies and generate Prisma client
RUN npm install

# Install tsx to run TypeScript directly without pre-compiling
RUN npm install -g tsx

# Expose ports for both api and socket services
EXPOSE 5000 8001

# The start command will be overridden in docker-compose.yml
CMD ["npm", "start"]
