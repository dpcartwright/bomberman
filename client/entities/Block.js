export default class Block extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode, blockType, blockID } = data

    switch (blockType) {
      case "e":
        frame = 'edge_block'
        break
      case "s":
        frame = 'static_block'
        break
      default:
        // probably a "b"
        frame = 'breakable_block'
    }

    if (serverMode) {
      super(scene, x, y, '')
    } else {
      super(scene, x, y, frame)
    }

    this.blockType = blockType
    this.blockID = blockID

    scene.add.existing(this)
    scene.physicsBlocks.add(this)
    this.body.setSize(64,64)
    this.setImmovable()

    //this.physics.add.collider(this, )
/*
    const { Body, Bodies } = Phaser.Physics.Arcade.Arcade
    const blockCollider = Bodies.rectangle(this.x, this.y, 64, 64, { isSensor: false, label: 'blockCollider', isStatic: true })
    const blockTestSensor = Bodies.rectangle(this.x, this.y, 64, 64, { isSensor: true, label: 'blockTestSensor', isStatic: true })
    const compoundBody = Body.create({
        parts: [blockCollider, blockTestSensor],
    })
    this.setExistingBody(compoundBody)

    this.setCollisionGroup(1)
    this.setCollidesWith(0)
    
    this.createTouchCollisions(blockCollider)
    this.createTestCollisions(blockTestSensor)

    this.setFixedRotation()
    this.setStatic(true)
*/
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