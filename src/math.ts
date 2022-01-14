const { 
    PI, 
    cos, 
    sin, 
    ceil,
    floor, 
    round,
    pow,
    sqrt,
    sign, 
    random,
} = Math
const pi = PI

function square(a: number) { 
    return pow(a, 2) 
}

function mod(a: number, b: number) {
    return a - b * floor(a / b)
}

function clamp(value: number, min: number, max: number) {
    if (value < min) return min
    if (value > max) return max
    return value
}

function wrap(value: number, min: number, max: number) {
    if (value < min) return max
    if (value > max) return min
    return value
}

function lerp(from: number, to: number, t: number) {
    return (1 - t) * from + t * to
}

function randomInt(min: number, max: number) {
    // Min is inclusive. Max is exclusive
    min = ceil(min)
    max = floor(max)
    return floor(random() * (max - min) + min)
}

function randomIndex(array: any[]) {
    return randomInt(0, array.length)
}

function degreesToRadians(degrees: number) {
    return pi/180 * degrees
}

type V2 = ReturnType<typeof V2>
function V2({ x = 0, y = 0 } = {}) {
    return { x, y }
}

function v2DirectionDegrees(degrees: number, length = 1): V2 {
    let radians = degreesToRadians(degrees)
    return v2Scale({ x: cos(radians), y: sin(radians) }, length)
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

function v2Wrap(values: V2, bounds: V2): V2 {
    return {
        x: wrap(values.x, bounds.x, bounds.y),
        y: wrap(values.y, bounds.x, bounds.y)
    }
}

function raySegmentIntersect({x, y}: V2, a: V2, b: V2) {
    // The ray shoots positively with a slope of 0. 
    if ((a.y > y) != (b.y > y)
    && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x))
        return true
}

export { 
    sign,
    pow,
    square,
    sqrt,
    ceil,
    floor, 
    round,
    mod, 
    clamp,
    wrap,
    lerp,
    random,
    randomInt,
    randomIndex,
    pi, 
    cos, 
    sin, 
    degreesToRadians,
    V2, 
    v2Add, 
    v2Subtract,
    v2Negate,
    v2Scale, 
    v2DirectionDegrees, 
    v2RotateDegrees, 
    v2Dot,
    v2LengthSquared, 
    v2Length,
    v2Normalize, 
    v2Wrap,
    raySegmentIntersect,
}