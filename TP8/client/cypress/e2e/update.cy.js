describe('E2E - Simulated update via intercept', () => {
  it('shows updated data when backend returns changed list', () => {
    // respuesta inicial
    cy.intercept('GET', '**/weatherforecast', {
      statusCode: 200,
      body: [{ date: new Date().toISOString(), temperatureC: 10, summary: 'Init' }]
    }).as('getInit');

    cy.visit('/', { timeout: 10000 });
    cy.wait('@getInit');
    cy.contains('Init').should('exist');

    // ahora simulamos que backend devuelve datos nuevos
    cy.intercept('GET', '**/weatherforecast', {
      statusCode: 200,
      body: [{ date: new Date().toISOString(), temperatureC: 99, summary: 'Updated' }]
    }).as('getUpdated');

    cy.reload();
    cy.wait('@getUpdated');
    cy.contains('Updated').should('exist');
  });
});