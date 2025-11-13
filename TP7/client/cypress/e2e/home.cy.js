describe('App smoke / List load', () => {
  it('loads the weatherforecast list and shows items', () => {
    cy.visit('/');
    // la app hace fetch a /weatherforecast; comprobamos que aparece el heading y la lista
    cy.contains('TP5 - Weather Forecast').should('exist');
    // hay al menos un item (según stub/setupTests)
    cy.get('ul').should('exist');
    cy.get('ul > li').its('length').should('be.gte', 1);
  });
});