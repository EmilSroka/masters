#!/bin/bash
set -e

/bin/kafka-topics --create --topic offers --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 --config retention.ms=432000000 retention.bytes=1073741824
