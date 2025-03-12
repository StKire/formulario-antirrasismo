import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, updateDoc, collection, query, where, getDocs, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

// Función para verificar la asistencia (día del evento)
async function verificarAsistencia(qrCodeData) {
    const q = query(collection(db, "asistentes"), where("qrCode", "==", qrCodeData));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const asistenteDoc = querySnapshot.docs[0];
        const asistente = asistenteDoc.data();

        if (asistente.asistio) {
            mostrarAlerta("Este asistente ya fue registrado.");
        } else {
            try {
                await updateDoc(doc(db, "asistentes", asistenteDoc.id), {
                    asistio: true
                });
                mostrarAlerta(`¡Asistencia registrada correctamente! Nombre: ${asistente.nombre}, Carrera: ${asistente.carrera}, Cuatrimestre: ${asistente.cuatrimestre}`);
            } catch (error) {
                mostrarAlerta("Error al registrar la asistencia: " + error.message);
            }
        }
    } else {
        mostrarAlerta("Código QR no válido.");
    }
}

function mostrarAlerta(mensaje) {
    const dialog = document.getElementById("alertDialog");
    const dialogMessage = document.getElementById("dialogMessage");
    dialogMessage.textContent = mensaje;
    dialog.showModal();
    html5QrcodeScanner.clear(); // Detener el escáner

    dialog.addEventListener('close', () => {
        html5QrcodeScanner.render(lecturaCorrecta, errorLectura); // Reiniciar el escáner cuando se cierre el diálogo
    }, { once: true });
}

function lecturaCorrecta(codigoTexto, codigoObjeto) {
    console.log(`Code matched = ${codigoTexto}`, codigoObjeto);
    verificarAsistencia(codigoTexto); // Llama a la función verificarAsistencia con el código QR escaneado
}

function errorLectura(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    //console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 250, height: 250 } },
/* verbose= */ false);

html5QrcodeScanner.render(lecturaCorrecta, errorLectura);
