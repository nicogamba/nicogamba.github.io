const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Lista de palabras de 5 letras
const words = ['manza', 'perro', 'flota', 'cielo', 'gatos', 'plaza', 'banco', 'vacas', 'lunas', 'pinto'];
let currentWord = words[Math.floor(Math.random() * words.length)];
let guesses = [];  // Mantener registro de las adivinanzas

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un jugador se ha conectado');
    
    // Enviar la palabra a adivinar al jugador
    socket.emit('startGame', { wordLength: currentWord.length });
    
    // Recibir adivinanza del jugador
    socket.on('guessWord', (guess) => {
        guesses.push(guess);
        
        if (guess === currentWord) {
            io.emit('gameOver', { winner: socket.id, correctWord: currentWord });
        } else {
            io.emit('updateGuesses', guesses);
        }
    });

    // Cuando un jugador se desconecta
    socket.on('disconnect', () => {
        console.log('Un jugador se ha desconectado');
    });
});

// Configurar el puerto del servidor
server.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});
