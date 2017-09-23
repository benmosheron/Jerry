(function(){
    // do some varying width/heights
    let temp = [];
    let vgen = getJenerator();
    for (var i = 0; i < 5; i++) {
        let width = 100 + (i*10);
        let height = 50 + (i*10);
        let variables = getConstants();
        variables.canvasId = `varyCanvas${i}`;
        variables.canvasWidth = width;
        variables.canvasHeight = height;
        temp.push(variables);
        document.body.innerHTML += `<div>${vgen.getCanvasString(variables)}</div>`;
    }

    for (var i = 0; i < 5; i++) {
        vgen.initCanvas(temp[i]);
    }
    
return;
    document.body.innerHTML += "<h1>hey</h1>";
    let constants = getConstants();
    let strategy = constants.strategy;

    let jenerator = getJenerator();
    let slider = jenerator.getSlider(constants);
    document.body.innerHTML += slider;
    let getTemperature = () => document.getElementById(constants.temperatureSlider.id).value / 100; 

    let canvas = jenerator.getCanvasString(constants);
    document.body.innerHTML += canvas;
    let state = jenerator.initCanvas(constants, strategy);

    // Add a state method to read the temperature from the slider
    state.getTemperature = getTemperature;

    let ctx = document.getElementById(constants.canvasId).getContext("2d");

    let enjine = getEnjine(constants, strategy, state, ctx);
    enjine.start(constants.iterationsPerFrame);
})();
