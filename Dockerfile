FROM node:8.7.0

WORKDIR /app/blakkisvuohi

RUN apt-get install git
RUN apt-get install libgif-dev

COPY package.json .

RUN npm install

COPY . .

CMD ["node", "index.js"]
