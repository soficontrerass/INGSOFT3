export {}; // tratar este archivo como módulo

const SQL = 'CREATE TABLE test();';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('uses db.query/close when available', async () => {
  await jest.isolateModulesAsync(async () => {
    // mock fs.promises.readFile
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    // mock db with query + close
    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // require module under test
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedQuery).toHaveBeenCalledWith(SQL);
    expect(mockedClose).toHaveBeenCalled();
  });
});

test('opens connection and calls conn.exec when present', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const mockedExec = jest.fn().mockResolvedValue(undefined);
    const mockedCloseConn = jest.fn().mockResolvedValue(undefined);
    const mockedOpen = jest.fn().mockResolvedValue({ exec: mockedExec, close: mockedCloseConn });

    jest.doMock('../db', () => ({ open: mockedOpen }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedOpen).toHaveBeenCalled();
    expect(mockedExec).toHaveBeenCalledWith(SQL);
    expect(mockedCloseConn).toHaveBeenCalled();
  });
});

test('opens connection and calls conn.run when exec missing', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const mockedRun = jest.fn().mockResolvedValue(undefined);
    const mockedCloseConn = jest.fn().mockResolvedValue(undefined);
    const mockedOpen = jest.fn().mockResolvedValue({ run: mockedRun, close: mockedCloseConn });

    jest.doMock('../db', () => ({ connect: mockedOpen }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedOpen).toHaveBeenCalled();
    expect(mockedRun).toHaveBeenCalledWith(SQL);
    expect(mockedCloseConn).toHaveBeenCalled();
  });
});

test('opens connection and calls conn.query when run/exec missing', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedCloseConn = jest.fn().mockResolvedValue(undefined);
    const mockedOpen = jest.fn().mockResolvedValue({ query: mockedQuery, close: mockedCloseConn });

    jest.doMock('../db', () => ({ openDb: mockedOpen }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedOpen).toHaveBeenCalled();
    expect(mockedQuery).toHaveBeenCalledWith(SQL);
    expect(mockedCloseConn).toHaveBeenCalled();
  });
});

test('ensures db.close is called when db.query throws', async () => {
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