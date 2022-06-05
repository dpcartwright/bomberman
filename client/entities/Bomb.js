export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode } = data

    // align bombs to grid
    if (x % 64) x = Math.floor(x / 64) * 64 + 32
    if (y % 64) y = Math.floor(y / 64) * 64 + 32

    if (serverMode) {
      super(scene, x , y, '')
    } else {
      super(scene, x , y, frame)
    }

    scene.add.existing(this)
    scene.physicsBombs.add(this)
    this.body.setSize(64, 64)
    this.body.setImmovable()

    this.bombRange = 2

    this.isExploding = false
    setTimeout(() => this.explode(), 500)
/*
    const { Body, Bodies } = Phaser.Physics.Arcade.Arcade
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
*/
  }

  explode() {
    this.isExploding = true
    let checkSpriteArr = []
    let explosionNorth = new Map()
    let explosionEast = new Map()
    let explosionSouth = new Map()
    let explosionWest = new Map()
    let entitiesInExplosion = []
    for (let i = 1; i <= this.bombRange; i++) {
      // check north
      if (explosionNorth.size < 1) {
        let checkSprite = this.scene.add.sprite(this.x, this.y-64 * i)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(obj1,blockEntity) { 
          console.log(blockEntity)
          blockID = blockEntity.blockID
          this.explosionNorth.set(blockEntity.blockID, {
            blockID, 
            blockEntity
          })
        })
      }
      // check east
      if (explosionEast.length < 1) {
        let checkSprite = this.scene.add.sprite(this.x+64 * i, this.y)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(obj1,obj2) { 
          explosionEast.push(obj2)
        })
      }
      // check south
      if (explosionSouth.length < 1) {
        let checkSprite = this.scene.add.sprite(this.x, this.y+64 * i)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(obj1,obj2) { 
          explosionSouth.push(obj2)
        })
      }
      // check west
      if (explosionWest.length < 1) {
        let checkSprite = this.scene.add.sprite(this.x-64 * i, this.y)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(obj1,obj2) { 
          explosionWest.push(obj2)
        })
      }
      
    setTimeout(() => checkSpriteArr.forEach((checkSprite) => checkSprite.destroy()), 30)
    }
    
    console.log('north:')
    console.log(explosionNorth)
    console.log('east:')
    console.log(explosionEast)
    console.log('south:')
    console.log(explosionSouth)
    console.log('west:')
    console.log(explosionWest)

    this.scene.physicsBombs.remove(this)
    this.destroy()
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