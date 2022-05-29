export default class Avatar extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
      let { scene, x, y, frame, serverMode } = data

      if (serverMode) {
      super(scene.matter.world, x, y, '')
      } else {
        super(scene.matter.world, x, y, frame)
      }

      scene.add.existing(this)
      
      //this.body.setSize(64, 64)
    }
  }