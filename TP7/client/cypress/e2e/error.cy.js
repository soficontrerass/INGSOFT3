describe('E2E - Backend error handling', () => {
  it('shows an error message when the backend fails', () => {
    // interceptar cualquier URL que termine con /weatherforecast y devolver 500
    cy.intercept('GET', '**/weatherforecast', { statusCode: 500, body: {} }).as('getForecasts');
    cy.visit('/');
    // esperar la llamada y luego verificar el mensaje de error en la UI
    cy.wait('@getForecasts');
    cy.contains(/^Error:/i, { timeout: 5000 }).should('exist');
  });
});