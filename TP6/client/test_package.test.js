// javascript
// Archivo destino: INGSOFT3/TP6/client/test_package.json
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkgPath = join(__dirname, 'package.json');

function loadPkg() {
  const raw = readFileSync(pkgPath, 'utf8');
  return JSON.parse(raw);
}

describe('client/package.json conventions', () => {
  const pkg = loadPkg();

  it('has valid name, version and private flag', () => {
    expect(pkg).toBeDefined();
    expect(typeof pkg.name).toBe('string');
    expect(pkg.name).toBe('tp6-client');
    expect(typeof pkg.version).toBe('string');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(pkg.private).toBe(true);
  });

  it('defines required scripts', () => {
    expect(pkg.scripts).toBeDefined();
    const scripts = pkg.scripts || {};
    ['test', 'test:ci', 'build', 'dev', 'cypress:run'].forEach((s) => {
      expect(typeof scripts[s]).toBe('string');
      expect(scripts[s].length).toBeGreaterThan(0);
    });
  });

  it('has expected production dependencies', () => {
    expect(pkg.dependencies).toBeDefined();
    const deps = pkg.dependencies || {};
    ['react', 'react-dom', 'react-router-dom', 'env'].forEach((d) => {
      expect(typeof deps[d]).toBe('string');
      expect(deps[d].length).toBeGreaterThan(0);
    });
  });

  it('has expected devDependencies for Vite+Vitest', () => {
    expect(pkg.devDependencies).toBeDefined();
    const dev = pkg.devDependencies || {};
    const expected = [
      'vite',
      'vitest',
      'typescript',
      '@vitejs/plugin-react',
      '@vitest/coverage-v8'
    ];
    expected.forEach((d) => {
      expect(typeof dev[d]).toBe('string');
      expect(dev[d].length).toBeGreaterThan(0);
    });
  });

  it('has parse5 override pinned to 6.0.1', () => {
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides.parse5).toBe('6.0.1');
  });

  it('no empty version strings in dependencies or devDependencies', () => {
    ['dependencies', 'devDependencies'].forEach((k) => {
      const obj = pkg[k] || {};
      Object.entries(obj).forEach(([name, ver]) => {
        expect(typeof ver).toBe('string');
        expect(ver.length).toBeGreaterThan(0);
      });
    });
  });

  it('detects potential Jest vs Vitest conflict and surfaces it', () => {
    const dev = pkg.devDependencies || {};
    const jestRelated = ['jest', 'babel-jest', '@types/jest', 'jest-environment-jsdom'];
    const presentJest = jestRelated.filter((p) => p in dev);
    const hasVitest = 'vitest' in dev;

    if (hasVitest && presentJest.length > 0) {
      throw new Error(
        `Conflict detected: devDependencies includes Vitest and Jest-related packages (${presentJest.join(
          ', '
        )}). Consider removing Jest artifacts or standardizing on Vitest for the Vite project.`
      );
    } else {
      expect(true).toBe(true);
    }
  });
});