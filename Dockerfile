# BUILD STAGE
FROM node:24-bookworm AS build

RUN apt-get update && apt-get install -y cmake git 

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /apps

COPY ./cdoku ./cdoku 

RUN /usr/bin/cmake -S /apps/cdoku -B /apps/cdoku/build -DCMAKE_BUILD_TYPE=Release && \
  /usr/bin/cmake --build /apps/cdoku/build --config Release --target puzzle_generator_app -j$(nproc) --

COPY ./vue-sudoku ./sudoku

WORKDIR /apps/sudoku 

RUN pnpm i && pnpm build

# BACKEND
FROM node:24-alpine AS backend

WORKDIR /sudoku

COPY --from=build /apps/sudoku/backend/build ./
COPY --from=build /apps/cdoku/build/src/app/puzzle_generator_app .

EXPOSE 3666

ENV NODE_ENV=production

CMD [ "node", "index.js" ]

# FRONTEND
FROM nginxinc/nginx-unprivileged:alpine AS frontend

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /apps/sudoku/frontend/dist /usr/share/nginx/html
COPY --from=build /apps/sudoku/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]