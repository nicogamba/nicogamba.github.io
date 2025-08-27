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

        // Inicializar pieza activa
        this.activePiece = this.createPiece();
        this.activePosition = { x: 3, y: 0 }; // Posición inicial

        // Inicializar puntaje
        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Puntaje: 0', { fontSize: '16px', fill: '#fff' });

        // Dibujar el tablero vacío
        this.drawBoard();
        // Dibujar la pieza activa
        this.drawPiece(this.activePiece, this.activePosition);

        // Configurar controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Agregar rotación al presionar la tecla arriba
        this.input.keyboard.on('keydown-UP', () => {
            this.rotatePiece();
        });

        // Configurar temporizador para que las piezas avancen automáticamente
        this.time.addEvent({
            delay: 500, // Intervalo en milisegundos
            callback: this.autoDropPiece,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // Mover pieza activa con controles
        if (this.cursors.left.isDown) {
            this.movePiece(-1);
        } else if (this.cursors.right.isDown) {
            this.movePiece(1);
        }

        if (this.cursors.down.isDown) {
            this.dropPiece();
        } else {
            this.checkCollisionAndFix();
        }
    }

    createPiece() {
        // Seleccionar una pieza aleatoria
        const index = Phaser.Math.Between(0, this.tetrominos.length - 1);
        return this.tetrominos[index];
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

    drawPiece(piece, position) {
        piece.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    this.add.rectangle(
                        (position.x + x) * this.cellSize + this.cellSize / 2,
                        (position.y + y) * this.cellSize + this.cellSize / 2,
                        this.cellSize - 2,
                        this.cellSize - 2,
                        0xff0000
                    ).setStrokeStyle(1, 0x222222);
                }
            });
        });
    }

    movePiece(direction) {
        // Mover pieza activa a la izquierda o derecha
        this.activePosition.x += direction;
        this.drawBoard();
        this.drawPiece(this.activePiece, this.activePosition);
    }

    checkCollision(piece, position) {
        return piece.some((row, y) => {
            return row.some((cell, x) => {
                if (cell) {
                    const newX = position.x + x;
                    const newY = position.y + y;

                    // Verificar límites del tablero
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }

                    // Verificar colisión con otras piezas
                    if (this.board[newY] && this.board[newY][newX]) {
                        return true;
                    }
                }
                return false;
            });
        });
    }

    fixPiece(piece, position) {
        piece.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const newX = position.x + x;
                    const newY = position.y + y;
                    if (this.board[newY]) {
                        this.board[newY][newX] = 1;
                    }
                }
            });
        });

        // Verificar y eliminar filas completas
        this.clearFullRows();
    }

    clearFullRows() {
        let rowsCleared = 0;

        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell === 1)) {
                // Eliminar fila completa
                this.board.splice(row, 1);
                // Agregar una fila vacía al inicio
                this.board.unshift(Array(this.cols).fill(0));
                rowsCleared++;
                row++; // Rechequear la misma fila tras el desplazamiento
            }
        }

        // Actualizar puntaje
        if (rowsCleared > 0) {
            this.score += rowsCleared * 10;
            this.scoreText.setText(`Puntaje: ${this.score}`);
        }
    }

    dropPiece() {
        const newPosition = { x: this.activePosition.x, y: this.activePosition.y + 1 };

        if (this.checkCollision(this.activePiece, newPosition)) {
            this.fixPiece(this.activePiece, this.activePosition);
            this.activePiece = this.createPiece();
            this.activePosition = { x: 3, y: 0 };
        } else {
            this.activePosition = newPosition;
        }

        this.drawBoard();
        this.drawPiece(this.activePiece, this.activePosition);
    }

    checkCollisionAndFix() {
        if (this.checkCollision(this.activePiece, this.activePosition)) {
            this.fixPiece(this.activePiece, this.activePosition);
            this.activePiece = this.createPiece();
            this.activePosition = { x: 3, y: 0 };
        }
    }

    rotatePiece() {
        // Crear una copia rotada de la pieza activa
        const rotatedPiece = this.activePiece[0].map((_, index) =>
            this.activePiece.map(row => row[index]).reverse()
        );

        // Verificar colisiones con la pieza rotada
        if (!this.checkCollision(rotatedPiece, this.activePosition)) {
            this.activePiece = rotatedPiece;
            this.drawBoard();
            this.drawPiece(this.activePiece, this.activePosition);
        }
    }

    autoDropPiece() {
        const newPosition = { x: this.activePosition.x, y: this.activePosition.y + 1 };

        if (this.checkCollision(this.activePiece, newPosition)) {
            this.fixPiece(this.activePiece, this.activePosition);
            this.activePiece = this.createPiece();
            this.activePosition = { x: 3, y: 0 };

            // Verificar si el juego termina
            if (this.checkCollision(this.activePiece, this.activePosition)) {
                this.endGame();
            }
        } else {
            this.activePosition = newPosition;
        }

        this.drawBoard();
        this.drawPiece(this.activePiece, this.activePosition);
    }

    endGame() {
        this.add.text(80, 320, '¡Juego Terminado!', { fontSize: '32px', fill: '#ff0000' });
        this.scene.pause();
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
