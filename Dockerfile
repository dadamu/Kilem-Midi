FROM node:alpine
RUN apk add bash --no-cache
WORKDIR /app
COPY . .
RUN npm install -g db-migrate-mysql
RUN npm install -g db-migrate
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]