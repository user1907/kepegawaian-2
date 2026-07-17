FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 3000

# Run migrations, seed, then start
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
