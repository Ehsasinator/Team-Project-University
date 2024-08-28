import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerVSAIService } from './playervsai.service';

@Component({
  selector: 'app-player-vs-ai',
  templateUrl: './playervsai.component.html',
  styleUrls: ['./playervsai.component.scss'],
})
export class PlayerVsAIComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  imgData: string = '';
  marker: string = 'black';
  word: any;
  ranword: any;
  markerWidth: number = 10;
  lastEvent: MouseEvent | null = null;
  mouseDown: boolean = false;
  showResult: boolean = false;
  showStartButton: boolean = true;
  showWord: boolean = true; // New property to control the visibility of the "Start" button
  showRounds: boolean = true;
  showDoodlePage: boolean = false;
  num: number = 1;
  showFinalPage: boolean = false;
  timer: any;
  timerInterval: any;
  showPredictedWord: boolean = false;
  showStart: boolean = true;
  checkPoint: string = '';
  showRoundsWord: boolean = true;
  showNextButton: boolean = false;
  totalScore: number = 0;
  finalScore: string = '';

  constructor(private http: HttpClient, private service: PlayerVSAIService) {}

  ngAfterViewInit(): void {
    if (this.num == 1) {
      this.newWord();
    }
  }

  initializeCanvas() {
    const canvasElement: HTMLCanvasElement | null = this.canvas?.nativeElement;

    if (canvasElement && !this.showResult) {
      const context = canvasElement.getContext('2d');

      if (context) {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear the canvas
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasElement.width, canvasElement.height);

        canvasElement.addEventListener('mousedown', e => {
          this.lastEvent = e;
          this.mouseDown = true;
        });

        canvasElement.addEventListener('mousemove', e => {
          if (this.mouseDown && this.lastEvent) {
            context.beginPath();
            context.moveTo(this.lastEvent.offsetX, this.lastEvent.offsetY);
            context.lineTo(e.offsetX, e.offsetY);
            context.lineWidth = this.markerWidth;
            context.strokeStyle = this.marker;
            context.lineCap = 'round';
            context.stroke();
            this.lastEvent = e;
          }
        });

        canvasElement.addEventListener('mouseup', () => {
          this.mouseDown = false;
        });
      } else {
        console.error('Context is null');
      }
    }
  }

  submitDoodle() {
    this.showNextButton = true;
    this.timer = 0;
    const canvasElement: HTMLCanvasElement | null = this.canvas?.nativeElement;
    this.showPredictedWord = true;
    console.log(this.showPredictedWord);
    this.showDoodlePage = false;
    this.showResult = true;
    // Show the "Start" button after submitting the doodle
    this.showWord = false;
    if (canvasElement) {
      const imgData = canvasElement.toDataURL();
      console.log(imgData);
      this.service.sendImageData(imgData).subscribe();
      this.changeWord();
    }
  }

  next() {
    this.word = '';
    this.showNextButton = false;
    this.checkPoint = '';
    this.showPredictedWord = false;
    this.newWord();
    this.updateRound();
    this.showResult = false;

    if (this.num > 6) {
      this.showRounds = false;
      this.finalScore = this.totalScore + '/6';
      this.showFinalPage = true;
    } else {
      this.showRoundsWord = true;
      this.showStart = true;
      this.showStartButton = true; // Hide the "Start" button when transitioning back to the normal page
      this.showDoodlePage = false;
      this.showRounds = true;
    }
  }

  startNewGame() {
    // Logic to start a new game, you can add any additional functionality here
    this.showRoundsWord = false;
    this.showRounds = false;
    this.showDoodlePage = true;

    this.initializeCanvas();
    this.showWord = true;
    this.showStartButton = false;

    // Add any other logic needed for starting a new game
  }

  test() {
    this.service.sendImageData('hello world').subscribe();
  }
  startTimer() {
    this.showStart = false;
    this.timer = 20; // Set the initial timer value (in seconds)
    this.initializeCanvas();
    // Update the timer every second
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        // Timer reached 0, perform any actions needed
        clearInterval(this.timerInterval); // Stop the interval
        this.submitDoodle(); // Or any other action you want to perform
      }
    }, 1000);
  }

  public changeWord(): void {
    this.service.getResult().subscribe((response: string) => {
      this.word = response;
      if (this.word == this.ranword) {
        this.totalScore += 1;
        this.word = 'The AI predicted it to be: ' + response;
        this.checkPoint = ' Correct';

        console.log('yooo right answer dawg' + this.word + this.ranword);
      } else {
        this.word = 'The AI predicted it to be: ' + response;
        this.checkPoint = ' incorrect';
        console.log('wrong answer puppy' + this.word + this.ranword);
      }
    });
  }
  public newWord(): void {
    this.service.getNewWord().subscribe((response: string) => {
      this.ranword = response;
    });
  }
  public updateRound(): void {
    this.num = this.num + 1;
  }
}
