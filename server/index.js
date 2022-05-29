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
import EdgeBlock from '../client/entities/EdgeBlock.js'
import StaticBlock from '../client/entities/StaticBlock.js'

// imports for assets
const stageBlocks = Object.values(JSON.parse(fs.readFileSync(__dirname + '/../client/stages/01.json', 'utf8')))

// imports for scenes


class ServerScene extends Phaser.Scene {
  constructor() {
    super()
    this.tick = 0
    this.blockID = 0
    this.players = new Map()
    this.edgeBlocks= new Map()
    this.staticBlocks= new Map()
    this.breakableBlocks= new Map()
  }

  preload() {

  }

  create() {
    this.matter.world.setBounds(0, 0, 1024, 832)

    // create all blocks
    let rowCount = 0
    let colCount = 0
    let blockID = 0
    stageBlocks.forEach(rows => {
      rows.forEach(cols => {
        switch (cols) {
          case "e":
            let newEdgeBlock = new EdgeBlock({scene: this, x: (colCount * 64), y: (rowCount * 64), serverMode: true})
            blockID = this.blockID
            this.edgeBlocks.set(blockID, {
              blockID, 
              newEdgeBlock
            })
            this.blockID++
            break
          case "s":
            let newStaticBlock = new StaticBlock({scene: this, x: (colCount * 64), y: (rowCount * 64), serverMode: true})
            blockID = this.blockID
            this.staticBlocks.set(blockID, {
              blockID, 
              newStaticBlock
            })
            this.blockID++
            break
          case "b":
            // introduce small chance of skipping block creation
            const skipBlock = Math.random()
            if (skipBlock > 0.06) {
              let newBreakableBlock = new BreakableBlock({scene: this, x: (colCount * 64), y: (rowCount * 64), serverMode: true})
              blockID = this.blockID
              this.breakableBlocks.set(blockID, {
                blockID, 
                newBreakableBlock
              })
              this.blockID++
            }
          default:
            // nothing to do - should be an "x" to signify this is a blank space
        }
        colCount++
      })
      colCount = 0
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
        const speed = 16

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
    const edgeBlocksArr = []
    this.edgeBlocks.forEach(edgeBlock => {
      const { blockID, newEdgeBlock } = edgeBlock
      edgeBlocksArr.push({ id: blockID, x: newEdgeBlock.x, y: newEdgeBlock.y })
    })
    // get an array of all breakableBlocks
    const staticBlocksArr = []
    this.staticBlocks.forEach(staticBlock => {
      const { blockID, newStaticBlock } = staticBlock
      staticBlocksArr.push({ id: blockID, x: newStaticBlock.x, y: newStaticBlock.y })
    })
    // get an array of all breakableBlocks
    const breakableBlocksArr = []
    this.breakableBlocks.forEach(breakableBlock => {
      const { blockID, newBreakableBlock } = breakableBlock
      breakableBlocksArr.push({ id: blockID, x: newBreakableBlock.x, y: newBreakableBlock.y })
    })
    
    const worldState = {
      players: avatars,
      edgeBlocks: edgeBlocksArr,
      staticBlocks: staticBlocksArr,
      breakableBlocks: breakableBlocksArr
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
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: false,
      debugBodyColor: 0xff00ff
    },
  }
}

new Phaser.Game(config)

app.use('/', express.static(path.join(__dirname, '../client')))

server.listen(3000)
