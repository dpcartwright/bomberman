export default class Avatar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, serverMode) {
      if (serverMode) {
        super(scene, x, y, '')
      } else {
        super(scene, x, y)
      }
      scene.add.existing(this)
      scene.physics.add.existing(this)
  
      this.body.setSize(32, 48)
    }
  }