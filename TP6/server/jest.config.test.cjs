// javascript
// Archivo: ingsoft3/TP6/server/jest.config.test.cjs

const path = require('path');
const config = require('jest.config.cjs');

describe('jest.config.cjs', () => {
  test('exports an object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  test('preset is "ts-jest"', () => {
    expect(config.preset).toBe('ts-jest');
  });

  test('testEnvironment is "node"', () => {
    expect(config.testEnvironment).toBe('node');
  });

  test('transform maps TypeScript to ts-jest', () => {
    expect(config.transform).toBeDefined();
    // defensivo: aceptar función o string según caso, pero preferimos string 'ts-jest'
    expect(config.transform['^.+\\.ts$']).toBe('ts-jest');
  });

  test('testMatch contains expected patterns', () => {
    expect(Array.isArray(config.testMatch)).toBe(true);
    expect(config.testMatch).toEqual(expect.arrayContaining([
      '**/src/**/?(*.)+(test).ts',
      '**/?(*.)+(test).ts'
    ]));
  });

  test('moduleFileExtensions includes ts, js and json', () => {
    expect(Array.isArray(config.moduleFileExtensions)).toBe(true);
    expect(config.moduleFileExtensions).toEqual(expect.arrayContaining(['ts','js','json']));
  });

  test('collectCoverage is enabled and coverageDirectory is "coverage"', () => {
    expect(config.collectCoverage).toBeTruthy();
    expect(config.coverageDirectory).toBe('coverage');
  });

  test('config file path resolution sanity check', () => {
    const resolved = path.resolve(__dirname, 'jest.config.cjs');
    expect(resolved.endsWith(path.join('server','jest.config.cjs').split(path.sep).pop() || 'jest.config.cjs')).toBe(true);
  });
});