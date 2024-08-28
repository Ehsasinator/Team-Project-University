import { Component, OnInit, OnDestroy, ViewChild, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'jhi-art',
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.scss', './art.component2.scss'],
})
export class ArtComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('myCanvas') canvas: any; //fetching canvas form html file
  isDrawing: boolean = false; //flag to check if mouse is currently drawing - more specifically if it is being held down
  currentColour: string = '#000'; //default black
  activeColour = 'black'; //this is for visual effect on html
  currentLineWidth: number = 5; //thickness of line default value
  currentTool = 'pencil'; //current selected tool
  widthCanvas: number = 800;
  heightCanvas: number = 450;
  canvasElement: any; //canvas is stored in here and is manipulated using this instead of directly
  lastX: number = 0; //last X coordinate of mouse
  lastY: number = 0; //last Y coordinate of mouse
  ctx: any; //this is what actually allows you to draw on the canvas - not initialised yet
  snapshot: any; //used to store canvas data
  previousColour: string = '#000'; //for implementing user friendly stuff
  previousTool: string = 'pencil'; //for implementing user friendly stuff
  outline: boolean = false; //outline or fill shape
  undoStack: ImageData[];
  redoStack: ImageData[];
  activeMoreColour = '';
  colour_selector: boolean = false;
  showErrorMessage: boolean = false;
  selectedColor = '#ff0000';
  isDragging = false;
  offsetX = 0;
  offsetY = 0;
  windowTop: any;
  windowLeft: any;
  colourInput: string = '';
  thicknessInput: number = this.currentLineWidth;
  colour1: string[] = ['#8B008B', '	#FFA07A', '#FF8C00', '#FFD700', '	#F0E68C', '#FFE4B5', '#ADFF2F', '	#556B2F', '#00FF7F'];
  colour2: string[] = ['#5F9EA0', '	#00008B', '	#BC8F8F', '	#800000', '	#8B4513', '	#2F4F4F', '	#B22222', '	#A9A9A9', '#78C2B6'];
  colour3: string[] = ['#00FF00', '#DDA0DD', '#FFe6FF', '#D2B48C', '#B8860B', '#006400', '#DC143C', '#7B68EE', '#191970'];

  constructor(private router: Router, public renderer: Renderer2) {
    this.undoStack = [];
    this.redoStack = [];

    //visually show that black is selected and pencil is selected at the start
    this.activeColour = 'black';
    this.currentTool = 'pencil';
  }

  //called before this page is initialised
  ngOnInit(): void {}

  //called when switching away from page I think
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //do stuff after getting the canvas from the html file
  ngAfterViewInit() {
    //setting canvas height and width
    this.canvasElement = this.canvas.nativeElement;
    this.renderer.setProperty(this.canvasElement, 'width', this.widthCanvas);
    this.renderer.setProperty(this.canvasElement, 'height', this.heightCanvas);

    //bunch of stuff to see what mouse is doing
    this.canvasElement.addEventListener('mousedown', this.handleStart.bind(this));
    this.canvasElement.addEventListener('mousemove', this.handleMove.bind(this));
    this.canvasElement.addEventListener('mouseup', this.handleEnd.bind(this));

    //very important as they handle with  mouse leaving the canvas and it still being in drawing mode
    document.addEventListener('mousemove', this.handleMove.bind(this));
    document.addEventListener('mouseup', this.handleEnd.bind(this));

    this.ctx = this.canvasElement.getContext('2d'); //initialising the thing that actually allows drawing
    this.ctx.strokeStyle = this.currentColour; //colour of the line
    this.ctx.lineWidth = this.currentLineWidth; //size of the line

    //fill the entire canvas white
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.widthCanvas, this.heightCanvas);
    this.ctx.fillStyle = this.currentColour;
  }

  // Handle mouse down event - mouse down means left button is pressed
  handleStart(ev: MouseEvent) {
    this.saveState(); //save current state
    this.isDrawing = true; // Let others know mouse is pressed down

    //this gets the new offset when using angular html main stuff
    //the  window thing is needed to keep aligned even if the page is scrolled down
    this.lastX = ev.pageX - this.canvasElement.getBoundingClientRect().left - window.pageXOffset;
    this.lastY = ev.pageY - this.canvasElement.getBoundingClientRect().top - window.pageYOffset;

    if (this.currentTool === 'pencil' || this.currentTool === 'brush' || this.currentTool === 'eraser') {
      this.drawDot(); // Draw dot at initial position
    } else {
      //this is to allow different size shapes to be added in smoothly
      //this one copies the pixel data currently on the canvas as data
      this.snapshot = this.ctx.getImageData(0, 0, this.widthCanvas, this.heightCanvas);
    }
  }

  // Handle mouse move event
  handleMove(ev: MouseEvent) {
    if (this.isDrawing) {
      // this makes it so it only draws if the mouse was pressed down
      if (this.currentTool !== 'pencil' && this.currentTool !== 'brush' && this.currentTool !== 'eraser') {
        //this also fixes some dragging issues with the shapes
        this.ctx.putImageData(this.snapshot, 0, 0); //adding copied canvas data to this canvas
      }

      if (this.currentTool === 'pencil' || this.currentTool === 'brush' || this.currentTool === 'eraser') {
        //this gets the new offset when using angular html main stuff
        //the  window thing is needed to keep aligned even if the page is scrolled down
        let currentX = ev.pageX - this.canvasElement.getBoundingClientRect().left - window.pageXOffset;
        let currentY = ev.pageY - this.canvasElement.getBoundingClientRect().top - window.pageYOffset;

        //Drawing logic
        this.ctx.beginPath();
        this.ctx.lineJoin = 'round'; // round the end of the line
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.closePath();
        this.ctx.stroke(); // Stroke path

        this.lastX = currentX;
        this.lastY = currentY;
      } else if (this.currentTool === 'square' || this.currentTool === 'square-outline') {
        this.drawSquare(ev);
      } else if (this.currentTool === 'circle' || this.currentTool === 'circle-outline') {
        this.drawCircle(ev);
      } else if (this.currentTool === 'triangle' || this.currentTool === 'triangle-outline') {
        this.drawTriangle(ev);
      }
    }
  }

  // Handle mouse up event - this means left mouse button no longer is being pressed
  handleEnd(ev: MouseEvent) {
    this.isDrawing = false; // tell everyone left mouse button no longer is being held down
  }

  // this is what actually draws the dot
  drawDot() {
    let dotRadius = this.currentLineWidth / 2; // thickness of the dot

    //Drawing logic
    this.ctx.beginPath();
    this.ctx.arc(this.lastX, this.lastY, dotRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawSquare(ev: MouseEvent) {
    let width = ev.pageX - this.lastX - this.canvasElement.getBoundingClientRect().left - window.pageXOffset;
    let height = ev.pageY - this.lastY - this.canvasElement.getBoundingClientRect().top - window.pageYOffset;

    //the first two are starting point
    //the last two are width and height
    this.outline ? this.ctx.strokeRect(this.lastX, this.lastY, width, height) : this.ctx.fillRect(this.lastX, this.lastY, width, height);
  }

  drawCircle(ev: MouseEvent) {
    let offsetX = ev.pageX - this.lastX - this.canvasElement.getBoundingClientRect().left - window.pageXOffset;
    let offsetY = ev.pageY - this.lastY - this.canvasElement.getBoundingClientRect().top - window.pageYOffset;
    let radius = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    //circle logic
    this.ctx.beginPath();
    //this gives more control over the circle even allowing ovals
    this.ctx.ellipse(this.lastX, this.lastY, Math.abs(offsetX), Math.abs(offsetY), 0, 0, Math.PI * 2);

    this.outline ? this.ctx.stroke() : this.ctx.fill();
  }

  drawTriangle(ev: MouseEvent) {
    let offsetX = ev.pageX - this.canvasElement.getBoundingClientRect().left - window.pageXOffset;
    let offsetY = ev.pageY - this.canvasElement.getBoundingClientRect().top - window.pageYOffset;

    //triangle logic
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.lineTo(this.lastX * 2 - offsetX, offsetY);
    this.ctx.closePath();

    this.outline ? this.ctx.stroke() : this.ctx.fill();
  }

  // change colour
  changeColour(event: MouseEvent) {
    const target = event.target as HTMLElement; //get the button that was pressed

    //make sure it was indeed a button and it does exist - now changed to anchor
    if (target && target.tagName === 'A') {
      const colour = target.dataset.colour; //get the colour associated with the button

      if (colour) {
        // just in case the button had no colour with it then do nothing further
        switch (colour) {
          case 'black':
            this.currentColour = '#000';
            this.activeColour = 'black';
            break;
          case 'turquoise':
            this.currentColour = '#1abc9c';
            this.activeColour = 'turquoise';
            break;
          case 'carrot':
            this.currentColour = '#e67e22';
            this.activeColour = 'carrot';
            break;
          case 'amethyst':
            this.currentColour = '#9b59b6';
            this.activeColour = 'amethyst';
            break;
          case 'yellow':
            this.currentColour = '#FFFF00';
            this.activeColour = 'yellow';
            break;
          case 'red':
            this.currentColour = '#FF0000';
            this.activeColour = 'red';
            break;
          case 'green':
            this.currentColour = '#00FF00';
            this.activeColour = 'green';
            break;
          case 'chocolate':
            this.currentColour = '#7B3F00';
            this.activeColour = 'chocolate';
            break;
          case 'neonblue':
            this.currentColour = '#18dcff';
            this.activeColour = 'neonblue';
            break;
          case 'electricblue':
            this.currentColour = '#7efff5';
            this.activeColour = 'electricblue';
            break;
          case 'creamypeach':
            this.currentColour = '#f3a683';
            this.activeColour = 'creamypeach';
            break;
          case 'roguepink':
            this.currentColour = '#f8a5c2';
            this.activeColour = 'roguepink';
            break;
        }

        if (this.currentTool === 'eraser') {
          if (this.previousTool === 'pencil') {
            this.currentTool = 'pencil';
            this.currentLineWidth = 5;
          } else {
            this.currentTool = 'brush';
            this.currentLineWidth = 20;
          }

          this.ctx.lineWidth = this.currentLineWidth;
        }

        this.ctx.fillStyle = this.currentColour; //this controls what colour the dot and shapes are
        this.ctx.strokeStyle = this.currentColour; // colour of line
      }
    }
  }

  //change tool
  changeTool(event: MouseEvent) {
    const target = event.target as HTMLElement; //get the button that was pressed

    //make sure it was indeed a anchor and it does exist
    if (target && target.tagName === 'A') {
      const tool = target.dataset.tool; //get the tool associated with the button

      if (tool) {
        //just in case the button had no tool with it then do nothing further
        switch (tool) {
          case 'pencil':
            if (this.currentTool === 'eraser') {
              this.currentColour = this.previousColour;
              this.ctx.fillStyle = this.previousColour;
              this.ctx.strokeStyle = this.previousColour;
            }
            this.currentTool = 'pencil';
            this.currentLineWidth = 5;
            break;
          case 'brush':
            if (this.currentTool === 'eraser') {
              this.currentColour = this.previousColour;
              this.ctx.fillStyle = this.previousColour;
              this.ctx.strokeStyle = this.previousColour;
            }
            this.currentTool = 'brush';
            this.currentLineWidth = 20;
            break;
          case 'eraser':
            if (this.currentTool === 'pencil') this.previousTool = 'pencil';
            if (this.currentTool === 'brush') this.previousTool = 'brush';
            this.currentTool = 'eraser';
            this.previousColour = this.currentColour;
            this.ctx.fillStyle = '#fff'; //for fixing the dot not being white when eraser is selected
            this.ctx.strokeStyle = '#fff';
            this.currentLineWidth = 20; //eraser width
            break;
          case 'square-outline':
          case 'square':
            if (this.currentTool === 'pencil') this.previousTool = 'pencil';
            if (this.currentTool === 'brush') this.previousTool = 'brush';
            this.currentTool = tool === 'square' ? 'square' : 'square-outline';
            this.outline = tool === 'square' ? false : true;
            this.ctx.strokeStyle = this.currentColour;
            this.ctx.fillStyle = this.currentColour; //for fixing the dot not being white when eraser is selected
            break;
          case 'circle-outline':
          case 'circle':
            if (this.currentTool === 'pencil') this.previousTool = 'pencil';
            if (this.currentTool === 'brush') this.previousTool = 'brush';
            this.currentTool = tool === 'circle' ? 'circle' : 'circle-outline';
            this.outline = tool === 'circle' ? false : true;
            this.ctx.strokeStyle = this.currentColour;
            this.ctx.fillStyle = this.currentColour; //for fixing the dot not being white when eraser is selected
            break;
          case 'triangle-outline':
          case 'triangle':
            if (this.currentTool === 'pencil') this.previousTool = 'pencil';
            if (this.currentTool === 'brush') this.previousTool = 'brush';
            this.currentTool = tool === 'triangle' ? 'triangle' : 'triangle-outline';
            this.outline = tool === 'triangle' ? false : true;
            this.ctx.strokeStyle = this.currentColour;
            this.ctx.fillStyle = this.currentColour; //for fixing the dot not being white when eraser is selected
            break;
          case 'clear':
            this.saveState();
            const currentFillStyle = this.ctx.fillStyle;
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.widthCanvas, this.heightCanvas);
            this.ctx.fillStyle = currentFillStyle;
            break;
        }
        this.ctx.lineWidth = this.currentLineWidth; // thickness of line
        this.thicknessInput = this.currentLineWidth;
      }
    }
  }

  //go to home page when back button is pressed
  home(event: MouseEvent) {
    this.router.navigate(['/']);
  }

  //download image from canvas
  downloadImage(event: MouseEvent) {
    const link = document.createElement('a');
    link.href = this.canvasElement.toDataURL('image/png');
    link.download = 'drawing.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  //for parent component
  getDataURL(): string {
    return this.canvasElement.toDataURL();
  }

  //for parent component
  setDataURL(url: string): void {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0);
    };
  }

  //for keeping track of the states of the canvas
  saveState() {
    const imageData = this.ctx.getImageData(0, 0, this.widthCanvas, this.heightCanvas);
    this.undoStack.push(imageData);
  }

  //undo a state of the canvas
  undo() {
    if (this.undoStack.length > 0) {
      const imageData = this.undoStack.pop();
      this.redoStack.push(this.ctx.getImageData(0, 0, this.widthCanvas, this.heightCanvas));
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  //redo a state of the canvas
  redo() {
    if (this.redoStack.length > 0) {
      const imageData = this.redoStack.pop();
      this.undoStack.push(this.ctx.getImageData(0, 0, this.widthCanvas, this.heightCanvas));
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  getThickness() {
    this.currentLineWidth = this.thicknessInput;
    this.ctx.lineWidth = this.currentLineWidth;
  }

  inputColour() {
    if (this.isValidColor(this.colourInput)) {
      this.showErrorMessage = false;
      this.selectColor(this.colourInput);
    } else {
      this.showErrorMessage = true;
    }
  }

  isValidColor(colour: string): boolean {
    const element = document.createElement('div');
    element.style.color = colour;
    return !!element.style.color || /^#[0-9A-F]{6}$/i.test(colour);
  }

  selectColor(colour: string) {
    this.currentColour = colour;
    this.activeColour = '';

    if (this.currentTool === 'eraser') {
      if (this.previousTool === 'pencil') {
        this.currentTool = 'pencil';
        this.currentLineWidth = 5;
      } else {
        this.currentTool = 'brush';
        this.currentLineWidth = 20;
      }

      this.ctx.lineWidth = this.currentLineWidth;
    }

    this.ctx.fillStyle = this.currentColour;
    this.ctx.strokeStyle = this.currentColour;
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    const windowEl = document.querySelector('.window') as HTMLElement;
    this.offsetX = event.clientX - windowEl.offsetLeft;
    this.offsetY = event.clientY - windowEl.offsetTop;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const windowEl = document.querySelector('.window') as HTMLElement;
      const rect = windowEl.getBoundingClientRect();
      const newX = event.clientX - this.offsetX;
      let newY = event.clientY - this.offsetY;
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      windowEl.style.left = Math.min(maxX, Math.max(0, newX)) + 'px';

      if (newY < 0) {
        newY = 0;
      }

      windowEl.style.top = newY + 'px';
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  showMoreColours() {
    this.activeMoreColour = 'plus';
    this.colour_selector = true;
    this.calculateWindowPosition();
  }

  calculateWindowPosition() {
    this.windowTop = 100;

    const screenWidth = window.innerWidth;
    const scrollOffset = window.pageXOffset;
    const elementWidth = 450;
    const center = (screenWidth - elementWidth) / 2 + scrollOffset;
    this.windowLeft = center;
  }

  closeWindow() {
    this.activeMoreColour = '';
    this.colour_selector = false;
  }
}
