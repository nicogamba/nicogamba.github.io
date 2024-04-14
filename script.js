let textoDelPedido = "Hola!\nQuería realizar el siguiente pedido:\n\n";
let pedido = {};

function createItem(id) {
    let name = document.getElementById(id).getElementsByTagName("h2")[0].textContent;
    return {
        cant: 0,
        name
    }
}

function agregar(id) {
    if (!pedido.hasOwnProperty(id)) pedido[id] = createItem(id);
    pedido[id].cant++;
    actualizarCant(id)
}

function quitar(id) {
    if (pedido.hasOwnProperty(id) && pedido[id].cant > 0) {
        pedido[id].cant--;
        actualizarCant(id)
    }
}

function visibilidadBoton() {
    let botonReset = document.getElementById('boton-reset');
    let botonPedido = document.getElementById('boton-pedido');
    if (Object.keys(pedido).length === 0) {
        botonReset.style.visibility = 'hidden';
        botonPedido.style.visibility = 'hidden';
    } else {
        botonReset.style.visibility = 'visible';
        botonPedido.style.visibility = 'visible';
    }
}

function resetearPedido() {
    let keys = Object.keys(pedido);
    keys.forEach(key => {
        pedido[key].cant = 0;
        actualizarCant(key);
    });
    pedido = {};
    visibilidadBoton();
}

function actualizarCant(id) {
    let cant = document.getElementById(id).getElementsByClassName('cant')[0];
    cant.innerHTML = pedido[id].cant;
    sanitizarPedido();
    visibilidadBoton();
}

function sanitizarPedido() {
    let keys = Object.keys(pedido);
    keys.forEach(key => {
        if (pedido[key].cant == 0) delete pedido[key];
    });
}

function generarTexto() {
    let items = Object.keys(pedido);
    items.forEach(item => {
        textoDelPedido += `${pedido[item].name}: ${pedido[item].cant}\n`;
    });
}

function hacerPedido() {
    sanitizarPedido();
    generarTexto();
    window.location.href = "https://wa.me/5492213640726?text=" + encodeURIComponent(textoDelPedido);
}