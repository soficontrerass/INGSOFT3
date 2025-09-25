// Versión inicial
function saludar(nombre) {
    if (!nombre) {
        console.log("Hola mundo");
    } else {
        console.log(`Hola, ${nombre}`);
    }
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