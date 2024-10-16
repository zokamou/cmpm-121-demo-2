import "./style.css";

const APP_NAME = "";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;


let gameName = document.createElement('h1');
gameName.innerText = "Sketchpad";
gameName.className = 'game-name';
app.appendChild(gameName);

let canvas = document.createElement('canvas');
canvas.className = 'canvas';
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);





// add mouse events
let isDrawing = false;
let x = 0;
let y = 0;

const context = canvas.getContext("2d");

canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

window.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

let clear = document.createElement('button');
clear.innerHTML = 'clear';
clear.className = 'clear-button'
app.appendChild(clear);
clear.addEventListener('click', () => {
    if(context){
        context.clearRect(0, 0, canvas.width, canvas.height)
    }
})
