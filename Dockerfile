# syntax = docker/dockerfile:1

# Cambiado a bookworm (Debian actual compatible con Node 24)
FROM node:24-bookworm AS base

ENV DEBIAN_FRONTEND=noninteractive

# Instalación limpia de FFmpeg evitando preguntas interactivas
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

LABEL fly_launch_runtime="NodeJS"

WORKDIR /app

ENV NODE_ENV=production


# Stage de compilación (build)
FROM base AS build

# Instalar dependencias para compilar módulos nativos
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    python-is-python3 \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar paquetes de npm
COPY --link package.json package-lock.json .
RUN npm ci --only=production

# Copiar el código del proyecto
COPY --link . .


# Stage final para la imagen de producción
FROM base

# Copiar la aplicación compilada
COPY --from=build /app /app

CMD [ "npm", "run", "start" ]