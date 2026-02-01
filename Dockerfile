FROM node:18-slim
WORKDIR /app
# COPY package.json k-t-kon hya l-lowla bach l-build i-kon s-ri3
COPY package.json ./
RUN npm install --no-package-lock
COPY . .
# Hugging Face Spaces k-i-7taj darouri port 7860
ENV PORT=7860
EXPOSE 7860
CMD ["node", "server.js"]