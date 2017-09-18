(function(){
    document.body.innerHTML += "<h1>hey</h1>";
    let constants = getConstants();
    let jenerator = getJenerator();
    let canvas = jenerator.getCanvasString(constants);
    document.body.innerHTML += canvas;
    jenerator.initCanvas(constants, "random");
})();
