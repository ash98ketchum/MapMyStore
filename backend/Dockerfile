# -------- Base image --------
FROM node:18-alpine

# -------- Set working directory --------
WORKDIR /app

# -------- Install dependencies --------
COPY package*.json ./
RUN npm install --production

# -------- Copy Prisma schema --------
COPY prisma ./prisma
RUN npx prisma generate

# -------- Copy server + static files --------
COPY . .

# -------- Expose backend port --------
EXPOSE 4000

# -------- Start server --------
CMD ["node", "server.cjs"]
