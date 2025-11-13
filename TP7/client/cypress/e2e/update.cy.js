describe('E2E - Update record', () => {
  it('updates a record and the UI reflects the change', () => {
    // crear registro de prueba (ajustá endpoint)
    cy.request('POST', 'http://localhost:8080/api/items', { name: 'To update', value: 1 })
      .then((resp) => {
        const id = resp.body.id;
        // actualizar vía API
        cy.request('PUT', `http://localhost:8080/api/items/${id}`, { name: 'Updated name', value: 2 })
          .then((r2) => {
            expect(r2.status).to.equal(200);
            cy.visit('/');
            cy.contains('Updated name').should('exist');
          });
      });
  });
});