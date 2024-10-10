# Byggefasen
FROM node:20 AS builder

# Sæt arbejdsmappen i builder-containeren
WORKDIR /app

# Kopier package.json og package-lock.json til builder-containeren
COPY package*.json ./

# Installer afhængigheder (inkl. devDependencies)
RUN npm install

# Kopier resten af projektet til builder-containeren
COPY . .

# Byg SvelteKit projektet
RUN npm run build

# Produktionsfasen (slank container)
FROM node:20-slim AS production

# Sæt arbejdsmappen i produktionscontaineren
WORKDIR /app

# Installér kun nødvendige produktionsafhængigheder
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Kun kopier den nødvendige 'build' mappe fra builder-containeren
COPY --from=builder /app/build ./build

# Eksponér den port, som dit SvelteKit projekt kører på (default 3000)
EXPOSE 3000

# Kør den byggede applikation
CMD ["node", "./build/index.js"]
