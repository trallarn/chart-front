FROM node:14.21-bullseye-slim

COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build 
CMD npm run start