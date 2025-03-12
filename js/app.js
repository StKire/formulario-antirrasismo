// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, addDoc, collection, query,where,getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYPmDxOVwne5EIiwVrn7OwlD2vuwOxC_k",
    authDomain: "crud-firestore-70529.firebaseapp.com",
    projectId: "crud-firestore-70529",
    storageBucket: "crud-firestore-70529.firebasestorage.app",
    messagingSenderId: "1086781642962",
    appId: "1:1086781642962:web:9c2ad63762330d4adc350b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


function cambioCam(){
    window.location.href = "camara.html";
}


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
        // Crear un canvas para dibujar el QR con reborde
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const qrSize = 200;
        const borderSize = 20;

        canvas.width = qrSize + borderSize * 2;
        canvas.height = qrSize + borderSize * 2;

        // Dibujar el reborde
        context.fillStyle = "#FFFFFF"; // Color del reborde
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar el QR en el centro del canvas
        const qrImage = new Image();
        qrImage.src = qrCodeElement.src;
        qrImage.onload = function () {
            context.drawImage(qrImage, borderSize, borderSize, qrSize, qrSize);

            // Crear un enlace temporal para la descarga
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/jpeg"); // Usar la URL del canvas
            link.download = "Asistencia.jpg"; // Nombre del archivo descargado
            link.click(); // Simular clic en el enlace
        };
    } else {
        mostrarAlerta("No se pudo generar el código QR para descargar.");
    }
}

// Registrar asistente
document.getElementById("registroForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const carrera = document.getElementById("carrera").value;
    const cuatrimestre = document.getElementById("cuatrimestre").value;

    if (nombre.toLowerCase() === "camara") {
        cambioCam();
        return;
    }

    // Verificar si el nombre ya está registrado
    const q = query(collection(db, "asistentes"), where("nombre", "==", nombre));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        mostrarAlerta("¡Error! Este nombre ya está registrado.");
    } else {
        // Generar un código QR único
        const qrCodeData = `Asistente: ${nombre}, Carrera: ${carrera}, Cuatrimestre: ${cuatrimestre}`;

        // Registrar nuevo asistente
        try {
            await addDoc(collection(db, "asistentes"), {
                nombre: nombre,
                carrera: carrera,
                cuatrimestre: cuatrimestre,
                qrCode: qrCodeData, // Almacenar el contenido del QR
                asistio: false // Inicialmente no ha asistido
            });

            // Mostrar el QR generado
            const qrCodeContainer = document.getElementById("qrCodeContainer");
            const qrCodeElement = document.getElementById("qrCode");
            generarQR(qrCodeData, qrCodeElement);
            qrCodeContainer.style.display = "block";

            // Habilitar el botón de descarga
            document.getElementById("descargarQR").style.display = "block";

            mostrarAlerta("¡Registro exitoso! Guarda tu código QR.");
            document.getElementById("registroForm").reset();
        } catch (error) {
            mostrarAlerta("Error al registrar: " + error.message);
        }
    }
});

// Evento para descargar el QR
document.getElementById("descargarQR").addEventListener("click", descargarQR);

