FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV production
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nestjs
COPY apps/api/dist ./dist
COPY apps/api/node_modules ./node_modules
COPY apps/api/package.json ./package.json
COPY apps/api/prisma ./prisma
RUN npx prisma generate
USER nestjs
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
