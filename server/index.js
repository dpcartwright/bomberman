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
import BreakableBlock from '../client/entities/BreakableBlock.js'

// imports for assets
const tilemap = JSON.parse(fs.readFileSync(__dirname + '/../client/assets/bm_stage_01.json', 'utf8'))
const stageBlockTemplate = Object.values(JSON.parse(fs.readFileSync(__dirname + '/../client/stages/stage_01_block_template.json', 'utf8')))

// imports for scenes


class ServerScene extends Phaser.Scene {
  constructor() {
    super()
    this.tick = 0
    this.players = new Map()
    this.breakableBlocks= new Map()
  }

  preload() {
    this.load.tilemapTiledJSON('tilemap', tilemap);
    this.load.image('static_block_tiles', __dirname + '/../client/assets/stage_01_static_blocks.png')
  }

  create() {
    this.physics.world.setBounds(0, 0, 1024, 832)

    const map = this.make.tilemap({ key: 'tilemap' })   
    const staticBlockTiles = map.addTilesetImage('static_block_tiles', 'static_block_tiles', 64, 64, 0, 0)
    const staticBlockLayer = map.createLayer('static_block_layer', staticBlockTiles)
    staticBlockLayer.setCollisionByProperty({ collides: true })

    // block spaces = 13 x 11
    // every other row limited to every other block being space (first row and first column always fine)
    // exceptions in each corner for player starting positions
    // randomly remove ~10 blocks
    let rowCount = 0
    let blockID = 0
    stageBlockTemplate.forEach(rows => {
      rows.forEach(cols => {
        // introduce small chance of skipping block creation
        const skipBlock = Math.random()
        if (skipBlock > 0.06) {
          let newBlock = new BreakableBlock({scene: this, x: 64 + (cols * 64), y: 64 + (rowCount * 64), serverMode: true})
          this.breakableBlocks.set(blockID, {
            blockID, 
            newBlock
          })
          blockID++
        }
      })
      rowCount++
    })
    
    io.on('connection', socket => {
      const x = Math.random() * 180 + 40
      const y = Math.random() * 180 + 40
      const avatar = new Avatar({scene: this, x: x, y: y, serverMode: true})

      this.players.set(socket.id, {
        socket,
        avatar
      })

      socket.on('movement', movement => {
        const { left, right, up, down } = movement
        const speed = 160

        if (left) avatar.setVelocityX(-speed)
        else if (right) avatar.setVelocityX(speed)
        else avatar.setVelocityX(0)

        if (up) avatar.setVelocityY(-speed)
        else if (down) avatar.setVelocityY(speed)
        else avatar.setVelocityY(0)

      })

      socket.on('disconnect', reason => {
        const player = this.players.get(socket.id)
        player.avatar.destroy()
        this.players.delete(socket.id)
      })
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
      avatars.push({ id: socket.id, x: avatar.x, y: avatar.y })
    })

    // get an array of all breakableBlocks
    const blocks = []
    this.breakableBlocks.forEach(breakableBlock => {
      const { blockID, newBlock } = breakableBlock
      blocks.push({ id: blockID, x: newBlock.x, y: newBlock.y })
    })
    
    const worldState = {
      players: avatars,
      blocks: blocks
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
    }
  }
}

new Phaser.Game(config)

app.use('/', express.static(path.join(__dirname, '../client')))

server.listen(3000)
