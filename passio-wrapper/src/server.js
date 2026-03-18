const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  // Helpful at boot, but intentionally brief.
  console.log(`Passio wrapper listening on http://localhost:${env.port}`);
});
