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
    this.add.text(80, 300, '¡Tetris!', { fontSize: '32px', fill: '#fff' });
    // Aquí irá la lógica del juego
  }

  update() {
    // Actualización del juego
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
