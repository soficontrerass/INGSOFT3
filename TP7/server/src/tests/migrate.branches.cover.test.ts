// ...existing code...
export {};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  delete process.exitCode;
});

async function waitForAsync() {
  await new Promise((r) => setImmediate(r));
}

test('successful migration calls query(sql) then close()', async () => {
  await jest.isolateModulesAsync(async () => {
    const sql = 'CREATE TABLE t();';
    const dbQuery = jest.fn().mockResolvedValue(undefined);
    const dbClose = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../db', () => ({ __esModule: true, query: dbQuery, close: dbClose }));
    jest.doMock('fs', () => ({ readFileSync: jest.fn().mockReturnValue(sql) }));

    require('../migrate');
    await waitForAsync();

    expect(dbQuery).toHaveBeenCalledWith(sql);
    expect(dbClose).toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });
});

test('query throws -> logs error, close() still called and process.exitCode = 1', async () => {
  await jest.isolateModulesAsync(async () => {
    const sql = 'CREATE TABLE t();';
    const dbQuery = jest.fn().mockRejectedValue(new Error('boom'));
    const dbClose = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../db', () => ({ __esModule: true, query: dbQuery, close: dbClose }));
    jest.doMock('fs', () => ({ readFileSync: jest.fn().mockReturnValue(sql) }));

    require('../migrate');
    await waitForAsync();

    expect(dbQuery).toHaveBeenCalled();
    expect(dbClose).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});

test('readFileSync throws -> query not called, close() called and process.exitCode = 1', async () => {
  await jest.isolateModulesAsync(async () => {
    const dbQuery = jest.fn();
    const dbClose = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../db', () => ({ __esModule: true, query: dbQuery, close: dbClose }));
    jest.doMock('fs', () => ({ readFileSync: jest.fn(() => { throw new Error('nofile'); }) }));

    require('../migrate');
    await waitForAsync();

    expect(dbQuery).not.toHaveBeenCalled();
    expect(dbClose).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
// ...existing code...