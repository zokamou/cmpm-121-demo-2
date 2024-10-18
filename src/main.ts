import "./style.css";

const APP_NAME = "";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// Canvas elements
let gameName = document.createElement('h1');
gameName.innerText = "Sketchpad";
gameName.className = 'game-name';
app.appendChild(gameName);

let canvas = document.createElement('canvas');
canvas.className = 'canvas';
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

let buttonbox = document.createElement('div');
buttonbox.className = 'button-box';
app.appendChild(buttonbox);

let isDrawing = false;
const points: MarkerLine[] = [];
let redos: MarkerLine[] = [];
const context = canvas.getContext("2d");

class MarkerLine {
  private points: { x: number; y: number }[];

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      for (let i = 1; i < this.points.length; i++) {
        const { x: x1, y: y1 } = this.points[i - 1];
        const { x: x2, y: y2 } = this.points[i];
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    }
  }
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  isDrawing = true;
  const newLine = new MarkerLine(x, y);
  points.push(newLine);
  redos = [];
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const x = e.offsetX;
    const y = e.offsetY;
    points[points.length - 1].drag(x, y);
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
    points.forEach((line) => line.display(context));
  }
});

// Clear button
let clear = document.createElement('button');
clear.innerHTML = 'clear';
clear.className = 'clear-button';
buttonbox.appendChild(clear);
clear.addEventListener('click', () => {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Undo button
let undo = document.createElement('button');
undo.innerHTML = 'undo';
undo.className = 'clear-button';
buttonbox.appendChild(undo);
undo.addEventListener('click', () => {
  const undo = points.pop();
  if (undo) {
    redos.push(undo);
  }
  canvas.dispatchEvent(new Event("drawing-changed")); 
});

// Redo button
let redo = document.createElement('button');
redo.innerHTML = 'redo';
redo.className = 'clear-button';
buttonbox.appendChild(redo);
redo.addEventListener('click', () => {
  const redopop = redos.pop();
  if (redopop) {
    points.push(redopop);
  }
  canvas.dispatchEvent(new Event("drawing-changed")); 
});