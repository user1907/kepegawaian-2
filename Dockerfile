FROM node:20-bookworm

WORKDIR /app

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npm ci && npm run build && npm prune --omit=dev

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
