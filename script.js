import { db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const quejasRef = collection(db, "quejas");
const form = document.getElementById("formQueja");

let editando = false;
let idActual = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const queja = {
    mensaje: form.mensaje.value,
    etiquetas: form.etiquetas.value.split(",").map(e => e.trim()),
    usuario: {
      nombre: form.nombre.value,
      email: form.email.value
    }
  };

  if (editando) {
    await updateDoc(doc(db, "quejas", idActual), queja);
    editando = false;
    idActual = "";
    form.querySelector("button").textContent = "Enviar";
  } else {
    await addDoc(quejasRef, queja);
  }

  form.reset();
  mostrarQuejas();
});

async function mostrarQuejas() {
  const contenedor = document.getElementById("listaQuejas");
  contenedor.innerHTML = "";
  const snapshot = await getDocs(quejasRef);

  snapshot.forEach((docu) => {
    const data = docu.data();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${data.usuario.nombre}</h3>
      <p><strong>Email:</strong> ${data.usuario.email}</p>
      <p><strong>Mensaje:</strong> ${data.mensaje}</p>
      <p><strong>Etiquetas:</strong> ${data.etiquetas.join(", ")}</p>
      <button onclick="editar('${docu.id}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">Editar</button>
      <button onclick="eliminar('${docu.id}')">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });
}

window.editar = (id, datos) => {
  form.nombre.value = datos.usuario.nombre;
  form.email.value = datos.usuario.email;
  form.mensaje.value = datos.mensaje;
  form.etiquetas.value = datos.etiquetas.join(", ");
  idActual = id;
  editando = true;
  form.querySelector("button").textContent = "Actualizar";
};

window.eliminar = async (id) => {
  await deleteDoc(doc(db, "quejas", id));
  mostrarQuejas();
};

mostrarQuejas();
