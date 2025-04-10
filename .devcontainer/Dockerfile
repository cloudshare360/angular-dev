FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install Angular CLI globally
RUN npm install -g @angular/cli@1.7.4

# Set working directory to the Angular project
WORKDIR /workspace/angular-dev/Getting-Started-with-Angular/Slide-1/angular-app

# Run Angular when the container starts
CMD ["sh", "-c", "ng serve --host 0.0.0.0"]