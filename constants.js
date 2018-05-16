function getConstants(){

    function includeInQueryString(p){
        // Parameters to include in the query string (when navigating out of the index page)
        return [
            "generator","engine","canvasWidth","canvasHeight","cellSize","cellPadding","iterationsPerFrame","nPetals","sliderMemorisedDelta"
        ].includes(p)
    }

    c = {
        generator: "ising",
        engine: "ising",
        canvasWidth: 100,
        canvasHeight: 100,
        canvasId: "canvas0",
        canvasClass: "main-canvas",
        cellSize: 10,
        cellPadding: 0,
        iterationsPerFrame: 200,
        // Flower stats
        // Number of petals
        nPetals: 49,
        // Distance (px) increase from centre per petal
        dPetals: 1,
        // Slider values from zero to:
        rSliderMax: 1000,
        // Added to r_mut value to init, to maek flower spin on startup
        sliderMemorisedDelta: 0.1,
        temperatureSlider: {
            id: "slider0",
            min: 0,
            max: 200,
            default: 100
        },
        getActualSize: function(){ return this.cellSize + this.cellPadding; },
        getQueryString: function(overrides){ 
            if(typeof overrides === "undefined") overrides = {}
            function getProp(properties, key){
                if(overrides[key]) return overrides[key]
                else return properties[key]
            }
            return Object.keys(this).filter(includeInQueryString).map(e => `${e}=${getProp(this,e)}`).join("&") 
        },
    };

    return c;
}