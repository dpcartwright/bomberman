
import Explosion from '../entities/Explosion.js'

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
    let explosionNorthBlockedAt = this.bombRange + 1
    let explosionEastBlockedAt = this.bombRange + 1
    let explosionSouthBlockedAt = this.bombRange + 1
    let explosionWestBlockedAt = this.bombRange + 1
    let entitiesInExplosion = []
    for (let i = 1; i <= this.bombRange; i++) {
      // check north
      if (explosionNorthBlockedAt > this.bombRange) {
        let checkSprite = this.scene.add.sprite(this.x, this.y - 64 * i)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          hitEntity.hitWithExplosion()
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionNorthBlockedAt = i
          }
        })
      }
      // check east
      if (explosionEastBlockedAt > this.bombRange) {
        let checkSprite = this.scene.add.sprite(this.x + 64 * i, this.y)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          hitEntity.hitWithExplosion()
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionEastBlockedAt = i
          }
        })
      }
      // check south
      if (explosionSouthBlockedAt > this.bombRange) {
        let checkSprite = this.scene.add.sprite(this.x, this.y + 64 * i)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          hitEntity.hitWithExplosion()
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionSouthBlockedAt = i
          }
        })
      }
      // check west
      if (explosionWestBlockedAt > this.bombRange) {
        let checkSprite = this.scene.add.sprite(this.x - 64 * i, this.y)
        this.scene.physics.add.existing(checkSprite)
        checkSprite.body.setSize(60,60)
        checkSpriteArr.push(checkSprite)
        this.scene.physics.add.overlap(checkSprite,this.scene.physicsBlocks,function(explosionCollider,hitEntity) {
          hitEntity.hitWithExplosion()
          // if we have hit a block the explosion is blocked from going further
          if (typeof hitEntity.blockType !== 'undefined') {
            explosionWestBlockedAt = i
          }
        })
      }
    }

    // explosion damage effect only lasts for 20 msec - then destroy all colliders
    setTimeout(() => {
      let _explosionCentre = new Explosion({scene: checkSpriteArr[0].scene, x: this.x, y: this.y, frame: 'explosion_centre'})
      _explosionCentre.anims.play('explosion_centre_anim', true)
      _explosionCentre.once('animationcomplete', () => {
        _explosionCentre.destroy()
      })
      for (let i = 1; i <= this.bombRange; i++) {
        //north
        if (i < explosionNorthBlockedAt) {
          let _explosionNorth = new Explosion({scene: checkSpriteArr[0].scene, x: this.x, y: this.y - 64 * i, frame: 'explosion_north'})
          _explosionNorth.anims.play('explosion_north_anim', true)
          _explosionNorth.once('animationcomplete', () => {
            _explosionNorth.destroy()
          })
        }
        //east
        if (i < explosionEastBlockedAt) {
          let _explosionEast = new Explosion({scene: checkSpriteArr[0].scene, x: this.x + 64 * i, y: this.y, frame: 'explosion_east'})
          _explosionEast.anims.play('explosion_east_anim', true)
          _explosionEast.once('animationcomplete', () => {
            _explosionEast.destroy()
          })
        }
        //south
        if (i < explosionSouthBlockedAt) {
          let _explosionSouth = new Explosion({scene: checkSpriteArr[0].scene, x: this.x, y: this.y + 64 * i, frame: 'explosion_centre'})
          _explosionSouth.anims.play('explosion_centre_anim', true)
          _explosionSouth.once('animationcomplete', () => {
            _explosionSouth.destroy()
          })
        }
        //west
        if (i < explosionWestBlockedAt) {
          let _explosionWest= new Explosion({scene: checkSpriteArr[0].scene, x: this.x - 64 * i, y: this.y, frame: 'explosion_centre'})
          _explosionWest.anims.play('explosion_centre_anim', true)
          _explosionWest.once('animationcomplete', () => {
            _explosionWest.destroy()
          })
        }
      }
      checkSpriteArr.forEach((checkSprite) => checkSprite.destroy())
      console.log('north:')
      console.log(explosionNorthBlockedAt)
      console.log('east:')
      console.log(explosionEastBlockedAt)
      console.log('south:')
      console.log(explosionSouthBlockedAt)
      console.log('west:')
      console.log(explosionWestBlockedAt)
    }, 20)

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