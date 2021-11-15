import { RGBA, Pool } from './utils'
import { V2 } from './math'

// All angles are in degrees.
// All time values are in milliseconds.
/*
    Local coordinate axes range from -1 to 1 with origin (0,0) in the center.
    Global coordinate axes range from 0 to 1 with origin (0,0) in the top-left corner. 
*/

type State = ReturnType<typeof State>
function State() {
    return {
        initialized: false,
        backgroundColor: RGBA(),
        entityColor: RGBA(),
        textColor: RGBA(),
    }
}

type Ship = ReturnType<typeof Ship>
function Ship() {
    return {
        size: 0,
        orientation: 0,
        position: V2(),
        velocity: V2(),
        acceleration: V2(),
        vertices: Array<V2>(),
        color: RGBA(),
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
}

type Bullet = ReturnType<typeof Bullet>
function Bullet() {
    return {
        position: V2(),
        velocity: V2(),
        tUntilInactive: 0
    }
}

type Bullets = ReturnType<typeof Bullets>
function Bullets() {
    return {
        size: 0,
        color: RGBA(),
        ...Pool<Bullet>(),
    }
}

enum AsteroidSize {
    small,
    medium,
    large,
}

type Asteroid = ReturnType<typeof Asteroid>
function Asteroid() {
    return {
        size: 0,
        orientation: 0,
        position: V2(),
        velocity: V2(),
        verticesIndex: 0,
        explode: false,
        sizeVariant: 0
    }
}

type Asteroids = ReturnType<typeof Asteroids>
function Asteroids() {
    return {
        color: RGBA(),
        vertices: Array(Array<V2>()),
        startingPositions: Array<V2>(),
        startingVelocities: Array<V2>(),
        ...Pool<Asteroid>()
    }
}

type ExplosionEffect = ReturnType<typeof ExplosionEffect>
function ExplosionEffect() {
    return {
        size: 0,
        position: V2()
    }
}

type Explosions = ReturnType<typeof Explosions>
function Explosions() {
    return {
        effects: Array<ExplosionEffect>(),
        sizeMax: 0,
        expansionRate: 0,
        particleSize: 0,
        particleColor: RGBA(),
        particlesPerEffect: 0
    }
}

export {
    State,
    Ship,
    Bullets,
    Asteroids,
    AsteroidSize,
    Explosions,
}