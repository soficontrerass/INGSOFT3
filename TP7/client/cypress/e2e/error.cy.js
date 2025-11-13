describe('E2E - Backend error handling', () => {
  it('shows an error message when the backend fails', () => {
    // interceptar la llamada de listado y devolver 500
    cy.intercept('GET', '/weatherforecast', { statusCode: 500, body: {} });
    cy.visit('/');
    // ajustá el matcher al texto que muestra tu UI en error
    cy.contains(/Error:/i).should('exist');
  });
});