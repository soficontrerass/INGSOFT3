export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  // @ts-ignore
  process.exitCode = undefined;
});

test('main() completes successfully without setting exitCode', async () => {
  await jest.isolateModulesAsync(async () => {
    const SQL = 'CREATE TABLE test();';
    jest.doMock('fs', () => ({ promises: { readFile: jest.fn().mockResolvedValue(SQL) } }));

    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { main } = require('../migrate');

    await expect(main()).resolves.toBeUndefined();
    expect(mockedQuery).toHaveBeenCalledWith(SQL);
    // exitCode must remain unset (or falsy) on success
    expect(process.exitCode).toBeUndefined();
  });
});