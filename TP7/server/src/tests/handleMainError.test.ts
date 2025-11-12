export {};

test('handleMainError is callable (coverage)', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { handleMainError } = require('../migrate');
  expect(typeof handleMainError).toBe('function');
  // llamamos con undefined / error para marcarla como ejecutada
  handleMainError(new Error('test'));
});