FROM erpv3_base:v1.0

MAINTAINER Shuying Lin <Shuying_Lin@compal.com>

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/logs
WORKDIR /usr/src/app

COPY . .

ARG GENERATE_SOURCEMAP=false

RUN yarn install --ignore-engines

