FROM node:20-bookworm

WORKDIR /app

COPY . .

ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
RUN npm ci && npm run build && npm prune --omit=dev

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
