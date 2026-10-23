FROM node:24.12.0-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN chown -R node:node /usr/src/app

USER node
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]