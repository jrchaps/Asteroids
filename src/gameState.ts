import { RGBA, Pool } from './utils'
import { V2 } from './math'

// All angles are in degrees.
// All time values are in milliseconds.
/*
    Local coordinate axes range from -1 to 1 with origin (0,0) in the center.
    Global coordinate axes range from 0 to 1 with origin (0,0) in the top-left corner. 
*/

interface Game {
    initialized: boolean
    backgroundColor: RGBA
    entityColor: RGBA
    textColor: RGBA
}

let game: Game = {
    initialized: false,
    backgroundColor: { r: 0, g: 0, b: 0, a: 0 },
    entityColor: { r: 0, g: 0, b: 0, a: 0 },
    textColor: { r: 0, g: 0, b: 0, a: 0 },
}

interface Ship {
    size: number
    orientation: number
    position: V2
    velocity: V2
    acceleration: V2
    vertices: V2[]
    color: RGBA
    explode: boolean
    thrust: boolean
    speedMax: number
    rotateCW: boolean
    rotateCCW: boolean
    rotationSpeed: number
    fire: boolean
    fireRate: number 
    tUntilFireable: number
    lives: number
    score: number
}

let ship: Ship = {
    size: 0,
    orientation: 0,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    vertices: [],
    color: { r: 0, g: 0, b: 0, a: 0 },
    explode: false,
    thrust: false,
    speedMax: 0,
    rotateCW: false,
    rotateCCW: false,
    rotationSpeed: 0,
    fire: false,
    fireRate: 0,
    tUntilFireable: 0,
    lives: 0,
    score: 0,
}

interface Bullet {
    position: V2
    velocity: V2 
    tUntilInactive: number
}

interface Bullets extends Pool<Bullet> {
    size: number
    color: RGBA
}

let bullets: Bullets = {
    items: [],
    activeCount: 0,
    size: 0, 
    color: { r: 0, g: 0, b: 0, a: 0 },
}

interface Asteroid {
    size: number
    orientation: number
    position: V2
    velocity: V2
    verticesIndex: number
    explode: boolean
    sizeVariant: AsteroidSize
}

interface Asteroids extends Pool<Asteroid> {
    color: RGBA
    vertices: V2[][]
    startingPositions: V2[]
    startingVelocities: V2[]
}

let asteroids: Asteroids = {
    items: [],
    activeCount: 0, 
    color: { r: 0, g: 0, b: 0, a: 0 },
    vertices: [],
    startingPositions: [],
    startingVelocities: []
}

enum AsteroidSize {
    small,
    medium,
    large,
}

interface ExplosionEffect {
    size: number
    position: V2
}

interface Explosions {
    effects: ExplosionEffect[]
    sizeMax: number
    expansionRate: number
    particleSize: number
    particleColor: RGBA
    particlesPerEffect: number
}

let explosions: Explosions = {
    effects: [],
    sizeMax: 0,
    expansionRate: 0,
    particleSize: 0,
    particleColor: { r: 0, g: 0, b: 0, a: 0 },
    particlesPerEffect: 0,
}

let backgroundColor = { r: 0, g: 0, b: 0, a: 0 }
let entityColor = { r: 0, g: 0, b: 0, a: 0 }
let textColor = { r: 0, g: 0, b: 0, a: 0 }

export {
    game,
    ship,
    bullets,
    asteroids,
    AsteroidSize,
    explosions,
    backgroundColor,
    entityColor,
    textColor,
}