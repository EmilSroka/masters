# Backend

This folder contains setup of backend component for apartment price estimation. Component is using FastAPI and exposing single endpoint get '/' that takes JSON representation of `Offer` type (check protos folder) and returns single numeric value, that is price estimation.

## Local mode

To run local mode, you should set environments variables for (using `export name=value`):
- `USER` to `admin`
- `LOCAL_MODE` to `True`
- `PASSWORD` to selected password for store component