FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    git \
    vim \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm and global development tools
RUN npm install -g pnpm \
    && pnpm add -g nodemon concurrently

# Set working directory
WORKDIR /app

# Copy package files if they exist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install 2>/dev/null || echo "No package.json found"

# Copy requirements if they exist
COPY requirements*.txt ./
RUN pip3 install -r requirements.txt 2>/dev/null || echo "No requirements.txt found"

# Copy source code
COPY . .

# Expose common development ports
EXPOSE 3000 5000 8000

# Default command for development
CMD ["bash"]

