export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  // aseguramos estado inicial
  // @ts-ignore
  process.exitCode = undefined;
});

test('main() sets exitCode on failure', async () => {
  await jest.isolateModulesAsync(async () => {
    const SQL = 'CREATE TABLE test();';
    jest.doMock('fs', () => ({ promises: { readFile: jest.fn().mockResolvedValue(SQL) } }));

    const mockedQuery = jest.fn().mockRejectedValue(new Error('boom'));
    const mockedClose = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { main } = require('../migrate');

    await expect(main()).rejects.toThrow(/boom/);
    expect(process.exitCode).toBe(1);
  });
});