// /c:/INGSOFT3/ingsoft3/TP7/server/src/tests/migrate.more.test.ts
export {}; // treat as module

const SQL = 'CREATE TABLE test();';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('uses open() and calls conn.exec and conn.close', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const exec = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue({ exec, close });

    jest.doMock('../db', () => ({ open }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(open).toHaveBeenCalled();
    expect(exec).toHaveBeenCalledWith(SQL);
    expect(close).toHaveBeenCalled();
  });
});

test('uses connect() and calls conn.run and conn.end', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const run = jest.fn().mockResolvedValue(undefined);
    const end = jest.fn().mockResolvedValue(undefined);
    const connect = jest.fn().mockResolvedValue({ run, end });

    jest.doMock('../db', () => ({ connect }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(connect).toHaveBeenCalled();
    expect(run).toHaveBeenCalledWith(SQL);
    expect(end).toHaveBeenCalled();
  });
});

test('module itself behaves like connection (exec) and close is called via dbMod.close branch', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    const exec = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);

    // module exports exec + close but no open/connect
    jest.doMock('../db', () => ({ exec, close }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(exec).toHaveBeenCalledWith(SQL);
    expect(close).toHaveBeenCalled();
  });
});

test('throws when db module has no open/connect and no exec/run/query', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockResolvedValue(SQL) },
    }));

    // db module empty -> should throw specific error
    jest.doMock('../db', () => ({}));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await expect(mig.run()).rejects.toThrow(/DB open function not found/);
  });
});

test('readFile error rejects and does not call DB methods', async () => {
  await jest.isolateModulesAsync(async () => {
    const readErr = new Error('read failed');
    jest.doMock('fs', () => ({
      promises: { readFile: jest.fn().mockRejectedValue(readErr) },
    }));

    const mockedQuery = jest.fn();
    const mockedClose = jest.fn();

    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await expect(mig.run()).rejects.toThrow(/read failed/);
    expect(mockedQuery).not.toHaveBeenCalled();
    expect(mockedClose).not.toHaveBeenCalled();
  });
});