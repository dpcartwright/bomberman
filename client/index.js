// imports for entities
import Avatar from '../entities/Avatar.js'
import Block from '../entities/Block.js'

const { SnapshotInterpolation, Vault } = Snap
const SI = new SnapshotInterpolation(15) // 15 FPS

const playerVault = new Vault()

class MainScene extends Phaser.Scene {
  constructor() {
    super()

    this.avatars = new Map()
    this.blocks = new Map()
    this.bombs = []

    this.bombCoolDown = false

    this.cursors

    this.socket = io('http://localhost:3000')
    this.socket.on('connect', () => {
      console.log('id:', this.socket.id)
    })
  }

  preload() {
    this.load.image('background', '../assets/stage_01_background.png')

    this.load.image('edge_block', '../assets/stage_01_edge_block.png')
    this.load.image('static_block', '../assets/stage_01_static_block.png')
    this.load.image('breakable_block', '../assets/stage_01_breakable_block.png')

    this.load.atlas('player_1', '../assets/players_01.png', '../assets/players_01_atlas.json')
    this.load.atlas('player_2', '../assets/players_02.png', '../assets/players_02_atlas.json')
    this.load.atlas('player_3', '../assets/players_03.png', '../assets/players_03_atlas.json')
    this.load.atlas('player_4', '../assets/players_04.png', '../assets/players_04_atlas.json')
    this.load.atlas('items_effects', '../assets/items_effects.png', '../assets/items_effects.json')
    

    this.load.animation('player_1_anim', '../assets/players_01_anim.json')
    this.load.animation('player_2_anim', '../assets/players_02_anim.json')
    this.load.animation('player_3_anim', '../assets/players_03_anim.json')
    this.load.animation('player_4_anim', '../assets/players_04_anim.json')
    this.load.animation('items_effects_anim', '../assets/items_effects_anim.json')

  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys()

    this.bombKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)

    const backgroundImage = this.add.sprite(0,0,'background')

    this.socket.on('snapshot', snapshot => {
      SI.snapshot.add(snapshot)
    })
    
    this.input.mouse.disableContextMenu()

    backgroundImage.setScale(2)
  }

  update() {
    this.socket.on('tooManyPlayers', playerCount => {
      console.log('Too many players already: ' + playerCount)
    })
    const snap = SI.calcInterpolation('x y', 'players')
    const blockSnap = SI.calcInterpolation('x y', 'blocks')

    if (!snap  || !blockSnap) return

    const { state } = snap
    const blockState = blockSnap.state
    
    if (!state || !blockState) return

    blockState.forEach(block => {
      const exists = this.blocks.has(block.id)

      if (!exists) {
        const _block = new Block({scene: this, x: block.x, y: block.y, blockType: block.blockType})
        this.blocks.set(block.id, 
          { block: _block }
          )
      } else {
        const _block = this.blocks.get(block.id).block
        _block.setX(block.x)
        _block.setY(block.y)
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
        const frame = 'player_' + avatar.playerNumber
        const _avatar = new Avatar({scene: this,x: avatar.x, y: avatar.y, frame: frame})
        _avatar.setData({playerNumber: avatar.playerNumber, playerAnimFrame: avatar.playerAnimFrame})
        this.avatars.set(avatar.id, { avatar: _avatar })
      } else {
        if (avatar.id != this.socket.id) {
          const _avatar = this.avatars.get(avatar.id).avatar
          _avatar.setX(avatar.x)
          _avatar.setY(avatar.y)
          _avatar.setData({playerAnimFrame: avatar.playerAnimFrame})
          _avatar.anims.play(_avatar.getData('playerAnimFrame'),true)
        }
      }
    })

    this.clientPrediction(movement)

    this.serverReconciliation(movement)
    
    this.socket.emit('movement', movement)

    if (this.bombKey.isDown && !this.bombCoolDown) {
      this.bombCoolDown = true
      this.socket.emit('dropBomb', {x: 100, y: 100})
      setTimeout(() => this.bombCoolDown = false, 1000)
    }
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
    this.playerAnimation(player)
  }
}

  playerAnimation(player) {
    const playerPrefix = 'p' + player.getData('playerNumber')
    if (player.body.velocity.y <  0 ) { 
      player.anims.play(playerPrefix + '_walk_up',true) 
    } else if (player.body.velocity.y >  0 ) {
      player.anims.play(playerPrefix + '_walk_down',true) 
    } else if (player.body.velocity.x <  0 ) {
      player.anims.play(playerPrefix + '_walk_left',true) 
    } else if (player.body.velocity.x >  0 ) {
      player.anims.play(playerPrefix + '_walk_right',true)
    } else {
      player.anims.play(playerPrefix + '_stand',true)
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
