describe("App smoke", () => {
  it("loads home", () => {
    cy.visit("/");
    cy.contains("Server running").should("exist");
  });
});