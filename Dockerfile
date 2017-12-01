FROM node:8.7.0

WORKDIR /app/blakkisvuohi

RUN npm install canvas@1.6.7

COPY package.json .

RUN npm install

COPY . .

CMD ["source", ".env"]

CMD ["node", "index.js"]
