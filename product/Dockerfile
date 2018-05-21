FROM node:8.2.1
MAINTAINER Dennis Li <dennis@streamtoken.net>

RUN mkdir -p /app/shared
RUN mkdir -p /app/backend

COPY ./shared/package.json ./shared/yarn.lock /app/shared/
WORKDIR /app/shared
RUN yarn install
COPY ./shared /app/shared
RUN yarn run build

COPY ./backend/package.json ./backend/yarn.lock /app/backend/
WORKDIR /app/backend
RUN yarn install
COPY ./backend /app/backend
RUN yarn run build

CMD ["node", "dist/index.js"]
