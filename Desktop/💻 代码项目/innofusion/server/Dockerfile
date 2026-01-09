FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
EXPOSE 7070
ENV PORT=7070
CMD ["node","src/app.js"]


