describe('App smoke / List load', () => {
  it('loads the app and shows the heading and a list', () => {
    // stub de la respuesta de list (no depende del backend real)
    cy.intercept('GET', '**/weatherforecast', {
      statusCode: 200,
      body: [
        { date: new Date().toISOString(), temperatureC: 20, summary: 'Sunny' },
        { date: new Date(Date.now() + 86400000).toISOString(), temperatureC: 18, summary: 'Cloudy' }
      ]
    }).as('getForecasts');
    cy.intercept('GET', '**/api/favorites', { statusCode: 200, body: [] }).as('getFavorites');
    cy.intercept('GET', '**/api/searches', { statusCode: 200, body: [] }).as('getSearches');

    cy.visit('/', { timeout: 10000 });
    cy.wait('@getForecasts');
    cy.contains('Weather Forecast').should('exist');
    cy.contains('Sunny').should('exist');
    cy.contains('20°C').should('exist');
  });
});