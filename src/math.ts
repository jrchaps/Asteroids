const { 
    PI, 
    cos, 
    sin, 
    floor, 
    round,
    pow,
    sqrt,
    sign, 
    random,
} = Math
const pi = PI

function square(a: number) { return pow(a, 2) }

function mod(a: number, b: number) {
    return a - b * floor(a / b)
}

function clamp(value: number, min: number, max: number) {
    if (value < min) return min
    if (value > max) return max
    return value
}

function lerp(from: number, to: number, t: number) {
    return (1 - t) * from + t * to
}

function wrap(value: number, min: number, max: number, offset: number) {
    if (value > max + offset) return min - offset
    if (value < min - offset) return max + offset
    return value
}

function wrapPosition(position: V2, min: number, max: number, offset: number): V2 {
    return {
        x: wrap(position.x, min, max, offset),
        y: wrap(position.y, min, max, offset)
    }
}

function raySegmentIntersect({x, y}: V2, a: V2, b: V2) {
    // The ray shoots positively with a slope of 0. 
    if ((a.y > y) != (b.y > y)
    && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x))
        return true
}

// A 2 dimensional vector.
interface V2 {
    x: number
    y: number
}

function v2(x = 0, y = x) {
	return { x, y }
}

function degreesToRadians(degrees: number) {
    return pi/180 * degrees
}

function v2DirectionDegrees(degrees: number, scalar = 1): V2 {
    let radians = degreesToRadians(degrees)
    return v2Scale({x: cos(radians), y: sin(radians)}, scalar)
}

function v2DirectionRadians(radians: number, scalar = 1): V2 {
    return v2Scale({x: cos(radians), y: sin(radians)}, scalar)
}

function v2Dot(a: V2, b: V2) {
    return a.x * b.x + a.y * b.y
}

function v2LengthSquared(a: V2) {
    return v2Dot(a, a)
}

function v2Length(a: V2) {
    return sqrt(v2LengthSquared(a))
}

function v2Normalize(a: V2): V2 {
    let length = v2Length(a)
    if (length == 0) return { x: 0, y: 0 }
    return { x: a.x / length, y: a.y / length }
}

function v2Add(a: V2, b: V2): V2 {
	return { x: a.x + b.x, y: a.y + b.y }
}

function v2Subtract(a: V2, b: V2): V2 {
    return { x: a.x - b.x, y: a.y - b.y }
}

function v2Scale({x, y}: V2, scalar: number): V2 {
    return { x: x * scalar, y: y * scalar }
}

function v2RotateDegrees({x, y}: V2, degrees: number): V2 {
    let radians = degreesToRadians(degrees)
    let a = cos(radians)
    let b = sin(radians)
    return {
        x: x * a - y * b,
        y: x * b + y * a
    }
}

function v2Negate(a: V2): V2 {
    return { x: -a.x, y: -a.y }
}

export { 
    sign,
    pow,
    square,
    sqrt,
    floor, 
    round,
    mod, 
    clamp,
    lerp,
    random,
    pi, 
    cos, 
    sin, 
    degreesToRadians,
    wrapPosition,
    raySegmentIntersect,
    V2, 
    v2, 
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
}