export {}; // treat as module

const SQL = 'CREATE TABLE test();';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('directly calls exported runMigration', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({ promises: { readFile: jest.fn().mockResolvedValue(SQL) } }));
    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { runMigration } = require('../migrate');

    await runMigration();

    expect(mockedQuery).toHaveBeenCalledWith(SQL);
    expect(mockedClose).toHaveBeenCalled();
  });
});

test('run() delegates to runMigration (covered via exported run)', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({ promises: { readFile: jest.fn().mockResolvedValue(SQL) } }));
    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    await mig.run();

    expect(mockedQuery).toHaveBeenCalledWith(SQL);
    expect(mockedClose).toHaveBeenCalled();
  });
});