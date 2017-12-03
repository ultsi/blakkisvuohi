FROM node:8.7.0

WORKDIR /app/blakkisvuohi

RUN npm install canvas@1.6.7

COPY package.json .

RUN npm install

RUN sudo echo "Europe/Helsinki" > /etc/timezone
RUN sudo dpkg-reconfigure -f noninteractive tzdata

COPY . .

CMD ["node", "index.js"]
