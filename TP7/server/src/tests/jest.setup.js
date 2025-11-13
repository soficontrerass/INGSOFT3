// Mock global 'pg' para evitar conexiones reales en tests
jest.mock('pg', () => {
  function MockPool() {}
  MockPool.prototype.query = async function () { return { rows: [] }; };
  MockPool.prototype.end = async function () { return; };
  return { Pool: MockPool };
}, { virtual: true });