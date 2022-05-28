// imports for phaser
const Phaser = require('phaser')

class ServerScene extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, '')
  
      scene.add.existing(this)
      scene.physics.add.existing(this)
  
      this.body.setSize(32, 48)
    }
  }

  module.exports = ServerScene