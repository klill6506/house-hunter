FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh","-c","npx prisma db push --skip-generate && npx tsx scripts/bootstrap.ts && npm start"]
