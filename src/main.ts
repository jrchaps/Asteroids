/*
    Todos:
    -- Change the coordinate system to reflect normal math.
    -- Use WebGl.
    -- Attempt to clean up bullet firing logic.
    -- Attempt to clean up the collision ship/asteroid collision methods.
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

let game = State()
let ship = Ship()
let bullets = Bullets()
let asteroids = Asteroids()
let explosions = Explosions()

function update(timestamp: number) {
    if (timestampPrev == 0) timestampPrev = timestamp
    let tDelta = timestamp - timestampPrev
    timestampPrev = timestamp
    
    if (!game.initialized) {
        game.initialized = true
        game.backgroundColor = { r: 0, g: .03, b: .11, a: 1 }
        game.entityColor = { r: .87, g: .87, b: 1, a: 1 }
        game.textColor = game.entityColor
        ship.size = .05
        ship.orientation = 0
        ship.position = { x: .5, y: .5 }
        ship.velocity = { x: 0, y: 0 }
        ship.acceleration = { x: 0, y: 0 }
        ship.vertices = [
            { x: 1, y: 0 }, 
            { x: -.8, y: -.6 }, 
            { x: -.8, y: .6 }
        ]
        ship.color = game.entityColor
        ship.explode = false
        ship.thrust = false
        ship.speedMax = .001
        ship.rotateCW = false
        ship.rotateCCW = false
        ship.rotationSpeed = 0
        ship.fire = false
        ship.fireRate = 300
        ship.tUntilFireable = 0
        ship.lives = 5
        ship.score = 0
        for (let i = 0; i < 10; i++) {
            bullets.items[i] = {
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                tUntilInactive: 0
            }
        }
        bullets.activeCount = 0
        bullets.size = .004
        bullets.color = game.entityColor
        // Combine these?
        asteroids.startingPositions = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
        ]
        asteroids.startingVelocities = [
            v2Direction(-330, .0002), 
            v2Direction(-210, .0002), 
            v2Direction(-150, .0002), 
            v2Direction(-30, .0002), 
        ]
        asteroids.activeCount = 4
        for (let i = 0; i < asteroids.startingPositions.length * asteroids.activeCount; i++) {
            asteroids.items[i] = {
                size: .1,
                orientation: 0,
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                verticesIndex: round(random() * 3),
                explode: false,
                sizeVariant: AsteroidSize.large
            }
        }
        for (let i = 0; i < asteroids.startingPositions.length; i++) {
            let asteroid = asteroids.items[i]
            let position = asteroids.startingPositions[i]
            let velocity = asteroids.startingVelocities[i]
            asteroid.position = { x: position.x, y: position.y }
            asteroid.velocity = { x: velocity.x, y: velocity.y }
        }
        asteroids.color = game.entityColor
        asteroids.vertices = [
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
        explosions.effects = []
        explosions.sizeMax = .05
        explosions.expansionRate = .00015
        explosions.particleSize = .0025
        explosions.particleColor = game.entityColor
        explosions.particlesPerEffect = 8
    }
    
    // Update ship.
    ship.rotationSpeed = 0
    if (ship.rotateCW) ship.rotationSpeed = .25
    if (ship.rotateCCW) ship.rotationSpeed = -.25
    ship.orientation += ship.rotationSpeed * tDelta
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

    // Update bullets.
    for (let i = 0; i < bullets.activeCount; i++) {
        let bullet = bullets.items[i]
        bullet.tUntilInactive -= tDelta
        let positionDelta = v2Scale(bullet.velocity, tDelta)
        bullet.position = v2Add(bullet.position, positionDelta)
        bullet.position = wrapPosition(bullet.position, 0, 1, bullets.size)
    }

    // Fire bullets
    ship.tUntilFireable -= tDelta
    if (ship.fire && ship.tUntilFireable <= 0) {
        ship.tUntilFireable = ship.fireRate
        let bullet
        if (bullets.activeCount == bullets.items.length) {
            bullet = shift(bullets.items)
        } else {
            bullet = bullets.items[bullets.activeCount]
            bullets.activeCount++
        }
        let positionDelta = v2Direction(ship.orientation, ship.size + bullets.size)
        bullet.position = v2Add(ship.position, positionDelta)
        bullet.velocity = v2Direction(ship.orientation, .001)
        bullet.tUntilInactive = 800 
    }

    // Update Asteroids
    for (let i = 0; i < asteroids.activeCount; i++) {
        let asteroid = asteroids.items[i]
        let positionDelta = v2Scale(asteroid.velocity, tDelta)
        asteroid.position = v2Add(asteroid.position, positionDelta)
        asteroid.position = wrapPosition(asteroid.position, 0, 1, asteroid.size)
    }

    // The collision methods below don't handle tunneling.

    // Bullet/Asteroid collision.
    for (let i = 0; i < asteroids.activeCount; i++) {
        let asteroid = asteroids.items[i]
        let asteroidVertices = asteroids.vertices[asteroid.verticesIndex]
        for (let j = 0; j < bullets.activeCount; j++) {
            let bullet = bullets.items[j]
            let collision = false
            // Is the bullet inside the asteroid?
            let a = asteroidVertices[asteroidVertices.length - 1]
            a = v2Scale(a, asteroid.size)
            a = v2Add(a, asteroid.position)
            for (let k = 0; k < asteroidVertices.length; k++) {
                let b = asteroidVertices[k]
                b = v2Scale(b, asteroid.size)
                b = v2Add(b, asteroid.position)
                if (raySegmentIntersect(bullet.position, a, b)) collision = !collision
                a = b
            }
            let vertex1 = asteroidVertices[asteroidVertices.length - 1]
            vertex1 = v2Scale(vertex1, asteroid.size)
            vertex1 = v2Add(vertex1, asteroid.position)
            for (let k = 0; k < asteroidVertices.length; k++) {
                let vertex2 = asteroidVertices[k]
                vertex2 = v2Scale(vertex2, asteroid.size)
                vertex2 = v2Add(vertex2, asteroid.position)
                let edge1 = v2Subtract(vertex1, bullet.position)
                // Is the vertex inside the bullet?
                if (v2LengthSquared(edge1) < square(bullets.size)) {
                    collision = true
                    break
                }
                let edge2 = v2Subtract(vertex1, vertex2)
                let dot = v2Dot(edge1, edge2)
                // Does the bullet cross an edge?
                if (dot > 0) {
                    let edge2Length = v2Length(edge2)
                    let distance = dot / edge2Length
                    if (distance < edge2Length 
                    && sqrt(v2LengthSquared(edge1) - square(distance)) < bullets.size) {
                        collision = true
                        break
                    }
                }
                vertex1 = vertex2
            }
            if (collision) {
                asteroid.explode = true
                bullet.tUntilInactive = 0
            }
        }
    }

    // Asteroid -> ship collision detection.
    for (let i = 0; i < asteroids.activeCount; i++) {
        let asteroid = asteroids.items[i]
        let asteroidVertices = asteroids.vertices[asteroid.verticesIndex]
        for (let j = 0; j < asteroidVertices.length; j++) {
            let collision = false
            let p = asteroidVertices[j]
            p = v2Scale(p, asteroid.size)
            p = v2Add(p, asteroid.position)
            let a = ship.vertices[ship.vertices.length - 1]
            a = v2Rotate(a, ship.orientation)
            a = v2Scale(a, ship.size)
            a = v2Add(a, ship.position)
            for (let k = 0; k < ship.vertices.length; k++) {
                let b = ship.vertices[k]
                b = v2Rotate(b, ship.orientation)
                b = v2Scale(b, ship.size)
                b = v2Add(b, ship.position)
                if (raySegmentIntersect(p, a, b)) collision = !collision
                a = b
            }
            if (collision) {
                ship.explode = true
                asteroid.explode = true
                break
            }
        }
    }

    // Ship -> asteroid collision detection.
    for (let i = 0; i < ship.vertices.length; i++) {
        let p = ship.vertices[i]
        p = v2Rotate(p, ship.orientation)
        p = v2Scale(p, ship.size)
        p = v2Add(p, ship.position)
        for (let j = 0; j < asteroids.activeCount; j++) {
            let asteroid = asteroids.items[j]
            let asteroidVertices = asteroids.vertices[asteroid.verticesIndex]
            let collision = false
            let a = asteroidVertices[asteroidVertices.length - 1]
            a = v2Scale(a, asteroid.size)
            a = v2Add(a, asteroid.position)
            for (let k = 0; k < asteroidVertices.length; k++) {
                let b = asteroidVertices[k]
                b = v2Scale(b, asteroid.size)
                b = v2Add(b, asteroid.position)
                if (raySegmentIntersect(p, a, b)) collision = !collision
                a = b
            }
            if (collision) {
                ship.explode = true
                asteroid.explode = true
            } 
        }
    }

    // Deactivate bullets
    for (let i = 0; i < bullets.activeCount; i++) {
        let bullet = bullets.items[i]
        if (bullet.tUntilInactive <= 0) {
            shift(bullets.items, i, bullets.activeCount - 1)
            bullets.activeCount--
        }
    }

    // Explode asteroids.
    for (let i = 0; i < asteroids.activeCount; i++) {
        let asteroid = asteroids.items[i]
        if (asteroid.explode) {
            asteroid.explode = false
            asteroids.items[i] = asteroids.items[asteroids.activeCount - 1]
            asteroids.items[asteroids.activeCount - 1] = asteroid
            explosions.effects[explosions.effects.length] = {
                position: asteroid.position,
                size: 0,
            }
            let spawnCount: number
            switch (asteroid.sizeVariant) {
                case AsteroidSize.small:
                    ship.score += 10
                    asteroids.activeCount--
                    break
                case AsteroidSize.medium:
                    ship.score += 40
                    spawnCount = 1
                    asteroids.activeCount += spawnCount
                    for (let i = 0; i < spawnCount + 1; i++) {
                        let asteroidNew = asteroids.items[asteroids.activeCount - 1 - i]
                        asteroidNew.size = .025
                        asteroidNew.sizeVariant = AsteroidSize.small
                        asteroidNew.position = {
                            x: asteroid.position.x,
                            y: asteroid.position.y
                        }
                        if (i == 0) {
                            asteroidNew.position.x -= asteroidNew.size
                            asteroidNew.velocity = v2Rotate(asteroid.velocity, 45)
                        } else {
                            asteroidNew.position.x += asteroidNew.size
                            asteroidNew.velocity = v2Rotate(asteroid.velocity, -45)
                        }
                    }
                    break
                case AsteroidSize.large:
                    ship.score += 100
                    spawnCount = 1;
                    asteroids.activeCount += spawnCount
                    for (let i = 0; i < spawnCount + 1; i++) {
                        let asteroidNew = asteroids.items[asteroids.activeCount - 1 - i]
                        asteroidNew.size = .05
                        asteroidNew.sizeVariant = AsteroidSize.medium
                        asteroidNew.position = {
                            x: asteroid.position.x,
                            y: asteroid.position.y
                        }
                        if (i == 0) {
                            asteroidNew.position.x -= asteroidNew.size
                            asteroidNew.velocity = v2Rotate(asteroid.velocity, 45)
                        } else {
                            asteroidNew.position.x += asteroidNew.size
                            asteroidNew.velocity = v2Rotate(asteroid.velocity, -45)
                        }
                    }
                    break
            }
        }
    }

    if (ship.explode) {
        ship.explode = false
        explosions.effects[explosions.effects.length] = {
            position: ship.position,
            size: 0,
        }
        ship.position = { x: .5, y: .5 }
        ship.orientation = 0
        ship.velocity = { x: 0, y: 0 }
        ship.acceleration = { x: 0, y: 0 }
        ship.tUntilFireable = 0
        ship.lives--
    }

    if (ship.lives == 0) {
        ship.lives = 5
        ship.score = 0
        asteroids.activeCount = 0
        bullets.activeCount = 0
    }
    
    if (asteroids.activeCount == 0) {
        asteroids.activeCount = asteroids.startingPositions.length
        for (let i = 0; i < asteroids.activeCount; i++) {
            let asteroid = asteroids.items[i]
            asteroid.size = .1
            asteroid.orientation = 0
            let position = asteroids.startingPositions[i]
            asteroid.position = {
                x: position.x,
                y: position.y
            }
            let velocity = asteroids.startingVelocities[i]
            asteroid.velocity = { x: velocity.x, y: velocity.y }
            asteroid.sizeVariant = AsteroidSize.large
        }
    }

    // Begin drawing
    canvas.width = window.innerWidth 
    canvas.height = window.innerHeight 
    ctx.fillStyle = CSSRGBA({r: .075, b: .075, g: .075, a: 1}) 
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
    ctx.fillStyle = CSSRGBA(game.backgroundColor) 
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
    for (let i = 0; i < asteroids.activeCount; i++) {
        let asteroid = asteroids.items[i]
        ctx.save()
        ctx.translate(asteroid.position.x, asteroid.position.y)
        ctx.scale(asteroid.size, asteroid.size)
        ctx.beginPath()
        for (let vertex of asteroids.vertices[asteroid.verticesIndex]) {
            ctx.lineTo(vertex.x, vertex.y)
        }
        ctx.closePath()
        ctx.fillStyle = CSSRGBA(asteroids.color)
        ctx.fill()
        ctx.restore()
    }

    {
        // Draw explosion particles.
        // Maybe effects should be in a pool.
        for (let i = 0; i < explosions.effects.length; i++) {
            let effect = explosions.effects[i]
            ctx.save()
            ctx.translate(effect.position.x, effect.position.y)
            for (let j = 0; j < explosions.particlesPerEffect; j++) {
                ctx.beginPath()
                ctx.arc(effect.size, 0, explosions.particleSize, 0, pi*2)
                ctx.fillStyle = CSSRGBA(explosions.particleColor)
                ctx.fill()
                ctx.rotate(pi*2 / explosions.particlesPerEffect)
            }
            ctx.restore()
            if (effect.size < explosions.sizeMax) {
                effect.size += tDelta * explosions.expansionRate
            } else explosions.effects.splice(i, 1) 
        }
    }
    
    // Draw Bullets
    for (let i = 0; i < bullets.activeCount; i++) {
        let bullet = bullets.items[i]
        ctx.beginPath()
        ctx.arc(bullet.position.x, bullet.position.y, bullets.size, 0, pi*2)
        ctx.fillStyle = CSSRGBA(bullets.color)
        ctx.fill()
    }

    ctx.restore()

    requestAnimationFrame(update)
}

requestAnimationFrame(update)

function processKeyboardInput(ev: KeyboardEvent) {
    // The reason this is done directly in a window event and not in the main update loop
    // is because with the latter, if more than one key changes in a frame then only one of them is picked up.
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
    ctx.fillStyle = CSSRGBA(game.textColor)
    ctx.fillText(text, -metrics.width / 2, 0)
    ctx.restore()
}

import {
    State,
    Ship,
    Bullets,
    Asteroids,
    AsteroidSize,
    Explosions,
} from './state'

import { 
    shift, 
    CSSRGBA, 
} from './utils'

import { 
    sign,
    square,
    sqrt,
    round,
    mod, 
    random,
    pi, 
    degreesToRadians,
    wrapPosition,
    raySegmentIntersect,
    v2Add, 
    v2Subtract,
    v2Negate,
    v2Scale, 
    v2Direction, 
    v2Rotate, 
    v2Dot,
    v2LengthSquared, 
    v2Length,
    v2Normalize, 
} from './math'