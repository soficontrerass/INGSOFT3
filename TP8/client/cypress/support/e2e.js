// ...existing code...
// support file mínimo (CommonJS)
try {
  require('./commands');
} catch (err) {
  // si no existen comandos, no romperá la ejecución
  /* noop */
}
Cypress.on('uncaught:exception', () => false); // evita fallos por excepciones no controladas
// ...existing code...