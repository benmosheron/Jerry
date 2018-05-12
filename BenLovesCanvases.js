// Functions for drawing on a canvas
function CanvasController(id) {
    if (typeof (id) === "undefined" || id === null) throw new Error("id cannot be null");

    const element = document.getElementById(id);
    if (element === null) throw new Error(`Element with id [${id}] could not be found.`);

    const ctx = element.getContext("2d");
    if (ctx === null) throw new Error(`Could not get rendering context from element [${id}]. Check it is a canvas?`);

    const rand255 = () => Math.floor(Math.random() * 256);
    const root3 = Math.sqrt(3);

    this.randomColour = () => `rgb(${rand255()}, ${rand255()}, ${rand255()})`
    this.drawSquareRandom = function (x, y, s) {
        this.drawSquare(x, y, s, this.randomColour());
    }
    this.drawSquare = function (x, y, s, colour) {
        ctx.fillStyle = colour;
        ctx.fillRect(x, y, s, s);
    }
    this.drawHexRandom = function drawHexRandom(x, y, s) {
        this.drawHex(x, y, s, randomColour());
    }
    this.drawHex = function drawHex(x, y, s, colour) {
        // Draw a flat-top hexagon
        // centered on (x,y) with side length s
        ctx.fillStyle = colour;
        // ctx.strokeStyle = "rgb(0,0,0)";
        ctx.beginPath();
        // Start with the right point
        ctx.moveTo(x + s, y);
        // Bottom right
        ctx.lineTo(x + (s / 2), y - (root3 * s) / 2);
        // Bottom left
        ctx.lineTo(x - (s / 2), y - (root3 * s) / 2);
        // Left
        ctx.lineTo(x - s, y);
        // Top left
        ctx.lineTo(x - (s / 2), y + (root3 * s) / 2);
        // Top right
        ctx.lineTo(x + (s / 2), y + (root3 * s) / 2);
        // Back to start
        ctx.lineTo(x + s, y);
        ctx.closePath();
        // If we want to draw and outline around each hexagon
        // ctx.stroke();
        ctx.fill();
    }
    this.addMouseMoveHandler = function (handler) {
        element.onmousemove = handler;
    }
    this.addClickHandler = function (handler) {
        element.onclick = handler;
        element.className += " pointer"
    }

}
