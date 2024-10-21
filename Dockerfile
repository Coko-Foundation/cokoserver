FROM cokoapps/base-dev:20

RUN corepack enable

WORKDIR /home/node/app

COPY .yarnrc.yml .
COPY package.json .
COPY yarn.lock .

RUN chown -R node:node .
USER node

RUN yarn install --immutable
RUN yarn cache clean
COPY --chown=node:node . .
