# Use a lightweight Node.js version
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (to utilize Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]