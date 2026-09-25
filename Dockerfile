FROM oven/bun:1-alpine
WORKDIR /app
COPY server.ts ./
COPY public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun","server.ts"]
