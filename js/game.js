const WIDTH = 640;
const HEIGHT = 360;
const MIDDLE = [WIDTH / 2, HEIGHT / 2];

const gameScene = new Phaser.Scene('Game');

gameScene.init = function() {
  this.isTerminating = false;
  this.playerSpeed = 3;
  this.minSpeed = 1;
  this.maxSpeed = 4;
  this.minY = 80;
  this.maxY = HEIGHT - 80;
};

gameScene.preload = function() {
  this.load.image('background', '../img/background.png');
  this.load.image('enemy', '../img/dragon.png');
  this.load.image('player', '../img/player.png');
  this.load.image('goal', '../img/treasure.png');
};

gameScene.create = function() {
  this.background = this.add.sprite(MIDDLE[0], MIDDLE[1], 'background');

  this.player = this.add.sprite(40, MIDDLE[1], 'player');
  this.player.setScale(0.5);

  this.goal = this.add.sprite(WIDTH - 80, MIDDLE[1], 'goal');
  this.goal.setScale(0.6);

  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 4,
    setXY: {
      x: 110,
      y: 100,
      stepX: 95,
      stepY: 20
    }
  });
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);
  Phaser.Actions.Call(this.enemies.getChildren(), flipX, this);
  this.enemies.getChildren().map(enemy => setEnemySpeed(enemy, this.minSpeed, this.maxSpeed));
};

gameScene.update = function() {
  if (this.isTerminating) {
    return;
  }

  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  }

  this.enemies.getChildren().map(enemy => moveEnemy(enemy, this.minY, this.maxY));

  let playerBounds = this.player.getBounds();

  this.enemies.getChildren().map(enemy => {
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, enemy.getBounds())) {
      return this.gameOver();
    }
  });

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, this.goal.getBounds())) {
    return this.gameOver();
  }
};

gameScene.gameOver = function() {
  this.isTerminating = true;
  this.cameras.main.shake(500);
  this.cameras.main.on('camerashakecomplete', (camera, effect) => camera.fade(500));
  this.cameras.main.on('camerafadeoutcomplete', (camera, effect) => this.scene.restart());
};

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  scene: gameScene
};

const game = new Phaser.Game(config);

function flipX(sprite) {
  sprite.flipX = true;
}

function setEnemySpeed(sprite, minSpeed, maxSpeed) {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
  sprite.speed = dir * speed;
}

function moveEnemy(sprite, minY, maxY) {
  sprite.y += sprite.speed;

  if (sprite.y <= minY) {
    sprite.y = minY + 1;
    sprite.speed *= -1;
  }

  if (sprite.y >= maxY) {
    sprite.y = maxY - 1;
    sprite.speed *= -1;
  }
}
