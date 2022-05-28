export default class BreakableBlock extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode } = data

    if (serverMode) {
    super(scene, x, y, '')
    } else {
      super(...data)
    }

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.body.setSize(64, 64)
    this.setCollideWorldBounds(true)
  }
}