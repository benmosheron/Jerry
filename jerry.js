(function(){
    let config = getConstants();
    let params = getParams(window.location.href)
    Object.keys(params).forEach((k) => config[k] = params[k]);
    
    let jenerator = getJenerator();
    let getTemperature = () => document.getElementById(config.temperatureSlider.id).value / 100; 

    if(config.engine === "ising"){
        const slider0=config.temperatureSlider.id
        if (document.getElementById(slider0)) {
            document.getElementsByClassName("slider-spacer")[0].hidden = false
            document.getElementsByClassName("slider-spacer")[1].hidden = false
            document.getElementById(slider0).max = config.temperatureSlider.max
            document.getElementById(slider0).value = config.temperatureSlider.default
            document.getElementById(slider0).style.width = `${config.canvasWidth}px`
            document.getElementById(slider0).hidden = false
        }
    }

    // Generate and inject canvas string.
    let canvas = jenerator.getCanvasString(config);
    document.body.innerHTML += canvas;

    // Init canvas
    const canvasController = new CanvasController(config.canvasId);
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
            .forEach(kvp => params[kvp[0]] = tryNumber(kvp[1]));

        return params;
    }

    function tryNumber(s){
        // Convert numerical parameters to numbers, otherwise return the string
        let i = parseInt(s, 10)
        if (isNaN(i)) return s
        else return i
    }

})();
