// ...existing code...
describe('App smoke / List load', () => {
  it('loads the weatherforecast list and shows items', () => {
    // Stub fijo para que la prueba sea determinista
    cy.intercept('GET', '**/weatherforecast', {
      statusCode: 200,
      body: [
        { date: new Date().toISOString(), temperatureC: 20, summary: 'Sunny' },
        { date: new Date(Date.now() + 86400000).toISOString(), temperatureC: 18, summary: 'Cloudy' }
      ]
    }).as('getForecasts');

    cy.visit('/', { timeout: 10000 });
    cy.wait('@getForecasts');
    cy.contains('TP5 - Weather Forecast').should('exist');
    cy.get('ul').should('exist');
    cy.get('ul > li').its('length').should('be.gte', 1);
  });
});
// ...existing code...