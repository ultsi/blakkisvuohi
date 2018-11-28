FROM node:8.7.0

WORKDIR /install
RUN npm install canvas@1.6.7
COPY package.json /install
RUN npm install
ENV NODE_PATH=/install/node_modules
WORKDIR /app/blakkisvuohi
RUN echo "Europe/Helsinki" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

COPY . .

CMD ["node", "index.js"]
