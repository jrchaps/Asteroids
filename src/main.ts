/*
    Todos:
    -- Use WebGl. Can we be independent of WebGl and 2D canvas? Probably not, they aren't very compatible.
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
            v2Direction(135),
            v2Direction(60, .45),
            v2Direction(30),
            v2Direction(350),
            v2Direction(270),
            v2Direction(200),
        ],
        [
            v2Direction(135),
            v2Direction(115, .4),
            v2Direction(45),
            v2Direction(0),
            v2Direction(290),
            v2Direction(210),
        ],
        [
            v2Direction(90),
            v2Direction(15),
            v2Direction(315),
            v2Direction(295, .55),
            v2Direction(240),
            v2Direction(165),
        ],
        [
            v2Direction(0),
            v2Direction(345, .5),
            v2Direction(315),
            v2Direction(250),
            v2Direction(180),
            v2Direction(110),
        ]
]

let asteroidsStartingPositions = [
    { x: -1, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
]

let asteroidsStartingVelocities = [
    v2Direction(330, .000_4), 
    v2Direction(210, .000_4), 
    v2Direction(150, .000_4), 
    v2Direction(30, .000_4), 
]

let worldBounds = { x: -1, y: 1 }

function update(timestamp: number) {
    if (timestampPrev == 0) timestampPrev = timestamp
    let tDelta = timestamp - timestampPrev
    timestampPrev = timestamp

    {
        // Move ship.
        let angleDelta = ship.rotationSpeed * tDelta
        if (ship.rotateCW) ship.orientation -= angleDelta
        if (ship.rotateCCW) ship.orientation += angleDelta
        ship.orientation = mod(ship.orientation, 360)
        if (ship.thrust) {
            let velocityDelta = v2Direction(ship.orientation, .000_003)
            velocityDelta = v2Scale(velocityDelta, tDelta)
            ship.velocity = v2Add(ship.velocity, velocityDelta)
        } else {
            let velocityDelta = v2Negate(ship.velocity)
            velocityDelta = v2Normalize(velocityDelta)
            velocityDelta = v2Scale(velocityDelta, .000_003)
            velocityDelta = v2Scale(velocityDelta, tDelta)
            ship.velocity = v2Add(ship.velocity, velocityDelta)
            if (sign(ship.velocity.x) == sign(velocityDelta.x)
            && sign(ship.velocity.y) == sign(velocityDelta.y)) {
                ship.velocity = { x: 0, y: 0 }
            }
        } 
        if (v2Length(ship.velocity) > ship.speedMax) {
            ship.velocity = v2Normalize(ship.velocity)
            ship.velocity = v2Scale(ship.velocity, ship.speedMax)
        }
        let positionDelta = v2Scale(ship.velocity, tDelta)
        ship.position = v2Add(ship.position, positionDelta)
        let bounds = v2Add(worldBounds, { x: -ship.size, y: ship.size })
        ship.position = v2Wrap(ship.position, bounds)
        
        // Fire bullets
        ship.tUntilFireable -= tDelta
        if (ship.fire && ship.tUntilFireable <= 0) {
            ship.tUntilFireable = ship.fireRate
            let bullet = Bullet({
                velocity: v2Direction(ship.orientation, .002),
                tUntilInactive: 800 
            })
            let positionDelta = v2Direction(ship.orientation, ship.size + bullet.size)
            bullet.position = v2Add(ship.position, positionDelta)
            bullets.push(bullet)
        }
    }

    // Move bullets.
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        let positionDelta = v2Scale(bullet.velocity, tDelta)
        bullet.position = v2Add(bullet.position, positionDelta)
        let bounds = v2Add(worldBounds, { x: -bullet.size, y: bullet.size })
        bullet.position = v2Wrap(bullet.position, bounds)
    }

    if (asteroids.length == 0) {
        for (let i = 0; i < asteroidsStartingPositions.length; i++) {
            asteroids.push(Asteroid({
                size: .2,
                orientation: 0,
                position: V2(asteroidsStartingPositions[i]),
                velocity: V2(asteroidsStartingVelocities[i]),
                verticesIndex: randomIndex(asteroidsVertices),
                sizeVariant: AsteroidSize.large,
                spawnCount: 2,
                scoreOnHit: 100
            }))
        }
    }

    // Move Asteroids
    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i]
        let positionDelta = v2Scale(asteroid.velocity, tDelta)
        asteroid.position = v2Add(asteroid.position, positionDelta)
        let bounds = v2Add(worldBounds, { x: -asteroid.size, y: asteroid.size })
        asteroid.position = v2Wrap(asteroid.position, bounds)
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
                        let asteroidNew = Asteroid({
                            size: .05,
                            sizeVariant: AsteroidSize.small,
                            verticesIndex: randomIndex(asteroidsVertices),
                            spawnCount: 0,
                            scoreOnHit: 10,
                            velocity: v2Scale(direction, v2Length(asteroid.velocity)),
                        })
                        asteroidNew.position = v2Add(v2Scale(direction, asteroidNew.size), asteroid.position)
                        direction = v2Rotate(direction, 360 / asteroid.spawnCount)
                        asteroids.push(asteroidNew)
                    }
                    break
                }
                case AsteroidSize.large: {
                    let direction = v2Rotate(v2Normalize(asteroid.velocity), 90)
                    for (let i = 0; i < asteroid.spawnCount; i++) {
                        let asteroidNew = Asteroid({
                            size: .1,
                            sizeVariant: AsteroidSize.medium,
                            verticesIndex: randomIndex(asteroidsVertices),
                            spawnCount: 2,
                            scoreOnHit: 40,
                            velocity: v2Scale(direction, v2Length(asteroid.velocity)),
                        })
                        asteroidNew.position = v2Add(v2Scale(direction, asteroidNew.size), asteroid.position)
                        direction = v2Rotate(direction, 360 / asteroid.spawnCount)
                        asteroids.push(asteroidNew)
                    }
                }
            }
            asteroids.splice(i, 1)
        }
    }

    {
        if (ship.explode) {
            explosions.push(Explosion({
                position: V2(ship.position)
            }))
            ship.explode = false
            ship.orientation = 0
            ship.position = { x: 0, y: 0 }
            ship.velocity = { x: 0, y: 0 }
            ship.tUntilFireable = 0
            ship.lives = ship.lives--
        }
        if (ship.lives == 0) {
            ship.lives = 5
            ship.score = 0
            asteroids = []
            bullets = []
        }
    }

    // Begin drawing
    canvas.width = window.innerWidth 
    canvas.height = window.innerHeight 
    ctx.scale(canvas.width, canvas.height)
    ctx.translate(.5, .5) // Center the origin
    ctx.scale(.5, -.5) // Scale to a 2*unit square and flip the y-axis

    ctx.fillStyle = CSSRGBA(backgroundColor) 
    drawRect(ctx, 2, 2)

    // Transform to world space
    if (canvas.width > canvas.height) {
        ctx.scale(canvas.height / canvas.width, 1)
    } else {
        ctx.scale(1,  canvas.width / canvas.height)
    } 

    clipRect(ctx, 2, 2)
    ctx.fillStyle = CSSRGBA(spaceColor) 
    drawRect(ctx, 2, 2)

    drawText('thrust: w', .003, 0, .95)
    drawText('rotate counter-clockwise: a', .003, 0, .9)
    drawText('rotate clockwise: d', .003, 0, .85)
    drawText('fire: space', .003, 0, .8)
    drawText(`Score: ${ship.score}`, .008, -.5, .9)
    drawText(`Lives: ${ship.lives}`, .008, .5, .9)

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

function drawRect(
    ctx: CanvasRenderingContext2D, 
    width: number,
    height: number,
    position = { x: 0, y: 0 }, // Is centered
) {
    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.scale(width, height)
    ctx.fillRect(-.5, -.5, 1, 1)
    ctx.restore()
}

function clipRect(
    ctx: CanvasRenderingContext2D, 
    width: number,
    height: number,
    position = { x: 0, y: 0 }, // Is centered
) {
    ctx.rect(
        position.x - (width / 2), 
        position.y - (height / 2),
        width,
        height
    )
    ctx.clip()
}

function drawText(text: string, size: number, x: number, y: number) {
    ctx.textBaseline = "bottom"
    let metrics = ctx.measureText(text) // This doesn't have great browser support.
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size, -size)
    ctx.fillStyle = CSSRGBA(textColor)
    ctx.fillText(text, -metrics.width / 2, metrics.actualBoundingBoxAscent / 2)
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
    mod, 
    randomIndex,
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
    v2Wrap,
    raySegmentIntersect,
} from './math'