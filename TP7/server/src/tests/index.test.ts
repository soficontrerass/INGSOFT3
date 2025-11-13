// ...existing code...
describe('index (entry)', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, PORT: '0' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.clearAllMocks();
  });

  it('calls app.get and app.listen on import', () => {
    const getMock = jest.fn();
    const listenMock = jest.fn((port: any, cb?: any) => { if (cb) cb(); return { close: jest.fn() }; });

    // mock app with both get and listen (index.ts uses app.get before listen)
    jest.mock('../app', () => ({ __esModule: true, default: { get: getMock, listen: listenMock } }));

    // require index after mock
    require('../index');

    expect(getMock).toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalled();
  });
});