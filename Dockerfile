FROM node:25-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

FROM base AS dev
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS prod
RUN npm run build
EXPOSE 4321
CMD ["npm", "run", "preview", "--", "--host"]
