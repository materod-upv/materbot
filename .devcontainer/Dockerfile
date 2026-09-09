FROM node:24-bookworm AS base

# Configurar entorno no interactivo para evitar el error de instalación
ENV DEBIAN_FRONTEND=noninteractive

# Actualizar e instalar dependencias limpiando la caché al finalizar
RUN apt-get update && apt-get install -y --no-install-recommends \
    less \
    man-db \
    sudo \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN chown -R node:node /usr/local/lib/node_modules /usr/local/bin

ENV DEVCONTAINER=true
