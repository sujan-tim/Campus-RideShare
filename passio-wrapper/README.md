# Passio Wrapper

Production-oriented Express wrapper for Rutgers bus data, designed to sit between a frontend app and Passio GO style upstream data.

## Stack

- Node.js
- Express
- JavaScript
- axios
- dotenv
- cors
- nodemon

## Project Structure

```text
passio-wrapper/
  src/
    server.js
    app.js
    routes/
      rutgers.js
      systems.js
    controllers/
      rutgersController.js
      systemsController.js
    services/
      passioService.js
      rutgersService.js
    utils/
      normalize.js
      errors.js
      cache.js
    config/
      env.js
    data/
      systems.json
      routes.json
      stops.json
      vehicles.json
      alerts.json
      etas.json
  package.json
  .env.example
  README.md
```

## Setup

```bash
cd passio-wrapper
npm install
cp .env.example .env
```

## Run

Development:

```bash
npm run dev
```

Production-style:

```bash
npm start
```

Server default:

```text
http://localhost:4000
```

## Environment

Key values in `.env`:

- `USE_MOCK_DATA=true` to serve local Rutgers data
- `USE_MOCK_DATA=false` to use upstream Passio-style calls
- `PASSIO_BASE_URL` for the upstream base host
- `PASSIO_ACRONYM_ID=1268` for Rutgers system discovery on the Passio GO web stack
- `PASSIO_DEVICE_ID=0` and `PASSIO_BUILD_NO=0` for stateless web-style upstream requests
- `PASSIO_RUTGERS_SYSTEM_ID` to hard-set the Rutgers system if automatic resolution is not enough

## Endpoints

- `GET /health`
- `GET /api/systems`
- `GET /api/systems/search?q=rutgers`
- `GET /api/rutgers`
- `GET /api/rutgers/routes`
- `GET /api/rutgers/stops`
- `GET /api/rutgers/stops?routeId=lx`
- `GET /api/rutgers/vehicles`
- `GET /api/rutgers/vehicles?routeId=lx`
- `GET /api/rutgers/alerts`
- `GET /api/rutgers/etas/stop-yard`

## Example curl

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/systems
curl "http://localhost:4000/api/systems/search?q=rutgers"
curl http://localhost:4000/api/rutgers
curl http://localhost:4000/api/rutgers/routes
curl "http://localhost:4000/api/rutgers/stops?routeId=lx"
curl "http://localhost:4000/api/rutgers/vehicles?routeId=lx"
curl http://localhost:4000/api/rutgers/alerts
curl http://localhost:4000/api/rutgers/etas/stop-yard
```

## Live Upstream Notes

The live Rutgers integration is based on the public Passio GO web client contract used at `https://rutgers.passiogo.com/`.

Confirmed upstream calls:

- `GET /mapGetData.php?getSystems=2&sortMode=1&deviceId=0&credentials=1&acronymId=1268`
- `POST /mapGetData.php?getRoutes=1&deviceId=0` with form field `json={"systemSelected0":"1268","amount":1}`
- `POST /mapGetData.php?getStops=2&deviceId=0&withOutdated=1&wBounds=1&buildNo=0&showBusInOos=0` with form field `json={"s0":"1268","sA":1}`
- `POST /mapGetData.php?getBuses=1&deviceId=0&speed=1` with form field `json={"s0":"1268","sA":1}`
- `POST /goServices.php?getAlertMessages=1&deviceId=0&alertCRC=na&buildNo=0&embedded=0` with form field `json={"systemSelected0":"1268","amount":1,"routesAmount":0}`
- `GET /mapGetData.php?eta=3&deviceId=0&stopIds=<STOP_ID>&userId=1268`

Passio’s web client sends POST bodies as form data with a single `json` field, not as raw JSON. That behavior is implemented in `src/services/passioService.js`.

If Passio changes this contract later, you should only need to adjust `src/services/passioService.js` and possibly field mappings in `src/utils/normalize.js`.

## Mock Mode

When `USE_MOCK_DATA=true`, the API serves Rutgers sample JSON from `src/data/`. This keeps frontend work moving if upstream contracts change or access is temporarily unavailable.

## Error Shape

Errors are always JSON:

```json
{
  "error": {
    "code": "UPSTREAM_REQUEST_FAILED",
    "message": "Upstream Passio request failed for vehicles",
    "details": []
  }
}
```
