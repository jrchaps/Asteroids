import { V2 } from './math'

/*
    All angles are in degrees.
    All time values are in milliseconds.
    Local coordinate axes range from -1 to 1 with origin (0,0) in the center.
    Global coordinate axes range from 0 to 1 with origin (0,0) in the top-left corner. 
*/

type RGBA = ReturnType<typeof RGBA>
function RGBA() {
    return { r: 0, g: 0, b: 0, a: 0 }
}

type Ship = ReturnType<typeof Ship>
function Ship() {
    return {
        size: .05,
        orientation: 0,
        position: { x: .5, y: .5 },
        velocity: V2(),
        acceleration: V2(),
        vertices: [
            { x: 1, y: 0 }, 
            { x: -.8, y: -.6 }, 
            { x: -.8, y: .6 }
        ],
        color: { r: .87, g: .87, b: 1, a: 1 },
        explode: false,
        thrust: false,
        speedMax: .001,
        rotateCW: false,
        rotateCCW: false,
        rotationSpeed: .25,
        fire: false,
        fireRate: 300,
        tUntilFireable: 0,
        lives: 5,
        score: 0,
    }
}

type Bullet = ReturnType<typeof Bullet>
function Bullet() {
    return {
        size: .004,
        position: V2(),
        velocity: V2(),
        color: { r: .87, g: .87, b: 1, a: 1 },
        tUntilInactive: 0
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
        color: { r: .87, g: .87, b: 1, a: 1 },
        verticesIndex: 0,
        explode: false,
        sizeVariant: 0,
        spawnCount: 0,
        scoreOnHit: 0,
    }
}

type Explosion = ReturnType<typeof Explosion>
function Explosion({ position = V2() }) {
    return {
        size: 0,
        position,
        sizeMax: .05,
        expansionRate: .00015,
        particleSize: .0025,
        particleColor: { r: .87, g: .87, b: 1, a: 1 },
        particleCount: 8
    }
}

export {
    RGBA,
    Ship,
    Bullet,
    Asteroid,
    AsteroidSize,
    Explosion
}