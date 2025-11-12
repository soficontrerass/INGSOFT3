// ...existing code...
jest.resetModules();

const supertest = require('supertest');

describe('index root & startServer', () => {
  const ORIGINAL_ENV = { ...process.env };
  let server: any;

  afterEach(async () => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
    if (server && server.close) {
      await new Promise((r) => server.close(r));
      server = undefined;
    }
  });

  test('returns redirect (302) in production to CLIENT_URL', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CLIENT_URL = 'https://my-client.example';
    // require after env set
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;
    await supertest(app)
      .get('/')
      .expect(302)
      .expect('location', 'https://my-client.example');
  });

  test('returns info message in non-production', async () => {
    process.env.NODE_ENV = 'development';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const app = require('../app').default;
    await supertest(app)
      .get('/')
      .expect(200)
      .expect((res: any) => {
        if (!/Server running/.test(res.text)) throw new Error('unexpected body');
      });
  });

  test('startServer logs and listens on provided or default port', async () => {
    // set PORT=0 to let OS pick a random port
    process.env.PORT = '0';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const idx = require('..'); // loads src/index.ts
    // start server and ensure it returns the server instance
    server = idx.startServer();
    expect(server).toBeDefined();
    // wait a tick for the listen callback
    await new Promise((r) => setTimeout(r, 50));
  });
});