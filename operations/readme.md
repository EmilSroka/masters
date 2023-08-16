# Operations

This folder contains single machine setup of the system


## Port Mapping

Here you can find all port exposed by docker compose and all reserved port ranges: 

| Range       | In Use      | Component |
|-------------|-------------|-----------|
| 6000 – 6009 | 6000        | Zookeeper |
| 6010 – 6019 | 6010        | Kafka     |

Internal services can be found here:

| Range         | Service     |
|---------------|-------------|
| zookeper:2181 | Zookeper    |
| kafka:9092    | Kafka       |

## Environment variables:

Here you can find list of required environment variables to set in `.env` file

- `STORE_PASSWORD` password for PostgreSQL DB