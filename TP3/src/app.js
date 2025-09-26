console.log("Sistema de login funcionando.");

function login(email, password) {
  // Simulación de login
  if (email === "user@example.com" && password === "123456") {
    return "Login exitoso";
  } else {
    return "Credenciales incorrectas";
  }
}

// Nueva función de registro
function register(email, password) {
  // Simulación de registro
  if (email && password.length >= 6) {
    return "Registro exitoso";
  } else {
    return "Datos inválidos";
  }
}

// Nueva función de recuperación de contraseña
function recoverPassword(email) {
  // Simulación de recuperación
  if (email === "user@example.com") {
    return "Email de recuperación enviado";
  } else {
    return "Email no registrado";
  }
}

// Ejemplos de uso:
console.log(login("user@example.com", "123456")); // Login exitoso
console.log(register("nuevo@correo.com", "abcdef")); // Registro exitoso
console.log(recoverPassword("user@example.com")); // Email de recuperación enviado

// Ejemplos de uso adicionales para test
console.log(login("otro@correo.com", "abcdef")); // Credenciales incorrectas
console.log(register("nuevo@correo.com", "abc")); // Datos inválidos
console.log(recoverPassword("noexiste@correo.com")); // Email no registrado
