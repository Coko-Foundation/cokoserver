FROM node:20

RUN apt-get update && \ 
    apt-get install -y imagemagick potrace ghostscript ranger vim

RUN sed -i.bak 's/rights="none" pattern="PS"/rights="read | write" pattern="PS"/g' /etc/ImageMagick-6/policy.xml
RUN sed -i.bak 's/rights="none" pattern="EPS"/rights="read | write" pattern="EPS"/g' /etc/ImageMagick-6/policy.xml

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
