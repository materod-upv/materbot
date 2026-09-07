FROM node:24-bullseye as base

RUN apt update && apt install -y less man-db sudo

ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN chown -R node:node /usr/local/lib/node_modules /usr/local/bin

ENV DEVCONTAINER=true
