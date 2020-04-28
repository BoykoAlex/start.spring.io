FROM ubuntu:18.04

RUN apt-get update && apt-get install -y \
  build-essential \
  gettext-base \
  openjdk-8-jdk=8u162-b12-1 openjdk-8-jre=8u162-b12-1 openjdk-8-jdk-headless=8u162-b12-1 openjdk-8-jre-headless=8u162-b12-1 openjdk-8-source=8u162-b12-1 \
  curl

COPY target/start-site-exec.jar /app.jar
 
ENV SHELL /bin/bash
ENTRYPOINT [ "java", "-jar", "app.jar", "--initializr.project-location-container=/home/project" ]