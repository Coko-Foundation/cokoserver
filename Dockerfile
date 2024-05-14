FROM node:20

RUN apt-get update && \ 
    apt-get install -y ranger vim

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
