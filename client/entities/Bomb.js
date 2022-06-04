export default class Bomb extends Phaser.Physics.Matter.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode } = data

    if (serverMode) {
      super(scene.matter.world, x , y, '')
    } else {
      super(scene.matter.world, x , y, frame)
    }

    scene.add.existing(this)

    const { Body, Bodies } = Phaser.Physics.Matter.Matter
    const blockTestSensor = Bodies.rectangle(this.x, this.y, 1, 1, { isSensor: true, label: 'blockTestSensor', isStatic: true })
    const compoundBody = Body.create({
        parts: [blockTestSensor],
    })
    this.setExistingBody(compoundBody)
    
    this.setCollisionGroup(2)
    this.setCollidesWith(0)

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