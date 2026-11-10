FROM node:20-slim
RUN apt-get update && apt-get install -y ffmpeg python3 curl git \
 && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod +x /usr/local/bin/yt-dlp && apt-get clean
WORKDIR /app
COPY package*.json ./
COPY scripts ./scripts
RUN npm install --omit=dev
COPY . .
ENV WEB=true NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
