import "./style.css";

const APP_NAME = "";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;


// canvas elements

let gameName = document.createElement('h1');
gameName.innerText = "Sketchpad";
gameName.className = 'game-name';
app.appendChild(gameName);

let canvas = document.createElement('canvas');
canvas.className = 'canvas';
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

let isDrawing = false;
const points: { x: number; y: number }[][] = [];
const context = canvas.getContext("2d");

// mouse events

canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  isDrawing = true;
  points.push([{ x, y }]);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const newPoint = { x: e.offsetX, y: e.offsetY };
    points[points.length - 1].push(newPoint);
    canvas.dispatchEvent(new Event("drawing-changed")); 
  }
});

window.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
    canvas.dispatchEvent(new Event("drawing-changed")); 
  }
});


canvas.addEventListener("drawing-changed", () => {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "black";
    context.lineWidth = 1;

    points.forEach((line) => {
      if (line.length > 1) {
        context.beginPath();
        for (let i = 1; i < line.length; i++) {
          const { x: x1, y: y1 } = line[i - 1];
          const { x: x2, y: y2 } = line[i];
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
        }
        context.stroke();
      }
    });
  }
});


// clear button

let clear = document.createElement('button');
clear.innerHTML = 'clear';
clear.className = 'clear-button';
app.appendChild(clear);
clear.addEventListener('click', () => {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});