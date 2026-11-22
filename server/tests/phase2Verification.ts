import http from 'http';
import { createApp } from '../src/app';

async function testServerBoot() {
  console.log('--- Testing Server Boot & Endpoints ---');
  const { app } = await createApp();
  
  const server = app.listen(4001, async () => {
    console.log('Verification server running on http://localhost:4001');

    try {
      // 1. Test REST /health
      const healthResponse = await new Promise<{ status: number; body: string }>((resolve, reject) => {
        http.get('http://localhost:4001/health', (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
          res.on('error', reject);
        });
      });

      console.log('GET /health Status:', healthResponse.status);
      console.log('GET /health Body:', healthResponse.body);
      if (healthResponse.status !== 200) {
        throw new Error(`Expected status 200, got ${healthResponse.status}`);
      }

      // 2. Test GraphQL healthCheck query
      const gqlResponse = await new Promise<{ status: number; body: string }>((resolve, reject) => {
        const payload = JSON.stringify({
          query: `query { healthCheck { status environment } platformInfo { name currency } }`,
        });

        const req = http.request(
          'http://localhost:4001/graphql',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
            res.on('error', reject);
          }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      console.log('POST /graphql Status:', gqlResponse.status);
      console.log('POST /graphql Body:', gqlResponse.body);
      if (gqlResponse.status !== 200) {
        throw new Error(`GraphQL query failed with status ${gqlResponse.status}`);
      }

      console.log('All server health check tests PASSED successfully!');
    } catch (err) {
      console.error('Test verification failed:', err);
      process.exitCode = 1;
    } finally {
      server.close(() => {
        console.log('Verification server closed cleanly.');
      });
    }
  });
}

testServerBoot();
