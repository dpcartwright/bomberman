// imports for server
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import path from 'path'
import fs from 'fs'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// dir and filenames
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// imports for phaser
import '@geckos.io/phaser-on-nodejs'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
const SI = new SnapshotInterpolation()
import Phaser from 'phaser'

// imports for entities
import Avatar from '../client/entities/Avatar.js'
import Block from '../client/entities/Block.js'
import Bomb from '../client/entities/Block.js'

// imports for assets
const stageBlocks = Object.values(JSON.parse(fs.readFileSync(__dirname + '/../client/stages/01.json', 'utf8')))

// imports for scenes


class ServerScene extends Phaser.Scene {
  constructor() {
    super()
    this.tick = 0
    this.blockID = 0
    this.players = new Map()
    this.blocks = new Map()
    this.bombs = new Map()
    this.spawnLocations = []
  }

  preload() {

  }

  create() {
    this.physics.world.setBounds(0, 0, 1024, 832)
    // create stage
    let rowCount = 0
    let colCount = 0
    let blockID = 0
    stageBlocks.forEach(rows => {
      rows.forEach(colEntry => {
        // "b" breakable blocks have a tiny chance of not being created. "e" edge and "s" static always are
        if (colEntry === "e" || colEntry === "s" || (colEntry === "b" && Math.random() > 0.05)) {
          let blockEntity = new Block({scene: this, x: (colCount * 64), y: (rowCount * 64), serverMode: true, blockType: colEntry})
          blockID = this.blockID
          this.blocks.set(blockID, {
            blockID, 
            blockEntity
          })
          this.blockID++
        } else if (parseInt(colEntry) >= 1 && parseInt(colEntry) < 100 ) {
          // only values of 1 to 100 will create spawn points
          this.spawnLocations.push({x: (colCount * 64), y: (rowCount * 64)})
        }
        colCount++
      })
      colCount = 0
      rowCount++
    })

    io.on('connection', socket => {
      
      if (this.players.size < this.spawnLocations.length) {
        const playerNumber = this.players.size
        const x = this.spawnLocations[playerNumber].x
        const y = this.spawnLocations[playerNumber].y
        const avatar = new Avatar({scene: this, x: x, y: y, serverMode: true})
        
        avatar.setData({playerNumber: playerNumber + 1})
        avatar.setData({playerAnimFrame: 'p' + avatar.getData('playerNumber') + '_stand'})

        this.players.set(socket.id, {
          socket,
          avatar
        })

        socket.on('movement', movement => {
          const { left, right, up, down } = movement
          const speed = 64

          if (left) avatar.setVelocityX(-speed)
          else if (right) avatar.setVelocityX(speed)
          else avatar.setVelocityX(0)

          if (up) avatar.setVelocityY(-speed)
          else if (down) avatar.setVelocityY(speed)
          else avatar.setVelocityY(0)

          const playerPrefix = 'p' + avatar.getData('playerNumber')
          let playerAnimFrame = ''

          if (avatar.body.velocity.y <  0 ) { 
            playerAnimFrame = playerPrefix + '_walk_up'
          } else if (avatar.body.velocity.y >  0 ) {
            playerAnimFrame = playerPrefix + '_walk_down'
          } else if (avatar.body.velocity.x <  0 ) {
            playerAnimFrame = playerPrefix + '_walk_left'
          } else if (avatar.body.velocity.x >  0 ) {
            playerAnimFrame = playerPrefix + '_walk_right'
          } else {
            playerAnimFrame = playerPrefix + '_stand'
            }
            
          avatar.setData({playerAnimFrame: playerAnimFrame})
        })

        socket.on('dropBomb', dropBomb => {
          const bombEntity = new Bomb({scene: this, x: dropBomb.x, y: dropBomb.y, serverMode: true})
          const bombID = this.bombs.size
          this.bombs.set(bombID, {
            bombID,
            bombEntity
          })
        })

        socket.on('disconnect', reason => {
          const player = this.players.get(socket.id)
          player.avatar.destroy()
          this.players.delete(socket.id)
        })
      } else {
        socket.emit('tooManyPlayers', this.players.size)
      }
    })
  }

  update() {
    this.tick++

    // only send the update to the client at 15 FPS (save bandwidth)
    if (this.tick % 4 !== 0) return

    // get an array of all avatars
    const avatars = []
    this.players.forEach(player => {
      const { socket, avatar } = player
      avatars.push({ id: socket.id, x: avatar.x, y: avatar.y, playerNumber: avatar.getData('playerNumber'), playerAnimFrame: avatar.getData('playerAnimFrame') })
    })

    // get an array of all blocks
    const blocksArr = []
    this.blocks.forEach(block => {
      const { blockID, blockEntity } = block
      blocksArr.push({ id: blockID, x: blockEntity.x, y: blockEntity.y, blockType: blockEntity.blockType })
    })

    // get an array of all bombs
    const bombsArr = []
    this.bombs.forEach(bomb => {
      const { bombID, bombEntity } = bomb
      bombsArr.push({ id: bombID, x: bombEntity.x, y: bombEntity.y })
    })
        
    const worldState = {
      players: avatars,
      blocks: blocksArr,
      bombs: bombsArr
    }

    const snapshot = SI.snapshot.create(worldState)
    SI.vault.add(snapshot)

    // send all avatars and blocks to all players
    this.players.forEach(player => {
      const { socket } = player
      socket.emit('snapshot', snapshot)
    })

  }
}

const config = {
  type: Phaser.HEADLESS,
  width: 1024,
  height: 832,
  zoom: 1,
  banner: false,
  audio: false,
  scene: [ServerScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    },
  }
}

new Phaser.Game(config)

app.use('/', express.static(path.join(__dirname, '../client')))

server.listen(3000)
