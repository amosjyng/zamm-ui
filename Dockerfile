FROM ubuntu:18.04
LABEL org.opencontainers.image.source="https://github.com/amosjyng/zamm"

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y --no-install-recommends build-essential libssl-dev zlib1g-dev libffi-dev libbz2-dev libreadline-dev libsqlite3-dev liblzma-dev libncurses-dev tk-dev libwebkit2gtk-4.0-dev curl wget file libgtk-3-dev librsvg2-dev ca-certificates

ARG PYTHON_VERSION=3.11.4
WORKDIR /tmp
RUN wget https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz && \
  tar -xvf Python-${PYTHON_VERSION}.tgz && \
  cd Python-${PYTHON_VERSION} && \
  ./configure --enable-shared && \
  make -j && \
  make install && \
  ldconfig && \
  pip3 install poetry pipx && \
  rm -rf /tmp/Python-${PYTHON_VERSION}*

ARG NODEJS_VERSION=16.20.2
WORKDIR /tmp
RUN curl -SLO "https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.xz" && \
    tar -xJf "node-v${NODEJS_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 && \
    npm install --global yarn && \
    rm "node-v${NODEJS_VERSION}-linux-x64.tar.xz"

ARG RUST_VERSION=1.71.1
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain ${RUST_VERSION}
ENV PATH="/root/.cargo/bin:${PATH}"
RUN cargo install tauri-cli

# test dependencies
RUN apt install -y webkit2gtk-driver xvfb software-properties-common && \
  apt-add-repository ppa:git-core/ppa && \
  apt update && \
  apt install -y git && \
  pipx install pre-commit && \
  cargo install tauri-driver
ENV PATH="${PATH}:/root/.local/pipx/venvs/pre-commit/bin"

# project dependencies
RUN mkdir /tmp/dependencies
WORKDIR /tmp/dependencies
COPY package.json yarn.lock ./
COPY src-svelte/package.json ./src-svelte/package.json
COPY webdriver/package.json ./webdriver/package.json
RUN yarn && rm -rf node_modules

COPY src-python/poetry.lock poetry.lock
COPY src-python/pyproject.toml pyproject.toml
RUN poetry install

COPY src-tauri/Cargo.toml Cargo.toml
COPY src-tauri/Cargo.lock Cargo.lock
RUN mkdir src/ && \
  echo "// dummy file" > src/lib.rs && \
  cargo build --release && \
  rm -rf target/

COPY .pre-commit-config.yaml .
RUN git init . && \
  pre-commit install-hooks
