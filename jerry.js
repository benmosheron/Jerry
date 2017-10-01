(function(){
    document.body.innerHTML += "<h1>Proof of Hexagoncept</h1>";
    let config = getConstants();
    let params = getParams(window.location.href)
    Object.keys(params).forEach((k) => config[k] = params[k]);
    
    let jenerator = getJenerator();
    let slider = jenerator.getSlider(config);
    let getTemperature = () => document.getElementById(config.temperatureSlider.id).value / 100; 

    if(config.engine === "ising"){
        document.body.innerHTML += slider;
    }

    // Generate and inject canvas string.
    let canvas = jenerator.getCanvasString(config);
    document.body.innerHTML += canvas;

    // Init canvas
    const canvasController = CanvasController(config.canvasId);
    let state = jenerator.initCanvas(config, canvasController);

    // Add a state method to read the temperature from the slider
    state.getTemperature = getTemperature;

    let enjine = getEnjine(config, state, canvasController);
    enjine.start(config.iterationsPerFrame);

    function getParams(url){
        let params = {};
        let i = url.indexOf("?");
        if(i < 1) return params;

        url
            .substr(i+1)
            .split("&")
            .map(kvp => kvp.split("="))
            .forEach(kvp => params[kvp[0]] = kvp[1]);

        return params;
    }

})();
