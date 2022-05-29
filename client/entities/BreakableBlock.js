export default class BreakableBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode } = data

    if (serverMode) {
    super(scene, x, y, '')
    } else {
      super(scene, x, y, frame)
    }

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setOrigin(0)

    this.body.setSize(64, 64)
  }
}