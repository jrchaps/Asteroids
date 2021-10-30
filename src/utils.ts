function arrayInit<T>( fn: (i: number) => T, count: number,) {
    // The reason this takes a function is to make it work for by reference objects.
    // e.g. structs/arrays
	let arr = []
	for (let i = 0; i < count; i++) arr[i] = fn(i)
	return arr
}

function shift<T>(arr: T[], startIndex = 0, endIndex = arr.length - 1) {
    // Shifts an array to the left in place.
    let first = arr[startIndex]
    for (let i = startIndex; i < endIndex; i++) {
        arr[i] = arr[i + 1]
    }
    arr[endIndex] = first
    return first
}

interface RGBA {
    r: number 
    g: number 
    b: number 
    a: number
}

function CSSRGBA({r, g, b, a}: RGBA) {
    // This is untested for internet explorer. Float values aren't supported.
    return `rgba(${r * 255},${g * 255},${b * 255},${a})`
}

interface Pool<T> {
    items: T[]
    activeCount: number
}

let pangrams = [
    'The quick brown fox jumps over the lazy dog.',
    'Waltz, bad nymph, for quick jigs vex.',
    'Glib jocks quiz nymph to vex dwarf.',
    'Sphinx of black quartz, judge my vow.',
    'How vexingly quick daft zebras jump!',
    'The five boxing wizards jump quickly.',
    'Jackdaws love my big sphinx of quartz.',
    'Pack my box with five dozen liquor jugs.',
]

export {
    arrayInit, 
    shift, 
    RGBA, 
    CSSRGBA, 
    Pool, 
    pangrams
}