# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Copy the rest of your code
COPY . .

# Install dependencies
RUN pnpm install

# Build the application
RUN pnpm -r build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "-r", "start"]