jest.resetModules();

describe('migrate', () => {
  test('runs migrations and calls db.query and db.close', async () => {
    const mockedQuery = jest.fn().mockResolvedValue(undefined);
    const mockedClose = jest.fn().mockResolvedValue(undefined);

    jest.doMock('../db', () => ({ query: mockedQuery, close: mockedClose }), { virtual: true });

    // require después de mockear
    const mig = require('../migrate');

    if (typeof mig.run === 'function') {
      await mig.run();
    } else {
      // compatibilidad: si por alguna razón el módulo aún ejecuta al importar,
      // esperar un tick para que termine la ejecución asíncrona.
      await new Promise((r) => setTimeout(r, 50));
    }

    expect(mockedQuery).toHaveBeenCalled();
    expect(mockedClose).toHaveBeenCalled();

    jest.dontMock('../db');
  });
});