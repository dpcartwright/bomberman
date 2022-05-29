export default class BreakableBlock extends Phaser.Physics.Matter.Sprite {
  constructor(data) {
    let { scene, x, y, frame, serverMode } = data

    if (serverMode) {
      super(scene.matter.world, x, y, '')
    } else {
      super(scene.matter.world, x, y, frame)
    }

    scene.add.existing(this)
    /*
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    var enemyCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'enemyCollider' });
    var enemySensor = Bodies.circle(this.x, this.y, 80, { isSensor: true, label: 'enemySensor' });
    const compoundBody = Body.create({
        parts: [enemyCollider, enemySensor],
        frictionAir: 0.35,
    });
    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.scene.matterCollision.addOnCollideStart({
        objectA: [enemySensor],
        callback: other => { if (other.gameObjectB && other.gameObjectB.name == 'player') this.attacking = other.gameObjectB; },
        context: this.scene,
    });
*/
    this.setOrigin(0)

    //this.body.setSize(64, 64)
  }
}