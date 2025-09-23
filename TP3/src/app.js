console.log("Sistema de login funcionando.");

function login(email, password) {
  // Simulación de login
  if (email === "user@example.com" && password === "123456") {
    return "Login exitoso";
  } else {
    return "Credenciales incorrectas";
  }
}