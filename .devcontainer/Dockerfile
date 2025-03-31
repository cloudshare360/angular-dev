# Use official Node.js image as base
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-16

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set working directory to /workspace
WORKDIR /workspace

# Install dependencies (if any)
COPY package*.json ./
RUN npm install
