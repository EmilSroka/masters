#!/bin/bash
set -e

VERSION="0.1.0"

docker build -t "srokaemil/mes-broker:$VERSION" .
docker tag "srokaemil/mes-broker:$VERSION" "srokaemil/mes-broker:latest"
