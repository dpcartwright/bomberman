export default class Avatar extends Phaser.Physics.Arcade.Sprite {
    constructor(data) {
      let { scene, x, y, frame, serverMode } = data
        
      if (serverMode) {
        super(scene, x, y, '')
      } else {
        super(scene, x , y, frame)
      }

      this.setOrigin(0.7,0.9)
        
      scene.add.existing(this)
      scene.physicsAvatars.add(this)
      this.body.setSize(50,50)
      this.body.setOffset(-3,14)
      this.body.setBounce(0)
      this.body.setCollideWorldBounds()

      
      this.processingDamage = false

/*
      const { Body, Bodies } = Phaser.Physics.Arcade.Arcade
      const avatarCollider = Bodies.rectangle(this.x, this.y + 4, 60, 66,  { isSensor: false, label: 'avatarCollider' })
      const avatarTestSensor = Bodies.rectangle(this.x, this.y + 4, 40, 60,  { isSensor: true, label: 'avatarTestSensor' })
      const compoundBody = Body.create({
          parts: [avatarCollider, avatarTestSensor],
          frictionAir: 0.9,
      })
      this.setExistingBody(compoundBody)
      
    this.setCollisionGroup(1)
    this.setCollidesWith(0)

      this.setFixedRotation()
      this.createTouchCollisions(avatarCollider)
      this.createTestCollisions(avatarTestSensor)
      */
    }

    hitWithExplosion() {
        this.processingDamage = true
        // only actually do anything if it's a "b" breakable block

      }
    
    createTouchCollisions(avatarCollider) {
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

    
    createTestCollisions(avatarTestSensor) {
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