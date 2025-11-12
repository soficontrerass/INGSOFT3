// ...existing code...
export {}; // tratar como módulo

const SQL = 'CREATE TABLE test();';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('applies migration and calls db.query and db.close', async () => {
  await jest.isolateModulesAsync(async () => {
    // mock fs.promises.readFile
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);

    // mock ../db to provide query+close API expected by the test
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedQuery).toHaveBeenCalledWith(SQL);
    expect(mockedClose).toHaveBeenCalled();
  });
});

test('still calls db.close when query throws', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const mockedQuery = jest.fn().mockRejectedValue(new Error('query failed'));
    const mockedClose = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await expect(mig.run()).rejects.toThrow(/query failed/);
    expect(mockedClose).toHaveBeenCalled();
  });
});
// ...existing code...