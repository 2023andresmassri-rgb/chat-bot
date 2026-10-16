// Referencias a las partes del boceto
const zonaChat = document.getElementById("zona-chat");
const zonaOpciones = document.getElementById("zona-opciones");

// Estado de la aplicación
let arbolDecision = null;
let estadoUsuario = {
  nombre: "",
  equipo: ""
};

// Cargar el árbol de decisión con fetch
fetch("arbol_decision.json")
  .then((respuesta) => {
    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo de conversación.");
    }
    return respuesta.json();
  })
  .then((data) => {
    arbolDecision = data;
    // Iniciar la conversación en el nodo inicial
    irANodo("inicio");
  })
  .catch((error) => {
    console.error(error);
    mostrarMensajeError(
      "Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json"
    );
  });

// Función para mostrar mensajes de error
function mostrarMensajeError(texto) {
  zonaChat.innerHTML = "";
  const msgDiv = document.createElement("div");
  msgDiv.className = "mensaje mensaje-error";
  msgDiv.textContent = texto;
  zonaChat.appendChild(msgDiv);
}

// Función principal de navegación entre nodos
function irANodo(idNodo) {
  const nodo = arbolDecision[idNodo];
  if (!nodo) {
    console.error(`El nodo "${idNodo}" no existe en el árbol.`);
    return;
  }

  // Reemplazar variables dinámicas en los textos (ej: {{nombre}}, {{equipo}})
  let textoBot = reemplazarVariables(nodo.texto);

  // Agregar mensaje del bot al chat
  agregarMensajeChat(textoBot, "bot");

  // Renderizar las opciones o inputs correspondientes
  renderizarOpciones(nodo);
}

// Función para agregar un mensaje a la zona-chat
function agregarMensajeChat(texto, emisor) {
  const divMensaje = document.createElement("div");
  divMensaje.className = `mensaje mensaje-${emisor}`;
  divMensaje.textContent = texto;
  zonaChat.appendChild(divMensaje);
  
  // Scroll automático hacia abajo
  zonaChat.scrollTop = zonaChat.scrollHeight;
}

// Renderiza los botones de opciones o inputs en la zona-opciones
function renderizarOpciones(nodo) {
  zonaOpciones.innerHTML = "";

  // Si el nodo requiere entrada de datos del usuario
  if (nodo.requiereInput) {
    crearCampoInput(nodo);
    return;
  }

  // Si no requiere input, creamos los botones de opciones
  if (nodo.opciones && nodo.opciones.length > 0) {
    nodo.opciones.forEach((opcion) => {
      const boton = document.createElement("button");
      boton.className = "btn-opcion";

      // Aplicar estilos secundarios si es para volver o finalizar
      if (opcion.siguiente === "menu_principal" || opcion.siguiente === "inicio") {
        boton.classList.add("btn-secundario");
      } else if (opcion.siguiente === "fin") {
        boton.classList.add("btn-peligro");
      }

      boton.textContent = opcion.texto;

      boton.addEventListener("click", () => {
        // Guardar la elección si la opción especifica guardar un dato
        if (opcion.guardarEquipo) {
          estadoUsuario.equipo = opcion.guardarEquipo;
        }

        // Agregar mensaje de selección del usuario
        agregarMensajeChat(opcion.texto, "usuario");

        // Avanzar al siguiente nodo
        irANodo(opcion.siguiente);
      });

      zonaOpciones.appendChild(boton);
    });
  }
}

// Crear un input con validación estricta
function crearCampoInput(nodo) {
  const contenedor = document.createElement("div");
  contenedor.className = "input-container";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = nodo.placeholder || "Escribí acá...";

  const botonEnviar = document.createElement("button");
  botonEnviar.textContent = "Enviar";

  const procesarEntrada = () => {
    const valor = input.value.trim();

    // Validación según el tipo requerido
    if (nodo.tipoInput === "nombre") {
      const regexSoloLetras = /^[a-zA-A-ÿ\s]+$/;
      if (!valor || !regexSoloLetras.test(valor)) {
        alert("Por favor, ingresá un nombre válido (solo letras, sin números).");
        return;
      }
      estadoUsuario.nombre = valor;
    }

    // Agregar la respuesta del usuario al chat
    agregarMensajeChat(valor, "usuario");

    // Avanzar al siguiente nodo
    irANodo(nodo.siguiente);
  };

  botonEnviar.addEventListener("click", procesarEntrada);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") procesarEntrada();
  });

  contenedor.appendChild(input);
  contenedor.appendChild(botonEnviar);
  zonaOpciones.appendChild(contenedor);
  input.focus();
}

// Reemplazar marcas de posición por variables guardadas
function reemplazarVariables(texto) {
  return texto
    .replace(/{{nombre}}/g, estadoUsuario.nombre || "Amigo/a")
    .replace(/{{equipo}}/g, estadoUsuario.equipo || "tu equipo favorito");
}
