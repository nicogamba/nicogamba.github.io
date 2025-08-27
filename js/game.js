// game.js
// Inicialización básica de Phaser y escena principal

class TetrisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TetrisScene' });
    }

    preload() {
        // Aquí se pueden cargar assets si se usan
    }

    create() {
        // Parámetros del tablero
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 32;

        // Crear matriz del tablero (relleno con ceros)
        this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

        // Definir los tetrominos (formas)
        this.tetrominos = [
            // I
            [
                [1, 1, 1, 1]
            ],
            // O
            [
                [1, 1],
                [1, 1]
            ],
            // T
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            // S
            [
                [0, 1, 1],
                [1, 1, 0]
            ],
            // Z
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            // J
            [
                [1, 0, 0],
                [1, 1, 1]
            ],
            // L
            [
                [0, 0, 1],
                [1, 1, 1]
            ]
        ];

        // Dibujar el tablero vacío
        this.drawBoard();
    }

    update() {
        // Actualización del juego
    }

    drawBoard() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let color = this.board[row][col] ? 0xffffff : 0x444444;
                this.add.rectangle(
                    col * this.cellSize + this.cellSize / 2,
                    row * this.cellSize + this.cellSize / 2,
                    this.cellSize - 2,
                    this.cellSize - 2,
                    color
                ).setStrokeStyle(1, 0x222222);
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 320,
    height: 640,
    parent: 'game-container',
    backgroundColor: '#222',
    scene: [TetrisScene]
};

const game = new Phaser.Game(config);
