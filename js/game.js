// game.js
// Inicialización básica de Phaser y escena principal

class TetrisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TetrisScene' });

        // Inicializar colores en el constructor
        this.colors = [0x0000ff, 0xffff00, 0xff0000]; // Azul, amarillo, rojo
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

        // Configurar temporizador para movimiento lateral
        this.lastLateralMoveTime = 0;
        this.lateralMoveCooldown = 150; // Tiempo mínimo entre movimientos laterales en milisegundos

        this.input.keyboard.on('keydown-LEFT', () => {
            this.handleLateralMove(-1);
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.handleLateralMove(1);
        });
    }

    update(time) {
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

    handleLateralMove(direction) {
        const currentTime = this.time.now;
        if (currentTime - this.lastLateralMoveTime > this.lateralMoveCooldown) {
            this.movePiece(direction);
            this.lastLateralMoveTime = currentTime;
        }
    }

    createPiece() {
        // Seleccionar una pieza aleatoria
        const index = Phaser.Math.Between(0, this.tetrominos.length - 1);
        const shape = this.tetrominos[index];

        // Asignar un único color aleatorio a toda la pieza
        const color = this.colors[Phaser.Math.Between(0, this.colors.length - 1)];
        return shape.map(row => row.map(cell => (cell ? color : 0)));
    }

    drawBoard() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let color = this.board[row][col] || 0x444444; // Usar el color del bloque o gris oscuro si está vacío
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
                        cell // Usar el color del bloque
                    ).setStrokeStyle(1, 0x222222);
                }
            });
        });
    }

    movePiece(direction) {
        const newPosition = { x: this.activePosition.x + direction, y: this.activePosition.y };

        // Verificar colisiones antes de mover
        if (!this.checkCollision(this.activePiece, newPosition)) {
            this.activePosition = newPosition;
            this.drawBoard();
            this.drawPiece(this.activePiece, this.activePosition);
        }
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
        // Fijar cada bloque de la pieza en el tablero
        piece.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const newX = position.x + x;
                    const newY = position.y + y;
                    if (this.board[newY]) {
                        this.board[newY][newX] = cell; // Guardar el color del bloque
                    }
                }
            });
        });

        // Aplicar gravedad a los bloques
        this.applyGravity();

        // Verificar y eliminar bloques conectados del mismo color
        this.clearConnectedBlocks();
    }

    applyGravity() {
        for (let col = 0; col < this.cols; col++) {
            let emptyRow = this.rows - 1;

            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.board[row][col]) {
                    // Si hay un bloque, moverlo hacia abajo
                    const temp = this.board[row][col];
                    this.board[row][col] = 0;
                    this.board[emptyRow][col] = temp;
                    emptyRow--;
                }
            }
        }
    }

    clearConnectedBlocks() {
        const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));

        const isValid = (x, y) => x >= 0 && x < this.cols && y >= 0 && y < this.rows;

        const dfs = (x, y, color) => {
            if (!isValid(x, y) || visited[y][x] || this.board[y][x] !== color) return 0;

            visited[y][x] = true;
            let size = 1;

            // Explorar las 4 direcciones
            size += dfs(x + 1, y, color);
            size += dfs(x - 1, y, color);
            size += dfs(x, y + 1, color);
            size += dfs(x, y - 1, color);

            return size;
        };

        const removeConnected = (x, y, color) => {
            if (!isValid(x, y) || this.board[y][x] !== color) return;

            this.board[y][x] = 0;

            // Explorar las 4 direcciones
            removeConnected(x + 1, y, color);
            removeConnected(x - 1, y, color);
            removeConnected(x, y + 1, color);
            removeConnected(x, y - 1, color);
        };

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] && !visited[row][col]) {
                    const color = this.board[row][col];
                    const size = dfs(col, row, color);

                    // Verificar si la conexión cubre de lado a lado
                    const connectedCols = new Set();
                    for (let r = 0; r < this.rows; r++) {
                        for (let c = 0; c < this.cols; c++) {
                            if (visited[r][c] && this.board[r][c] === color) {
                                connectedCols.add(c);
                            }
                        }
                    }

                    if (connectedCols.size === this.cols) {
                        // Eliminar bloques conectados
                        removeConnected(col, row, color);
                    }
                }
            }
        }

        // Aplicar gravedad después de eliminar bloques
        this.applyGravity();
    }

    removeConnectedBlocks(x, y, color) {
        const isValid = (x, y) => x >= 0 && x < this.cols && y >= 0 && y < this.rows;

        const dfs = (x, y) => {
            if (!isValid(x, y) || this.board[y][x] !== color) return;

            this.board[y][x] = 0;

            // Explorar las 4 direcciones
            dfs(x + 1, y);
            dfs(x - 1, y);
            dfs(x, y + 1);
            dfs(x, y - 1);
        };

        dfs(x, y);
        this.applyGravity();
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
    scene: [TetrisScene],
    fps: {
        target: 60, // Frecuencia de actualización a 60 Hz
        forceSetTimeOut: true // Asegurar que se respete el objetivo
    }
};

const game = new Phaser.Game(config);
