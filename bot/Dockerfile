FROM node:alpine

WORKDIR /app

COPY package*.json .

RUN npm install
RUN npm i -g serve

COPY . .
ARG VITE_API_URL
ARG VITE_ORDER_FIX_PRICE

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ORDER_FIX_PRICE=${VITE_ORDER_FIX_PRICE}

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

RUN npm run build

CMD [ "serve", "-s", "dist", "-p", "4173" ]

EXPOSE 4173
