/*
    Todos:
    -- Change the coordinate system to reflect normal math.
    -- Use WebGl.
*/

// Prevent input when user isn't focused on inner window?
onkeydown = function(ev: KeyboardEvent) { processKeyboardInput(ev) }
onkeyup = function(ev: KeyboardEvent) { processKeyboardInput(ev) }
let canvas = document.querySelector('canvas')!
let ctx = canvas.getContext('2d')!
let timestampPrev = 0
/*
        The user hiding the app causes the browser to pause all request
    animation frames, causing tDelta to approach infinity. I'm not sure 
    if the code below is the best way to deal with this.
*/
document.onvisibilitychange = function() {
    if (document.visibilityState == 'hidden') {
        timestampPrev = 0        
    }
}

let ship = Ship()
let bullets: Bullet[] = []
let asteroids: Asteroid[] = []
let explosions: Explosion[] = []
let spaceColor = { r: 0, g: .03, b: .11, a: 1 }
let backgroundColor = { r: .075, b: .075, g: .075, a: 1 } 
let textColor = { r: .87, g: .87, b: 1, a: 1 }

let asteroidsVertices = [
        [
            v2Direction(-135),
            v2Direction(-60, .45),
            v2Direction(-30),
            v2Direction(-350),
            v2Direction(-270),
            v2Direction(-200),
        ],
        [
            v2Direction(-135),
            v2Direction(-115, .4),
            v2Direction(-45),
            v2Direction(0),
            v2Direction(-290),
            v2Direction(-210),
        ],
        [
            v2Direction(-90),
            v2Direction(-15),
            v2Direction(-315),
            v2Direction(-295, .55),
            v2Direction(-240),
            v2Direction(-165),
        ],
        [
            v2Direction(0),
            v2Direction(-345, .5),
            v2Direction(-315),
            v2Direction(-250),
            v2Direction(-180),
            v2Direction(-110),
        ]
]

let asteroidsStartingPositions = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
]

let asteroidsStartingVelocities = [
    v2Direction(-330, .0002), 
    v2Direction(-210, .0002), 
    v2Direction(-150, .0002), 
    v2Direction(-30, .0002), 
]

function update(timestamp: number) {
    if (timestampPrev == 0) timestampPrev = timestamp
    let tDelta = timestamp - timestampPrev
    timestampPrev = timestamp
    
    // Update ship.
    let angleDelta = ship.rotationSpeed * tDelta
    if (ship.rotateCW) ship.orientation += angleDelta
    if (ship.rotateCCW) ship.orientation -= angleDelta
    ship.orientation = mod(ship.orientation, 360)
    if (ship.thrust) {
        ship.acceleration = v2Direction(ship.orientation, .0000015)
        let velocityDelta = v2Scale(ship.acceleration, tDelta)
        ship.velocity = v2Add(ship.velocity, velocityDelta)
    } else {
        ship.acceleration = v2Negate(ship.velocity)
        ship.acceleration = v2Normalize(ship.acceleration)
        ship.acceleration = v2Scale(ship.acceleration, .0000015)
        let velocityDelta = v2Scale(ship.acceleration, tDelta)
        ship.velocity = v2Add(ship.velocity, velocityDelta)
        if (sign(ship.velocity.x) == sign(ship.acceleration.x)
        && sign(ship.velocity.y) == sign(ship.acceleration.y)) {
            ship.velocity = { x: 0, y: 0 }
        }
    } 
    if (v2Length(ship.velocity) > ship.speedMax) {
        ship.velocity = v2Normalize(ship.velocity)
        ship.velocity = v2Scale(ship.velocity, ship.speedMax)
    }
    let positionDelta = v2Scale(ship.velocity, tDelta)
    ship.position = v2Add(ship.position, positionDelta)
    ship.position = wrapPosition(ship.position, 0, 1, ship.size)

    // Fire bullets
    ship.tUntilFireable -= tDelta
    if (ship.fire && ship.tUntilFireable <= 0) {
        ship.tUntilFireable = ship.fireRate
        let bullet = Bullet()
        let positionDelta = v2Direction(ship.orientation, ship.size + bullet.size)
        bullet.position = v2Add(ship.position, positionDelta)
        bullet.velocity = v2Direction(ship.orientation, .001)
        bullet.tUntilInactive = 800 
        bullets.push(bullet)
    }

    // Move bullets.
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        let positionDelta = v2Scale(bullet.velocity, tDelta)
        bullet.position = v2Add(bullet.position, positionDelta)
        bullet.position = wrapPosition(bullet.position, 0, 1, bullet.size)
    }

    if (asteroids.length == 0) {
        for (let i = 0; i < asteroidsStartingPositions.length; i++) {
            let asteroid = Asteroid()
            asteroid.size = .1
            asteroid.orientation = 0
            asteroid.position = V2(asteroidsStartingPositions[i])
            asteroid.velocity = V2(asteroidsStartingVelocities[i])
            asteroid.verticesIndex = round(random() * 3)
            asteroid.sizeVariant = AsteroidSize.large
            asteroid.spawnCount = 2
            asteroid.scoreOnHit = 100
            asteroids.push(asteroid)
        }
    }

    // Move Asteroids
    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i]
        let positionDelta = v2Scale(asteroid.velocity, tDelta)
        asteroid.position = v2Add(asteroid.position, positionDelta)
        asteroid.position = wrapPosition(asteroid.position, 0, 1, asteroid.size)
    }

    // The collision methods below don't handle tunneling.
    // Bullet/Asteroid collision.
    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i]
        let asteroidVertices = asteroidsVertices[asteroid.verticesIndex]
        for (let j = 0; j < bullets.length; j++) {
            let bullet = bullets[j]
            let intersection = false
            let pointInside = false
            let vertex1 = asteroidVertices[asteroidVertices.length - 1]
            vertex1 = v2Scale(vertex1, asteroid.size)
            vertex1 = v2Add(vertex1, asteroid.position)
            for (let k = 0; k < asteroidVertices.length; k++) {
                let vertex2 = asteroidVertices[k]
                vertex2 = v2Scale(vertex2, asteroid.size)
                vertex2 = v2Add(vertex2, asteroid.position)
                let edge1 = v2Subtract(vertex1, bullet.position)
                let edge2 = v2Subtract(vertex1, vertex2)
                let edge3Length = v2Dot(edge1, edge2) / v2Length(edge2)
                if (v2Length(edge1) < bullet.size
                || (v2Dot(edge1, edge2) > 0
                && edge3Length < v2Length(edge2)
                && sqrt(v2LengthSquared(edge1) - square(edge3Length)) < bullet.size)) {
                    intersection = true
                } 
                if (raySegmentIntersect(bullet.position, vertex1, vertex2)) {
                    pointInside = !pointInside
                } 
                vertex1 = vertex2
            }
            if (intersection || pointInside) {
                asteroid.explode = true
                bullet.tUntilInactive = 0
                ship.score += asteroid.scoreOnHit
            }
        }
    }

    // Asteroid/Ship collision.
    for (let asteroid of asteroids) {
        let asteroidVertices = asteroidsVertices[asteroid.verticesIndex]
        let collision = false
        for (let i = 0; i < asteroidVertices.length; i++) {
            let pointInside = false
            let point = asteroidVertices[i]
            point = v2Scale(point, asteroid.size)
            point = v2Add(point, asteroid.position)
            let vertex1 = ship.vertices[ship.vertices.length - 1]
            vertex1 = v2Rotate(vertex1, ship.orientation)
            vertex1 = v2Scale(vertex1, ship.size)
            vertex1 = v2Add(vertex1, ship.position)
            for (let j = 0; j < ship.vertices.length; j++) {
                let vertex2 = ship.vertices[j]
                vertex2 = v2Rotate(vertex2, ship.orientation)
                vertex2 = v2Scale(vertex2, ship.size)
                vertex2 = v2Add(vertex2, ship.position)
                if (raySegmentIntersect(point, vertex1, vertex2)) {
                    pointInside = !pointInside
                } 
                vertex1 = vertex2
            }
            if (pointInside) collision = true
        }
        for (let i = 0; i < ship.vertices.length; i++) {
            let pointInside = false
            let point = ship.vertices[i]
            point = v2Rotate(point, ship.orientation)
            point = v2Scale(point, ship.size)
            point = v2Add(point, ship.position)
            let vertex1 = asteroidVertices[asteroidVertices.length - 1]
            vertex1 = v2Scale(vertex1, asteroid.size)
            vertex1 = v2Add(vertex1, asteroid.position)
            for (let j = 0; j < asteroidVertices.length; j++) {
                let vertex2 = asteroidVertices[j]
                vertex2 = v2Scale(vertex2, asteroid.size)
                vertex2 = v2Add(vertex2, asteroid.position)
                if (raySegmentIntersect(point, vertex1, vertex2)) {
                    pointInside = !pointInside
                } 
                vertex1 = vertex2
            }
            if (pointInside) collision = true
        }
        if (collision) {
            ship.explode = true
            asteroid.explode = true
        } 
    }

    // Deactivate bullets
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        bullet.tUntilInactive -= tDelta
        if (bullet.tUntilInactive <= 0) bullets.splice(i, 1)
    }

    // Explode asteroids.
    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i]
        if (asteroid.explode) {
            explosions.push(Explosion({
                position: V2(asteroid.position)
            }))
            asteroid.explode = false
            switch (asteroid.sizeVariant)  {
                case AsteroidSize.medium: {
                    let direction = v2Rotate(v2Normalize(asteroid.velocity), 90)
                    for (let i = 0; i < asteroid.spawnCount; i++) {
                        let asteroidNew = Asteroid()
                        asteroidNew.size = .025
                        asteroidNew.sizeVariant = AsteroidSize.small
                        asteroidNew.verticesIndex = round(random() * 3)
                        asteroidNew.spawnCount = 0
                        asteroidNew.scoreOnHit = 10
                        asteroidNew.velocity = v2Scale(direction, v2Length(asteroid.velocity))
                        asteroidNew.position = v2Add(v2Scale(direction, asteroidNew.size), asteroid.position)
                        direction = v2Rotate(direction, 360 / asteroid.spawnCount)
                        asteroids.push(asteroidNew)
                    }
                    break
                }
                case AsteroidSize.large: {
                    let direction = v2Rotate(v2Normalize(asteroid.velocity), 90)
                    for (let i = 0; i < asteroid.spawnCount; i++) {
                        let asteroidNew = Asteroid()
                        asteroidNew.size = .05
                        asteroidNew.sizeVariant = AsteroidSize.medium
                        asteroidNew.verticesIndex = round(random() * 3)
                        asteroidNew.spawnCount = 2
                        asteroidNew.scoreOnHit = 40
                        asteroidNew.velocity = v2Scale(direction, v2Length(asteroid.velocity))
                        asteroidNew.position = v2Add(v2Scale(direction, asteroidNew.size), asteroid.position)
                        direction = v2Rotate(direction, 360 / asteroid.spawnCount)
                        asteroids.push(asteroidNew)
                    }
                }
            }
            asteroids.splice(i, 1)
        }
    }

    if (ship.explode) {
        explosions.push(Explosion({
            position: V2(ship.position)
        }))
        ship.explode = false
        ship.orientation = 0
        ship.position = { x: .5, y: .5 }
        ship.velocity = { x: 0, y: 0 }
        ship.acceleration = { x: 0, y: 0 }
        ship.tUntilFireable = 0
        ship.lives--
    }

    if (ship.lives == 0) {
        ship.lives = 5
        ship.score = 0
        asteroids = []
        bullets = []
    }

    // Begin drawing
    canvas.width = window.innerWidth 
    canvas.height = window.innerHeight 
    ctx.fillStyle = CSSRGBA(backgroundColor) 
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (canvas.width > canvas.height) {
        ctx.translate((window.innerWidth - canvas.height) / 2, 0)
        ctx.scale(canvas.height, canvas.height)
    } else {
        ctx.translate(0, (window.innerHeight - canvas.width) / 2)
        ctx.scale(canvas.width, canvas.width)
    } 
    ctx.save()
    ctx.rect(0, 0, 1, 1)
    ctx.clip()
    ctx.fillStyle = CSSRGBA(spaceColor) 
    ctx.fillRect(0, 0, 1, 1)
    
    drawText('thrust: w', .0015, .5, .025)
    drawText('rotate counter-clockwise: a', .0015, .5, .05)
    drawText('rotate clockwise: d', .0015, .5, .075)
    drawText('fire: space', .0015, .5, .1)
    drawText(`Score: ${ship.score}`, .004, .25, .05)
    drawText(`Lives: ${ship.lives}`, .004, .75, .05)

    {
        // Draw Ship
        ctx.save()
        ctx.translate(ship.position.x, ship.position.y)
        ctx.scale(ship.size, ship.size)
        ctx.rotate(degreesToRadians(ship.orientation))
        ctx.beginPath()
        for (let vertex of ship.vertices) ctx.lineTo(vertex.x, vertex.y)
        ctx.fillStyle = CSSRGBA(ship.color)
        ctx.fill()
        ctx.restore()
    }
    
    // Draw Asteroids
    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i]
        ctx.save()
        ctx.translate(asteroid.position.x, asteroid.position.y)
        ctx.scale(asteroid.size, asteroid.size)
        ctx.beginPath()
        for (let vertex of asteroidsVertices[asteroid.verticesIndex]) {
            ctx.lineTo(vertex.x, vertex.y)
        }
        ctx.closePath()
        ctx.fillStyle = CSSRGBA(asteroid.color)
        ctx.fill()
        ctx.restore()
    }

    {
        // Draw explosion particles.
        for (let i = 0; i < explosions.length; i++) {
            let explosion = explosions[i]
            ctx.save()
            ctx.translate(explosion.position.x, explosion.position.y)
            for (let j = 0; j < explosion.particleCount; j++) {
                ctx.beginPath()
                ctx.arc(explosion.size, 0, explosion.particleSize, 0, pi*2)
                ctx.fillStyle = CSSRGBA(explosion.particleColor)
                ctx.fill()
                ctx.rotate(pi*2 / explosion.particleCount)
            }
            ctx.restore()
            if (explosion.size < explosion.sizeMax) {
                explosion.size += tDelta * explosion.expansionRate
            } else explosions.splice(i, 1) 
        }
    }
    
    // Draw Bullets
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        ctx.beginPath()
        ctx.arc(bullet.position.x, bullet.position.y, bullet.size, 0, pi*2)
        ctx.fillStyle = CSSRGBA(bullet.color)
        ctx.fill()
    }

    ctx.restore()

    requestAnimationFrame(update)
}

requestAnimationFrame(update)

function processKeyboardInput(ev: KeyboardEvent) {
    // The reason this is done directly in a window event is because if
    // it's done in the main loop, only one key will be picked up per frame.
    let keyDown = (ev.type == 'keydown')
    switch (ev.key) {
        case 'W':
        case 'w': ship.thrust = keyDown; break
        case 'D':
        case 'd': ship.rotateCW = keyDown; break
        case 'A':
        case 'a': ship.rotateCCW = keyDown; break
        case ' ': ship.fire = keyDown; break
        case 'P':
    }
}

function drawText(text: string, size: number, x: number, y: number) {
    let metrics = ctx.measureText(text)
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size, size)
    ctx.fillStyle = CSSRGBA(textColor)
    ctx.fillText(text, -metrics.width / 2, 0)
    ctx.restore()
}

function CSSRGBA({r, g, b, a}: RGBA) {
    // This is untested for internet explorer. Float values aren't supported.
    return `rgba(${r * 255},${g * 255},${b * 255},${a})`
}

import {
    RGBA,
    Ship,
    Bullet,
    Asteroid,
    AsteroidSize,
    Explosion,
} from './types'

import { 
    sign,
    square,
    sqrt,
    round,
    mod, 
    random,
    pi, 
    degreesToRadians,
    V2, 
    v2Add, 
    v2Subtract,
    v2Negate,
    v2Scale, 
    v2DirectionDegrees as v2Direction, 
    v2RotateDegrees as v2Rotate, 
    v2Dot,
    v2LengthSquared, 
    v2Length,
    v2Normalize, 
    wrapPosition,
    raySegmentIntersect,
} from './math'