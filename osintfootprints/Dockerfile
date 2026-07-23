#
# OsintFootprints Dockerfile
#
# http://www.osintfootprints.net
#
# Written by: Michael Pellon <m@pellon.io>
# Updated by: Chandrapal <bnchandrapal@protonmail.com>
# Updated by: Steve Micallef <steve@binarypool.com>
# Updated by: Steve Bate <svc-osintfootprints@stevebate.net>
#    -> Inspired by https://github.com/combro2k/dockerfiles/tree/master/alpine-osintfootprints
#
# Usage:
#
#   sudo docker build -t osintfootprints .
#   sudo docker run -p 5001:5001 --security-opt no-new-privileges osintfootprints
#
# Using Docker volume for osintfootprints data
#
#   sudo docker run -p 5001:5001 -v /mydir/osintfootprints:/var/lib/osintfootprints osintfootprints
#
# Using OsintFootprints remote command line with web server
#
#   docker run --rm -it osintfootprints sfcli.py -s http://my.osintfootprints.host:5001/
#
# Running osintfootprints commands without web server (can optionally specify volume)
#
#   sudo docker run --rm osintfootprints sf.py -h
#
# Running a shell in the container for maintenance
#   sudo docker run -it --entrypoint /bin/sh osintfootprints
#
# Running osintfootprints unit tests in container
#
#   sudo docker build -t osintfootprints-test --build-arg REQUIREMENTS=test/requirements.txt .
#   sudo docker run --rm osintfootprints-test -m pytest --flake8 .

FROM alpine:3.12.4 AS build
ARG REQUIREMENTS=requirements.txt
RUN apk add --no-cache gcc git curl python3 python3-dev py3-pip swig tinyxml-dev \
 python3-dev musl-dev openssl-dev libffi-dev libxslt-dev libxml2-dev jpeg-dev \
 openjpeg-dev zlib-dev cargo rust
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin":$PATH
COPY $REQUIREMENTS requirements.txt ./
RUN ls
RUN echo "$REQUIREMENTS"
RUN pip3 install -U pip
RUN pip3 install -r "$REQUIREMENTS"



FROM alpine:3.13.0
WORKDIR /home/osintfootprints

# Place database and logs outside installation directory
ENV OSINTFOOTPRINTS_DATA /var/lib/osintfootprints
ENV OSINTFOOTPRINTS_LOGS /var/lib/osintfootprints/log
ENV OSINTFOOTPRINTS_CACHE /var/lib/osintfootprints/cache

# Run everything as one command so that only one layer is created
RUN apk --update --no-cache add python3 musl openssl libxslt tinyxml libxml2 jpeg zlib openjpeg \
    && addgroup osintfootprints \
    && adduser -G osintfootprints -h /home/osintfootprints -s /sbin/nologin \
               -g "OsintFootprints User" -D osintfootprints \
    && rm -rf /var/cache/apk/* \
    && rm -rf /lib/apk/db \
    && rm -rf /root/.cache \
    && mkdir -p $OSINTFOOTPRINTS_DATA || true \
    && mkdir -p $OSINTFOOTPRINTS_LOGS || true \
    && mkdir -p $OSINTFOOTPRINTS_CACHE || true \
    && chown osintfootprints:osintfootprints $OSINTFOOTPRINTS_DATA \
    && chown osintfootprints:osintfootprints $OSINTFOOTPRINTS_LOGS \
    && chown osintfootprints:osintfootprints $OSINTFOOTPRINTS_CACHE

COPY . .
COPY --from=build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

USER osintfootprints

EXPOSE 5001

# Run the application.
ENTRYPOINT ["/opt/venv/bin/python"]
CMD ["sf.py", "-l", "0.0.0.0:5001"]
