describe('E2E - Create record', () => {
  it('creates a new record via API and shows it in the UI', () => {
    // Ajustá la URL y el body según tu backend
    cy.request('POST', 'http://localhost:8080/api/items', { name: 'Test item', value: 123 })
      .then((resp) => {
        expect(resp.status).to.equal(201);
        // visitar la app y verificar que aparece el nuevo item (ajustá selector/texto)
        cy.visit('/');
        cy.contains('Test item').should('exist');
      });
  });
});