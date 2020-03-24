# Express-Cookie

## Local development setup

This sample uses cookies so it does not work with Localhost. You must put a proxy in front of the sample to give it a TLS certificate and host on port 443.

1. Setup HTTPS proxy to http://localhost:3000
2. Copy and modify local development config

   ```bash
   cp config/local-development.sample.js config/local-development.js
   ```

3. Install dependencies

   ```bash
   yarn
   ```

4. Start app

   ```bash
   yarn dev
   ```
