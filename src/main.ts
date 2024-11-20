import "./style.css";

const APP_NAME = "";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
let lineWidth = 2;
let emojiRotation = 0;
let red = 0;
let green = 0;
let blue = 0;
const CANVAS_SIZE = 256;
const EXPORT_CANVAS_SIZE = 1024;
const DEFAULT_COLOR = "#000000";

function createInput(
  type: string,
  id: string,
  className?: string,
  value?: string
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  if (className) input.className = className;
  if (value) input.value = value;
  return input;
}

function createButton(
  text: string,
  className: string,
  onClick: () => void
): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

// Canvas elements
let gameName = document.createElement("h1");
gameName.innerText = "Sketchpad";
gameName.className = "game-name";
app.appendChild(gameName);

let canvas = document.createElement("canvas");
canvas.className = "canvas";
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
app.appendChild(canvas);

let buttonBox = document.createElement("div");
let stickerBox = document.createElement("div");
buttonBox.className = "button-box";
stickerBox.className = "sticker-box";

const colorPicker = createInput(
  "color",
  "colorPicker",
  "color-picker",
  DEFAULT_COLOR
);
colorPicker.className = "button-box";
app.appendChild(colorPicker);

app.appendChild(buttonBox);
app.appendChild(stickerBox);

let isDrawing = false;
let toolPreview: ToolPreview | null = null;
const points: (MarkerLine | Sticker)[] = [];
let redos: (MarkerLine | Sticker)[] = [];
const context = canvas.getContext("2d");
let currentColor = DEFAULT_COLOR;

class MarkerLine {
  // define as class properties
  private points: { x: number; y: number }[];
  lineWidth: number;
  red: number;
  green: number;
  blue: number;

  constructor(
    x: number,
    y: number,
    lineWidth: number,
    red: number,
    green: number,
    blue: number
  ) {
    // actually initialize the values
    this.points = [{ x, y }];
    this.lineWidth = lineWidth;
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    // loops through points to create a line
    if (this.points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = `rgb(${this.red},${this.green},${this.blue})`;
      ctx.lineWidth = this.lineWidth;
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

class Sticker {
  emoji: string;
  x: number;
  y: number;
  rotation: number;

  constructor(emoji: string, x: number, y: number, rotation: number) {
    this.emoji = emoji;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  preview(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = `30px sans-serif`;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = `30px sans-serif`;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180); // Rotate the canvas
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

let selectedSticker: Sticker | null = null;
let stickerPreview: Sticker | null = null;

class ToolPreview {
  x: number;
  y: number;
  red: number;
  green: number;
  blue: number;
  radius: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    red: number,
    green: number,
    blue: number
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // makes the circle cursor
    ctx.beginPath();
    ctx.strokeStyle = `rgb(${red},${green},${blue})`;
    ctx.lineWidth = lineWidth;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }
}

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  if (selectedSticker) {
    const newSticker = new Sticker(selectedSticker.emoji, x, y, emojiRotation);
    points.push(newSticker);
    redos = [];
    stickerPreview = null;
    selectedSticker = null;
  } else {
    isDrawing = true;
    const newLine = new MarkerLine(x, y, lineWidth, red, green, blue);
    // add the Markerline to points
    points.push(newLine);
    redos = [];
  }
});

canvas.addEventListener("mousemove", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (isDrawing) {
    // builds off of the Markerline that was created when mousedown
    points[points.length - 1].drag(x, y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (selectedSticker) {
    stickerPreview = new Sticker(selectedSticker.emoji, x, y, emojiRotation);
    canvas.dispatchEvent(new Event("tool-moved"));
  } else {
    if (!toolPreview) {
      toolPreview = new ToolPreview(x, y, lineWidth / 2, red, green, blue);
    } else {
      toolPreview.updatePosition(x, y);
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

// Helper function to clear the canvas context
function clearCanvas(ctx, width = canvas.width, height = canvas.height) {
  ctx.clearRect(0, 0, width, height);
}

canvas.addEventListener("tool-moved", () => {
  if (context) {
    clearCanvas(context);
    points.forEach((lineOrSticker) => {
      lineOrSticker.display(context);
    });
    if (stickerPreview) {
      stickerPreview.preview(context);
    } else if (!isDrawing && toolPreview) {
      toolPreview.draw(context);
    }
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
    clearCanvas(context);
    points.forEach((line) => line.display(context));
  }
});

// Clear button
buttonBox.appendChild(
  createButton("Clear", "clear-button", () => {
    points.length = 0;
    canvas.dispatchEvent(new Event("drawing-changed"));
  })
);

// Undo button
buttonBox.appendChild(
  createButton("Undo", "clear-button", () => {
    if (points.length) redos.push(points.pop()!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  })
);

colorPicker.addEventListener("input", (e) => {
  currentColor = (e.target as HTMLInputElement).value;
  canvas.style.backgroundColor = currentColor;
});

// Redo button
buttonBox.appendChild(
  createButton("Redo", "clear-button", () => {
    const redopop = redos.pop();
    if (redopop) {
      points.push(redopop);
    }
    canvas.dispatchEvent(new Event("drawing-changed"));
  })
);

// Thin marker button
let thin = document.createElement("button");
thin.innerHTML = "Thin Marker";
thin.className = "marker-selected";
buttonBox.appendChild(thin);
thin.addEventListener("click", () => {
  red = Math.random() * 255;
  green = Math.random() * 255;
  blue = Math.random() * 255;
  lineWidth = 2;
  thin.className = "marker-selected";
  thick.className = "marker";
});

// Thick marker button
let thick = document.createElement("button");
thick.innerHTML = "Thick Marker";
thick.className = "marker";
buttonBox.appendChild(thick);
thick.addEventListener("click", () => {
  red = Math.random() * 255;
  green = Math.random() * 255;
  blue = Math.random() * 255;
  lineWidth = 5;
  thick.className = "marker-selected";
  thin.className = "marker";
});

// Emoji Buttons
const stickers = [
  { emoji: "🩷", name: "heart" },
  { emoji: "🍓", name: "strawberry" },
  { emoji: "🌼", name: "flower" },
];

const createStickerButtons = () => {
  stickerBox.innerHTML = "";
  stickers.forEach((stickerData) => {
    const stickerButton = document.createElement("button");
    stickerButton.innerHTML = stickerData.emoji;
    stickerButton.className = "clear-button";
    stickerBox.appendChild(stickerButton);

    stickerButton.addEventListener("click", () => {
      emojiRotation = Math.random() * 360;
      selectedSticker = new Sticker(stickerData.emoji, 0, 0, emojiRotation);
      canvas.dispatchEvent(new Event("tool-moved"));
    });
  });

  const customStickerButton = document.createElement("button");
  customStickerButton.innerHTML = "Create Emoji Sticker";
  customStickerButton.className = "clear-button";
  stickerBox.appendChild(customStickerButton);

  customStickerButton.addEventListener("click", () => {
    const customEmoji = prompt("Enter your emoji:", "");
    if (customEmoji) {
      stickers.push({ emoji: customEmoji, name: "newEmoji" });
      createStickerButtons();
    }
  });
};

createStickerButtons();

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export as PNG";
exportButton.className = "clear-button";
buttonBox.appendChild(exportButton);

exportButton.addEventListener("click", () => {
  exportCanvas();
});

const exportCanvas = () => {
  // make new canvas
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = EXPORT_CANVAS_SIZE;
  exportCanvas.height = EXPORT_CANVAS_SIZE;
  const exportCtx = exportCanvas.getContext("2d");

  exportCtx!.fillStyle = "white";
  exportCtx!.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  const scaleFactor = 4;
  exportCtx!.scale(scaleFactor, scaleFactor);

  // redraw everything to the new canvas
  points.forEach((item) => {
    item.display(exportCtx!);
  });

  // export
  const dataURL = exportCanvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = dataURL;
  anchor.download = "sketchpad.png";
  anchor.click();
};
