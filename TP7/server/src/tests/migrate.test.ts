jest.resetModules();

describe('migrate.run', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('applies migration and calls db.query and db.close', async () => {
    // mock fs.promises.readFile
    jest.doMock('node:fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue('CREATE TABLE test();') }
    }), { virtual: true });

    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }), { virtual: true });

    // require después de los mocks
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedQuery).toHaveBeenCalledWith('CREATE TABLE test();');
    expect(mockedClose).toHaveBeenCalled();
  });

  test('still calls db.close when query throws', async () => {
    jest.doMock('node:fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue('SQL;') }
    }), { virtual: true });

    const mockedQuery = jest.fn().mockRejectedValue(new Error('query failed'));
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }), { virtual: true });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await expect(mig.run()).rejects.toThrow(/query failed/);
    expect(mockedClose).toHaveBeenCalled();
  });
});