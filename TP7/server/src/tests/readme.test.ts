// typescript
// Archivo recomendado para crear: INGSOFT3/TP7/server/src/tests/readme.test.ts

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

function findReadme(): string | null {
  const candidates = [
    resolve(process.cwd(), 'TP7', 'README.md'),
    resolve(process.cwd(), 'tp7', 'README.md'),
    // si el test corre desde TP7/server, buscar relativo arriba
    resolve(process.cwd(), 'README.md'),
    resolve(__dirname, '..', '..', 'README.md'),
    resolve(__dirname, '..', '..', '..', 'README.md'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

describe('TP7 README validations', () => {
  const readmePath = findReadme();
  let content = '';

  test('README file exists', () => {
    expect(readmePath).not.toBeNull();
  });

  beforeAll(() => {
    if (!readmePath) return;
    content = readFileSync(readmePath, 'utf8');
  });

  test('README is not empty', () => {
    expect(content && content.trim().length).toBeGreaterThan(0);
  });

  test('mentions TP7 and does not contain TP6 (no leftovers)', () => {
    expect(content).toMatch(/TP7/);
    // no TP6 anywhere (case-insensitive)
    expect(content).not.toMatch(/TP6/i);
  });

  test('contains server instructions pointing to TP7 and npm run test:ci', () => {
    // acepta variantes de ruta y mayúsculas/minúsculas
    expect(content).toMatch(/TP7[\s\S]{0,40}server|server[\s\S]{0,40}TP7/i);
    expect(content).toMatch(/npm\s+run\s+test:ci/);
  });

  test('contains client instructions pointing to TP7 and npm run test:ci', () => {
    expect(content).toMatch(/TP7[\s\S]{0,40}client|client[\s\S]{0,40}TP7/i);
    expect(content).toMatch(/npm\s+run\s+test:ci/);
  });

  test('mentions coverage folders for server and client', () => {
    expect(content).toMatch(/server[\\/]{1}coverage|server\/coverage|server\\coverage/i);
    expect(content).toMatch(/client[\\/]{1}coverage|client\/coverage|client\\coverage/i);
  });

  test('references evidences images for frontend and backend', () => {
    expect(content).toMatch(/evidencias\/coveragefrontend\.png|evidencias\\coveragefrontend\.png/i);
    expect(content).toMatch(/evidencias\/coveragebackend\.png|evidencias\\coveragebackend\.png/i);
  });

  test('contains a CI / Integración CI mention and quick commands section', () => {
    expect(content).toMatch(/Integraci[oó]n CI|Integraci[oó]n/);
    expect(content).toMatch(/Resumen rápido|Resumen/);
    // búsqueda de bloque de comandos con cd hacia TP7
    expect(content).toMatch(/cd\s+.*TP7.*server|cd\s+.*TP7.*client/i);
  });
});
