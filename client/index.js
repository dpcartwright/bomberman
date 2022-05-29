// imports for entities
import Avatar from '../entities/Avatar.js'
import EdgeBlock from '../entities/EdgeBlock.js'
import StaticBlock from '../entities/StaticBlock.js'
import BreakableBlock from '../entities/BreakableBlock.js'

const { SnapshotInterpolation, Vault } = Snap
const SI = new SnapshotInterpolation(15) // 15 FPS

const playerVault = new Vault()

class MainScene extends Phaser.Scene {
  constructor() {
    super()

    this.avatars = new Map()
    this.edgeBlocks = new Map()
    this.staticBlocks = new Map()
    this.breakableBlocks = new Map()
    this.cursors

    this.socket = io('http://localhost:3000')
    this.socket.on('connect', () => {
      console.log('id:', this.socket.id)
    })
  }

  preload() {
    this.load.image('edge_block', '../assets/stage_01_edge_block.png')
    this.load.image('static_block', '../assets/stage_01_static_block.png')
    this.load.image('breakable_block', '../assets/stage_01_breakable_block.png')

    this.load.atlas('alchemist', '../assets/alchemist.png', '../assets/alchemist_atlas.json')
    this.load.animation('alchemist_anim', '../assets/alchemist_anim.json')

  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys()

    this.socket.on('snapshot', snapshot => {
      SI.snapshot.add(snapshot)
    })
    
    this.input.mouse.disableContextMenu();
  }

  update() {
    const snap = SI.calcInterpolation('x y', 'players')
    const edgeBlockSnap = SI.calcInterpolation('x y', 'edgeBlocks')
    const staticBlockSnap = SI.calcInterpolation('x y', 'staticBlocks')
    const breakableBlockSnap = SI.calcInterpolation('x y', 'breakableBlocks')
    if (!snap  || !edgeBlockSnap || !staticBlockSnap || !breakableBlockSnap) return

    const { state } = snap
    const edgeBlockState = edgeBlockSnap.state
    const staticBlockState = staticBlockSnap.state
    const breakableBlockState = breakableBlockSnap.state
    if (!state || !edgeBlockState || !staticBlockState || !breakableBlockState) return

    edgeBlockState.forEach(block => {
      const exists = this.edgeBlocks.has(block.id)

      if (!exists) {
        const _edgeBlock = new EdgeBlock({scene: this, x: block.x, y: block.y, frame: 'edge_block'})
        this.edgeBlocks.set(block.id, 
          { edgeBlock: _edgeBlock }
          )
      } else {
        const _edgeBlock = this.edgeBlocks.get(block.id).edgeBlock
        _edgeBlock.setX(block.x)
        _edgeBlock.setY(block.y)
      }
    })

    staticBlockState.forEach(block => {
      const exists = this.staticBlocks.has(block.id)

      if (!exists) {
        const _staticBlock = new StaticBlock({scene: this, x: block.x, y: block.y, frame: 'static_block'})
        this.staticBlocks.set(block.id, 
          { staticBlock: _staticBlock }
          )
      } else {
        const _staticBlock = this.staticBlocks.get(block.id).staticBlock
        _staticBlock.setX(block.x)
        _staticBlock.setY(block.y)
      }
    })

    breakableBlockState.forEach(block => {
      const exists = this.breakableBlocks.has(block.id)

      if (!exists) {
        const _breakableBlock = new BreakableBlock({scene: this, x: block.x, y: block.y, frame: 'breakable_block'})
        this.breakableBlocks.set(block.id, 
          { breakableBlock: _breakableBlock }
          )
      } else {
        const _breakableBlock = this.breakableBlocks.get(block.id).breakableBlock
        _breakableBlock.setX(block.x)
        _breakableBlock.setY(block.y)
      }
    })

    const movement = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown
    }

    state.forEach(avatar => {
      const exists = this.avatars.has(avatar.id)

      if (!exists) {
        const _avatar = new Avatar({scene: this,x: avatar.x, y: avatar.y, frame: 'alchemist'})
        this.avatars.set(avatar.id, { avatar: _avatar })

      } else {
        if (avatar.id != this.socket.id) {
          const _avatar = this.avatars.get(avatar.id).avatar
          _avatar.setX(avatar.x)
          _avatar.setY(avatar.y)
        } 
      }
    })

    this.clientPrediction(movement)
    this.serverReconciliation(movement)
    
    this.socket.emit('movement', movement)
  }
  
serverReconciliation = (movement) => {
  const { left, up, right, down } = movement
  const player = this.avatars.get(this.socket.id).avatar

  if (player) {
    // get the latest snapshot from the server
    const serverSnapshot = SI.vault.get()

    // get the closest player snapshot that matches the server snapshot time
    const playerSnapshot = playerVault.get(serverSnapshot.time, true)

    if (serverSnapshot && playerSnapshot) {
      // get the current player position on the server
      const serverPos = serverSnapshot.state.players.filter(s => s.id === this.socket.id)[0]
      
      // calculate the offset between server and client
      const offsetX = playerSnapshot.state[0].x - serverPos.x
      const offsetY = playerSnapshot.state[0].y - serverPos.y

      // check if the player is currently on the move
      const isMoving = left || up || right || down

      // we correct the position faster if the player moves
      const correction = isMoving ? 60 : 180

      // apply a step by step correction of the player's position
      player.x -= offsetX / correction
      player.y -= offsetY / correction
    }
  }
}

clientPrediction = (movement) => {
  const { left, up, right, down } = movement
  const speed = 16
  const player = this.avatars.get(this.socket.id).avatar

  if (player) {
    if (movement.left) player.setVelocityX(-speed)
    else if (movement.right) player.setVelocityX(speed)
    else player.setVelocityX(0)

    if (movement.up) player.setVelocityY(-speed)
    else if (movement.down) player.setVelocityY(speed)
    else player.setVelocityY(0)
    playerVault.add(
      SI.snapshot.create([{ id: this.socket.id, x: player.x, y: player.y }])
    )
  }
}
}

const config = {
  parent:'phaser-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 832,
    zoom: 1
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: true,
      debugBodyColor: 0xff00ff
    },
  },
  scene: [MainScene]
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
