# Use official Node.js image as base
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-21

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set working directory to /workspace
WORKDIR /workspaces/angular-dev/Getting-Started-with-Angular/Slide-7/angular-app


# Install dependencies (if any)
COPY package*.json ./
RUN npm install
