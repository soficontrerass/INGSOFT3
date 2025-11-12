export {};

const SQL = 'CREATE TABLE test();';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  // @ts-ignore
  process.exitCode = undefined;
});

test('covers runMigration, run and main (success path)', async () => {
  await jest.isolateModulesAsync(async () => {
    jest.doMock('fs', () => ({ promises: { readFile: jest.fn().mockResolvedValue(SQL) } }));
    const q = jest.fn().mockResolvedValue(undefined);
    const c = jest.fn().mockResolvedValue(undefined);
    jest.doMock('../db', () => ({ query: q, close: c }));

    // require the module and call each exported function
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mig = require('../migrate');

    // direct call to exported runMigration (if exported)
    if (typeof mig.runMigration === 'function') {
      await mig.runMigration();
    }

    // call run()
    if (typeof mig.run === 'function') {
      await mig.run();
    }

    // call main()
    if (typeof mig.main === 'function') {
      await mig.main();
    }

    expect(q).toHaveBeenCalled();
    expect(c).toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });
});