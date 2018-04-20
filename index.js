// Kick off the index page. Injects small canvas sims.
(function(){
    const mainContainer = document.getElementById("main-container")
    const miniContainer = (i) => document.getElementById(`mini-container-${i}`)

    const configs = [
        getConstants(),
        getConstants(),
        getConstants()
    ].map((e,i,a) => {
        // Give them all unique IDs
        e.canvasId = `mini-canvas-${i}`
        // And slow them right the fudge down
        e.iterationsPerFrame = 1
        return e
    })

    // The first mini-sim will use the default values (Ising on square lattice).

    // Second mini-sim can be a hex grid
    configs[1].generator = "hex"
    configs[1].cellSize = configs[1].cellSize - 4
    configs[1].cellPadding = configs[1].cellPadding + 1

    // Third mini-sim can be a random canvas
    configs[2].generator = "random"
    configs[2].engine = "random"

    // Override some properties to use in the full-size simulations
    const overrides = configs.map(e => { 
        return {
            canvasWidth: 1000,
            canvasHeight: 1000,
            iterationsPerFrame: e.generator == "hex" ? 200 : 1000
        }
     })

    const jenerator = getJenerator();

    // Generate canvas elements
    const canvases = configs.map(e => jenerator.getCanvasString(e))

    // Inject canvas elements
    canvases.forEach((e, i) => miniContainer(i).innerHTML += e)

    // Get canvas controllers, with click handlers added to redirect to full size sims
    const controllers = configs
        .map(e => CanvasController(e.canvasId))
        .map((e,i) => {
            e.addClickHandler(evt => window.location.href=`/jerry.html?${configs[i].getQueryString(overrides[i])}`)
            return e
        })

    // Init mini-sims
    const states = configs.map((e,i) => jenerator.initCanvas(e, controllers[i]))
    .map(e => {
        // Let's hack in a temperature generating function...
        // TODO: don't do this
        e.getTemperature = () => 1
        return e
    })

    // Run mini-sims
    configs.forEach((e,i) => getEnjine(configs[i], states[i], controllers[i]).start(configs[i].iterationsPerFrame))
})()