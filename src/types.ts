import { RGBA, Pool } from './utils'
import { V2 } from './math'

interface Ship {
    vertices: V2[]
    size: number
    orientation: number
    position: V2
    velocity: V2
    acceleration: V2
    color: RGBA
    dead: boolean
    rotationSpeed: number
    fireRate: number 
    tUntilFireable: number
    rotateCW: boolean
    rotateCCW: boolean
    thrust: boolean
    fire: boolean
}

interface Bullet {
    position: V2
    velocity: V2 
    tUntilDead: number
}

interface Bullets extends Pool<Bullet> {
    color: RGBA
    size: number
}

interface Asteroid {
    verticesIndex: number
    size: number
    position: V2
    orientation: number
    velocity: V2
    dead: boolean
    sizeVariant: AsteroidSize
}

interface Asteroids extends Pool<Asteroid> {
    color: RGBA
    vertices: V2[][]
    startingPositions: V2[]
}

enum AsteroidSize {
    small,
    medium,
    large,
}

interface ExplosionEffect {
    position: V2
    size: number
}

interface Explosions {
    effects: ExplosionEffect[]
    expansionRate: number
    sizeMax: number
    particlesPerEffect: number
    particleSize: number
    particleColor: RGBA
}

export { 
    Ship, 
    Bullet, 
    Bullets,
    Asteroid, 
    AsteroidSize,
    Asteroids,
    Explosions,
    ExplosionEffect
}