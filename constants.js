function getConstants(){

    function includeInQueryString(p){
        // Parameters to include in the query string
        return [
            "generator","engine","canvasWidth","canvasHeight","cellSize","cellPadding","iterationsPerFrame"
        ].includes(p)
    }

    c = {
        generator: "ising",
        engine: "ising",
        canvasWidth: 100,
        canvasHeight: 100,
        canvasId: "canvas0",
        cellSize: 10,
        cellPadding: 0,
        iterationsPerFrame: 200,
        temperatureSlider: {
            id: "temperatureSlider0",
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