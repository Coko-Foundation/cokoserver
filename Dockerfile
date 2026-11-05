ARG NODE_VERSION=24

FROM cokoapps/base-dev:${NODE_VERSION}

RUN corepack enable

WORKDIR /home/node/app

COPY eslint.config.mjs .
COPY .prettierrc.mjs .
COPY .prettierignore .

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .

COPY packages/dev/package.json ./packages/dev/package.json
COPY packages/lib/package.json ./packages/lib/package.json

RUN yarn install --immutable

COPY packages/dev ./packages/dev
COPY packages/lib ./packages/lib

COPY ./startDev.js .
# RUN yarn workspace @coko/server build
