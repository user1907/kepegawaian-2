FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci && npm run build && npm prune --omit=dev

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
