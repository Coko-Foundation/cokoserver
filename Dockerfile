FROM cokoapps/base-dev:22

RUN corepack enable

WORKDIR /home/node/app

COPY package.json .
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn .yarn

COPY packages/dev/package.json ./packages/dev/package.json
COPY packages/lib/package.json ./packages/lib/package.json

RUN yarn install --immutable

COPY packages/dev ./packages/dev
COPY packages/lib ./packages/lib

# RUN yarn workspace @coko/server build
