function shift<T>(arr: T[], startIndex = 0, endIndex = arr.length - 1) {
    // Shifts an array to the left in place.
    let first = arr[startIndex]
    for (let i = startIndex; i < endIndex; i++) {
        arr[i] = arr[i + 1]
    }
    arr[endIndex] = first
    return first
}

type Pool = ReturnType<typeof Pool>
function Pool<T>() {
    return {
        items: Array<T>(),
        activeCount: 0
    }
}

type RGBA = ReturnType<typeof RGBA>
function RGBA() {
    return { r: 0, g: 0, b: 0, a: 0 }
}

function CSSRGBA({r, g, b, a}: RGBA) {
    // This is untested for internet explorer. Float values aren't supported.
    return `rgba(${r * 255},${g * 255},${b * 255},${a})`
}

export {
    shift, 
    Pool,
    RGBA,
    CSSRGBA, 
}