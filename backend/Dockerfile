FROM node:20

WORKDIR /app

# Copy Node dependencies
COPY package*.json ./
RUN npm install

# Copy backend code
COPY . .

# Fix nodemon and install Python build tools
RUN chmod +x node_modules/.bin/nodemon \
 && apt-get update && apt-get install -y --no-install-recommends \
    dos2unix wget python3 python3-venv python3-distutils build-essential libopenblas-dev \
 && dos2unix node_modules/.bin/nodemon \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create virtual environment for Python packages
RUN python3 -m venv /opt/venv

# Activate venv and install AI libraries
RUN /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install torch transformers gpt4all

# Add venv to PATH so scripts can use it
ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 5000

CMD ["node", "index.js"]