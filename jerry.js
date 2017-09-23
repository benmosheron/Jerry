(function(){
    document.body.innerHTML += "<h1>hey</h1>";
    let constants = getConstants();
    let strategy = constants.strategy;

    
    let jenerator = getJenerator();
    let slider = jenerator.getSlider(constants);
    document.body.innerHTML += slider;
    let getTemperature = () => document.getElementById(constants.temperatureSlider.id).value / 100; 
    
    // Generate and inject canvas string.
    let canvas = jenerator.getCanvasString(constants);
    document.body.innerHTML += canvas;

    // Init canvas
    const canvasController = CanvasController(constants.canvasId);
    let state = jenerator.initCanvas(constants, canvasController);

    // Add a state method to read the temperature from the slider
    state.getTemperature = getTemperature;

    let enjine = getEnjine(constants, strategy, state, canvasController);
    enjine.start(constants.iterationsPerFrame);
})();
