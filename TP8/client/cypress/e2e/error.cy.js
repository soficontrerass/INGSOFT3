describe('E2E - Backend error handling', () => {
  it('shows an error message when the backend returns 500', () => {
    cy.intercept('GET', '**/weatherforecast', { statusCode: 500, body: {} }).as('getForecastsErr');
    cy.visit('/', { timeout: 10000 });
    cy.wait('@getForecastsErr');
    cy.contains(/^Error:/i, { timeout: 5000 }).should('exist');
  });
});