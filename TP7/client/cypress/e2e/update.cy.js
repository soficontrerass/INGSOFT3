describe('E2E - Simulated update via intercept', () => {
  it('shows updated data when backend returns changed list', () => {
    // primer stub: lista original con un item específico
    cy.intercept('GET', '**/weatherforecast', {
      statusCode: 200,
      body: [
        { date: new Date().toISOString(), temperatureC: 10, summary: 'Init' }
      ]
    }).as('getInit');

    cy.visit('/');
    cy.wait('@getInit');
    cy.contains('Init').should('exist');

    // ahora simulamos que backend cambió (update)
    cy.intercept('GET', '**/weatherforecast', {
      statusCode: 200,
      body: [
        { date: new Date().toISOString(), temperatureC: 99, summary: 'Updated' }
      ]
    }).as('getUpdated');

    // recargar la página para forzar nuevo fetch
    cy.reload();
    cy.wait('@getUpdated');
    cy.contains('Updated').should('exist');
  });
});