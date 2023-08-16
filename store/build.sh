#!/bin/bash
set -e

VERSION="0.1.0"

docker build -t "srokaemil/mes-store:$VERSION" .
docker tag "srokaemil/mes-store:$VERSION" "srokaemil/mes-store:latest"
