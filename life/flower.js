// E.g.
// http://192.168.1.227:8080/jerry.html?generator=flower&engine=flower&canvasHeight=1000&canvasWidth=1000
// Lets provide a generator and engine
function Flower(config, canvasController) {
    const slider0 = "slider0"
    const PHI = (1 + Math.sqrt(5)) / 2
    const centre = new Vector([config.canvasWidth / 2, config.canvasHeight / 2]).transpose()
    // n = number of petals
    // r = rotation between petal placement
    // d = pixels to move away from centre each iteration
    const n = config.nPetals
    const d = config.dPetals

    // Slow mode: only change r by a tiny set amount
    const SLOW_DELTA = 0.00001

    this.generate = function () {

        // Set up r slider
        if (document.getElementById(slider0)) {
            document.getElementById(slider0).max = config.rSliderMax
            document.getElementById(slider0).value = config.rSliderMax / PHI
            document.getElementById(slider0).style.width = `${config.canvasWidth}px`
            document.getElementById(slider0).hidden = false
        }

        // HOT
        // Get r value from slider directly
        function getR() {
            // If there is no slider, divide by phi
            if (!document.getElementById(slider0)) return 2 * Math.PI / PHI
            // convert 0->rMax to 0->2pi
            return document.getElementById(slider0).value / config.rSliderMax * 2 * Math.PI
        }

        // HOT EXPERMENTAL
        // Get r value from memory, approaching the value of getR()
        function getSlowR() {
            const rFromSlider = getR()
            // If r_mut is very close to r, equalise and return
            if (Math.abs(r_mut - rFromSlider) <= SLOW_DELTA) {
                r_mut = rFromSlider
                return r_mut
            }

            // either go up a little or down a little
            const delta1 = (rFromSlider - r_mut) / 1000
            if (Math.abs(delta1) < SLOW_DELTA) {
                r_mut += (SLOW_DELTA * Math.sign(delta1))
            } else {
                r_mut += delta1
            }

            return r_mut
        }

        // Our state will be an array of petals, and our run function
        // We probably don't need to store an array or positions, as we can calculate them each time from the parameters,
        const petals = placePetals(n, getR(), d)
        // Capture a petal pointer
        let point_mut = 0
        // Also capture an r memory
        let r_mut = getR()
        return {
            run: function () {
                // We can reposition the petals based on input parameters
                placePetalsInto_mutates(petals, getSlowR(), d)
                if (point_mut >= petals.length) point_mut = 0
                renderAll(petals)
                point_mut++
            },
            petals: petals
        }
    }

    // n = number of petals
    // r = rotation between petal placement
    // d = pixels to move away from centre each iteration
    function placePetals(n, r, d) {
        // First petal is d to the right of centre
        const p_mut = [centre.add(Vector.create2(d, 0).transpose())]

        function iterate(prev) {
            return rotateAndAdd(prev, r, d)
        }

        while (p_mut.length < n) {
            p_mut.push(iterate(p_mut[p_mut.length - 1]))
        }

        return p_mut
    }

    // HOT
    // Generate petals by writing to the array in place
    function placePetalsInto_mutates(array, r, d) {
        for (let i = 1; i < array.length; i++) {
            array[i] = rotateAndAdd(array[i - 1], r, d)
        }
        return array
    }

    // Vector hacks for performance
    function optX(v) { return v.array[0].array[0] }
    function optY(v) { return v.array[1].array[0] }
    function fastSub(v1, v2) { return new Vector([[optX(v1) - optX(v2)], [optY(v1) - optY(v2)]]) }
    function fastAdd(v1, v2) { return new Vector([[optX(v1) + optX(v2)], [optY(v1) + optY(v2)]]) }

    // HOT
    function rotateAndAdd(vCanvas, theta, amt) {
        // Transform to centre
        // optimisations to go in ben-loves-vectors
        // const v = vCanvas.sub(centre)
        const v = fastSub(vCanvas, centre)
        // Rotation matrix
        const R = new Vector([
            [Math.cos(theta), -Math.sin(theta)],
            [Math.sin(theta), Math.cos(theta)]])
        const rotated = R.matrixMultiply(v)

        // Add amt to vector magnitude
        // bug in ben-loves-vectors: we should be able to normalise/magnitude a column vector (added to trello)
        // const added = rotated.add(rotated.collapse().normalise(amt).transpose())
        const added = fastAdd(rotated, rotated.collapse().normalise(amt).transpose())
        // return added.add(centre)
        return fastAdd(added, centre)
    }

    // HOT
    function renderAll(petals) {
        // clear
        canvasController.clear()
        // fast render all
        const xyPxs = petals.map(p => [p.array[0].array[0], p.array[1].array[0]])
        canvasController.drawCircles(xyPxs, 5, "rgb(40, 208, 214)")
    }
}