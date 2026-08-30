# 1. Use the Debian-based image for better Prisma compatibility.
FROM node:24.20.0-slim

# 2. Install OpenSSL.
RUN apt-get update -y && apt-get install -y openssl

# 3. Set the working directory.
WORKDIR /app

# 4. Copy dependency files.
COPY package*.json ./

# 5. Install dependencies.
RUN npm ci

# 6. Copy the project source.
COPY . .

# 7. Generate the Prisma client.
RUN npx prisma generate

# 8. Build the application.
RUN npm run build

# 9. Expose the port.
EXPOSE 3000

# 10. Start the server.
CMD ["node", ".output/server/index.mjs"]
