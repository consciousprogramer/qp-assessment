FROM node:20

# WORKDIR /qp-assessment
WORKDIR /

COPY package* .
COPY ./prisma .

RUN npm install -g pnpm
RUN pnpm install
RUN npx prisma generate

COPY . .

RUN pnpm run build 

CMD ["/bin/bash", "-c", "npx prisma migrate deploy && npm run prod"]