export default class BreakableBlock extends Phaser.Physics.Matter.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode } = data

    const blockSpriteOffset = 32 // half of block height - shouldn't be hardcoded like this

    if (serverMode) {
      super(scene.matter.world, x + blockSpriteOffset, y + blockSpriteOffset, '')
    } else {
      super(scene.matter.world, x + blockSpriteOffset, y + blockSpriteOffset, frame)
    }

    scene.add.existing(this)

    const { Body, Bodies } = Phaser.Physics.Matter.Matter
    const blockCollider = Bodies.rectangle(this.x, this.y, 64, 64, { isSensor: false, label: 'blockCollider', isStatic: true })
    const blockTestSensor = Bodies.rectangle(this.x, this.y, 64, 64, { isSensor: true, label: 'blockTestSensor', isStatic: true })
    const compoundBody = Body.create({
        parts: [blockCollider, blockTestSensor],
        frictionAir: 0.35,
    })
    this.setExistingBody(compoundBody)
    
    this.createTouchCollisions(blockCollider)
    this.createTestCollisions(blockTestSensor)

    this.setFixedRotation()
    this.setStatic(true)

    //this.body.setSize(64, 64)
  }
  
  createTouchCollisions(blockCollider) {
    /*     
    this.scene.matterCollision.addOnCollideStart({
        objectA: [playerSensor],
        callback: other => {
            if (other.bodyB.isSensor) return;
            this.touching.push(other.gameObjectB);
            console.log(this.touching.length, other.gameObjectB.name);
        },
        context: this.scene,
    });
    this.scene.matterCollision.addOnCollideEnd({
        objectA: [playerSensor],
        callback: other => {
            this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
            console.log(this.touching.length);
        },
        context: this.scene,
    });
    */
  }

  
  createTestCollisions(blockTestSensor) {
    /*     
    this.scene.matterCollision.addOnCollideStart({
        objectA: [playerSensor],
        callback: other => {
            if (other.bodyB.isSensor) return;
            this.touching.push(other.gameObjectB);
            console.log(this.touching.length, other.gameObjectB.name);
        },
        context: this.scene,
    });
    this.scene.matterCollision.addOnCollideEnd({
        objectA: [playerSensor],
        callback: other => {
            this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
            console.log(this.touching.length);
        },
        context: this.scene,
    });
    */
  }
}