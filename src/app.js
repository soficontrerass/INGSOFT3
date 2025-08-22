// Versión inicial
<<<<<<< HEAD
function saludar(nombre) {
    if (!nombre) {
        console.log("Hola mundo");
    } else {
        console.log(`Hola, ${nombre}`);
    }
=======
function saludar() {
    console.log("Hola mundo");
>>>>>>> f01557e (fix: arregla error en produccion)
}

// despedir por nombre
function despedir(nombre) {
    if (!nombre) {
        console.log("Adiós mundo");
    } else {
        console.log(`Adiós, ${nombre}`);
    }
}
saludar("Juan");
despedir("Juan");