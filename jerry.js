(function(){
    document.body.innerHTML += "<h1>hey</h1>";
    let constants = getConstants();
    let strategy = constants.strategy;

    
    let jenerator = getJenerator();
    let slider = jenerator.getSlider(constants);
    document.body.innerHTML += slider;
    let getTemperature = () => document.getElementById(constants.temperatureSlider.id).value / 100; 
    
    let canvas = jenerator.getCanvasString(constants);
    document.body.innerHTML += canvas;
    const canvasController = CanvasController(constants.canvasId);
    let state = jenerator.initCanvas(constants, canvasController);

    // Add a state method to read the temperature from the slider
    state.getTemperature = getTemperature;

    let ctx = document.getElementById(constants.canvasId).getContext("2d");

    // let enjine = getEnjine(constants, strategy, state, ctx);
    // enjine.start(constants.iterationsPerFrame);
})();
