/*
    All angles are in degrees.
    All time values are in milliseconds.
    Global and local coordinate axes range from -1 to 1 with origin (0,0) in the center.
*/

type RGBA = ReturnType<typeof RGBA>
function RGBA({ r = 0, g = 0, b = 0, a = 0} = {}) {
    return { r, g, b, a }
}

type Ship = ReturnType<typeof Ship>
function Ship({
    size = .1,
    orientation = 0,
    position = { x: 0, y: 0 },
    velocity = { x: 0, y: 0 },
    vertices = [
        { x: 1, y: 0 }, 
        { x: -.8, y: -.6 }, 
        { x: -.8, y: .6 }
    ],
    color = { r: .87, g: .87, b: 1, a: 1 },
    explode = false,
    thrust = false,
    speedMax = .002,
    rotateCW = false,
    rotateCCW = false,
    rotationSpeed = .25,
    fire = false,
    fireRate = 300,
    tUntilFireable = 0,
    lives = 5,
    score = 0,
} = {}) {
    return {
        size,
        orientation,
        position,
        velocity,
        vertices,
        color,
        explode,
        thrust,
        speedMax,
        rotateCW,
        rotateCCW,
        rotationSpeed,
        fire,
        fireRate,
        tUntilFireable,
        lives,
        score,
    }
}

type Bullet = ReturnType<typeof Bullet>
function Bullet({
    size = .008,
    position = { x: 0, y: 0 },
    velocity = { x: 0, y: 0 },
    color = { r: .87, g: .87, b: 1, a: 1 },
    tUntilInactive = 800
} = {}) {
    return {
        size,
        position,
        velocity,
        color,
        tUntilInactive
    }
}

type Asteroid = ReturnType<typeof Asteroid>
function Asteroid({
    size = 0,
    orientation = 0,
    position = { x: 0, y: 0 },
    velocity = { x: 0, y: 0 },
    color = { r: .87, g: .87, b: 1, a: 1 },
    verticesIndex = 0,
    explode = false,
    sizeVariant = AsteroidSize.small,
    spawnCount = 0,
    scoreOnHit = 0,
} = {}) {
    return {
        size,
        orientation,
        position,
        velocity,
        color,
        verticesIndex,
        explode,
        sizeVariant,
        spawnCount,
        scoreOnHit,
    }
}

enum AsteroidSize {
    small,
    medium,
    large,
}

type Explosion = ReturnType<typeof Explosion>
function Explosion({
    size = 0,
    position = { x: 0, y: 0 },
    sizeMax = .1,
    expansionRate = .0003,
    particleSize = .005,
    particleColor = { r: .87, g: .87, b: 1, a: 1 },
    particleCount = 8
} = {}) {
    return {
        size,
        position,
        sizeMax,
        expansionRate,
        particleSize,
        particleColor,
        particleCount
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