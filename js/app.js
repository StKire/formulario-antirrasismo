let db;

// Abrir o crear la base de datos
let request = indexedDB.open("AsistenciaDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Crear el store (almacén de objetos) si no existe
    if (!db.objectStoreNames.contains("Asistentes")) {
        let store = db.createObjectStore("Asistentes", { keyPath: "id", autoIncrement: true });

        // Crear índices para los campos
        store.createIndex("nombreIndex", "nombre", { unique: true }); // Nombre único
        store.createIndex("qrCodeIndex", "qrCode", { unique: true }); // QR único
        store.createIndex("asistioIndex", "asistio", { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Base de datos abierta correctamente.");
};

request.onerror = function(event) {
    console.error("Error al abrir la base de datos:", event.target.error);
};

// Función para mostrar alertas
function mostrarAlerta(mensaje) {
    const dialog = document.getElementById("alertDialog");
    const dialogMessage = document.getElementById("dialogMessage");
    dialogMessage.textContent = mensaje;
    dialog.showModal();
}

// Función para generar un código QR único
function generarQR(contenido, contenedor) {
    // Limpiar el contenedor del QR
    contenedor.innerHTML = "";

    // Generar el QR
    const qrCode = new QRCode(contenedor, {
        text: contenido,
        width: 200,
        height: 200,
    });

    // Centrar el QR en el contenedor
    contenedor.style.display = "flex";
    contenedor.style.justifyContent = "center";
    contenedor.style.alignItems = "center";
}

// Función para descargar el QR como imagen
function descargarQR() {
    const qrCodeElement = document.getElementById("qrCode").querySelector("img");

    if (qrCodeElement) {
        // Crear un enlace temporal para la descarga
        const link = document.createElement("a");
        link.href = qrCodeElement.src; // Usar la URL de la imagen del QR
        link.download = "Asistencia.jpg"; // Nombre del archivo descargado
        link.click(); // Simular clic en el enlace
    } else {
        mostrarAlerta("No se pudo generar el código QR para descargar.");
    }
}

// Registrar asistente
document.getElementById("registroForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const carrera = document.getElementById("carrera").value;
    const cuatrimestre = document.getElementById("cuatrimestre").value;

    const transaction = db.transaction("Asistentes", "readwrite");
    const store = transaction.objectStore("Asistentes");
    const nombreIndex = store.index("nombreIndex");

    // Verificar si el nombre ya está registrado
    const request = nombreIndex.get(nombre);

    request.onsuccess = function(event) {
        const asistenteExistente = event.target.result;

        if (asistenteExistente) {
            mostrarAlerta("¡Error! Este nombre ya está registrado.");
        } else {
            // Generar un código QR único
            const qrCodeData = `Asistente: ${nombre}, Carrera: ${carrera}, Cuatrimestre: ${cuatrimestre}`;

            // Registrar nuevo asistente
            const nuevoAsistente = {
                nombre: nombre,
                carrera: carrera,
                cuatrimestre: cuatrimestre,
                qrCode: qrCodeData, // Almacenar el contenido del QR
                asistio: false // Inicialmente no ha asistido
            };

            const addRequest = store.add(nuevoAsistente);

            addRequest.onsuccess = function() {
                // Mostrar el QR generado
                const qrCodeContainer = document.getElementById("qrCodeContainer");
                const qrCodeElement = document.getElementById("qrCode");
                generarQR(qrCodeData, qrCodeElement);
                qrCodeContainer.style.display = "block";

                // Habilitar el botón de descarga
                document.getElementById("descargarQR").style.display = "block";

                mostrarAlerta("¡Registro exitoso! Guarda tu código QR.");
                document.getElementById("registroForm").reset();
            };

            addRequest.onerror = function(event) {
                mostrarAlerta("Error al registrar: " + event.target.error);
            };
        }
    };

    request.onerror = function(event) {
        mostrarAlerta("Error al verificar el registro: " + event.target.error);
    };
});

// Evento para descargar el QR
document.getElementById("descargarQR").addEventListener("click", descargarQR);

// Función para verificar la asistencia (día del evento)
function verificarAsistencia(qrCodeData) {
    const transaction = db.transaction("Asistentes", "readwrite");
    const store = transaction.objectStore("Asistentes");
    const qrCodeIndex = store.index("qrCodeIndex");

    const request = qrCodeIndex.get(qrCodeData);

    request.onsuccess = function(event) {
        const asistente = event.target.result;
        if (asistente) {
            if (asistente.asistio) {
                mostrarAlerta("Este asistente ya fue registrado.");
            } else {
                asistente.asistio = true; // Marcar como asistió
                const updateRequest = store.put(asistente);

                updateRequest.onsuccess = function() {
                    mostrarAlerta("¡Asistencia registrada correctamente!");
                };

                updateRequest.onerror = function(event) {
                    mostrarAlerta("Error al registrar la asistencia: " + event.target.error);
                };
            }
        } else {
            mostrarAlerta("Código QR no válido.");
        }
    };

    request.onerror = function(event) {
        mostrarAlerta("Error al verificar el código QR: " + event.target.error);
    };
}