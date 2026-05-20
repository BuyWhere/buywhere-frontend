FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY buywhere-frontend-public ./buywhere-frontend-public
COPY buywhere-frontend-server.js .

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "buywhere-frontend-server.js"]
