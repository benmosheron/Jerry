function getEnjine(constants, strategy, state, ctx){
    let enjine = {};
    let unpack = (p) => [Math.floor(p/state.ny), p%state.ny];
    let pack = (i,j) => (i*state.ny) + j;
    switch(strategy){
        case "random":
            enjine.run = function(){
                // Pick a random square
                let size = constants.cellSize;
                let rand = (lim) => Math.floor(Math.random() * lim / size);
                let x = rand(constants.canvasWidth) * size;
                let y = rand(constants.canvasHeight) * size;
                // Change it to a random colour
                let rand255 = () => Math.floor(Math.random() * 256);
                let colour = `rgb(${rand255()}, ${rand255()}, ${rand255()})`;
                ctx.fillStyle = colour;
                ctx.fillRect(x, y, size, size);
            };
            break;
        case "ising":
            let rand1or1 = () => Math.random() < 0.5 ? 1 : -1;
            let getColour = (s) => s == 1 ? "rgb(200, 200, 200)" : "rgb(50, 50, 50)";
            function getNeighbours(state, i, j){
                let neighbours = new Array(4);
                neighbours[0] = pack(i === 0 ? state.nx - 1 : i - 1, j);
                neighbours[1] = pack(i, j === 0 ? state.ny - 1 : j - 1);
                neighbours[2] = pack(i === state.nx - 1 ? 0 : i + 1, j);
                neighbours[3] = pack(i, j === state.ny - 1 ? 0 : j + 1);
                return neighbours;
            };
            function calcEnergy(s, state, neighbours){
                 return -s * neighbours.reduce((prev, next) => prev + state.array[next], 0);
            };
            enjine.run = function(){
                // Pick a random state
                let r = Math.floor(Math.random() * state.length);
                let ij = unpack(r);
                let i = ij[0];
                let j = ij[1];
                // Get neighbour indices
                let neighbours = getNeighbours(state, i, j);
                let energyNow = calcEnergy(state.array[r], state, neighbours);
                let energyIfChanged = -energyNow;
                let delta = energyIfChanged - energyNow;
                if(delta < 0){
                    // flip
                    state.array[r] = -state.array[r];
                }
                else{
                    let probabilityOfChange = Math.exp(-delta * state.getTemperature());
                    if(Math.random() < probabilityOfChange){
                        // flip
                        state.array[r] = -state.array[r];
                    }
                }
                
                // Draw the square
                let size = constants.cellSize;
                let x = i * size;
                let y = j * size;
                ctx.fillStyle = getColour(state.array[r]);
                ctx.fillRect(x, y, size, size);
            };
            break;
        case "hex":
            enjine.run = function(){};
            break;
    };
    enjine.start = function(iterationsPerFrame){
        if(typeof(iterationsPerFrame) === "undefined" || iterationsPerFrame === null) iterationsPerFrame = 1;
        setInterval(
            function(){
                for (var i = 0; i < iterationsPerFrame; i++) {
                    enjine.run();
                }
            }, 16);
    }
    return enjine;
}