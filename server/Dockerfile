# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (assumed 5000 based on client configuration)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
