import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { PlayerService } from 'app/entities/player/service/player.service';
import { IPlayer } from 'app/entities/player/player.model';
import { HttpResponse } from '@angular/common/http';
import { NewPlayer } from 'app/entities/player/player.model';
import { UserService } from 'app/entities/user/user.service';
import { IUser } from 'app/entities/user/user.model';
import { LoginService } from 'app/login/login.service';
import { NgxWebstorageModule } from 'ngx-webstorage';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  players: IPlayer[] | null = null;
  player: IPlayer | null = null;

  selectedGameMode: string | null = null; // To store the selected game mode
  private readonly destroy$ = new Subject<void>();
  showDropdown: boolean = false; // Variable to control the visibility of the dropdown

  constructor(
    private loginService: LoginService,
    private accountService: AccountService,
    private router: Router,
    private playerService: PlayerService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
    this.loadImage();
  }

  loadImage() {
    this.accountService.identity().subscribe(account => {
      if (account !== null) {
        this.playerService.query().subscribe(response => {
          this.players = response.body || [];

          const playerMatch = this.players.find(player => player.user?.login === account.login);

          if (playerMatch) {
            // alert('player exists');
            this.player = playerMatch;
            // console.log(playerMatch.playerIcon);
          } else {
            let users: IUser[];
            this.userService.query().subscribe(response => {
              users = response.body || [];

              const currentUser = users.find(user => user.login === account.login);

              if (currentUser) {
                const newPlayer: NewPlayer = {
                  id: null,
                  playerIcon:
                    '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',
                  playerIconContentType: 'unknown',
                  user: currentUser,
                };

                this.playerService.create(newPlayer).subscribe(
                  response => {
                    this.player = response.body;
                  },
                  error => {
                    console.error('Failed to create Player entity');
                  }
                );
              }
            });
          }
        });
      }
    });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleDropdown(): void {
    if (!this.account || !this.account.activated || !this.account.authorities || this.account.authorities.length === 0) {
      // Navigate to entry page if user is not logged in
      this.router.navigate(['/login']);
    } else {
      // Proceed with whatever action you want to perform if user is logged in
      this.showDropdown = !this.showDropdown;
    }
  }

  // Method to set the selected game mode
  selectGameMode(gameMode: string): void {
    if (this.selectedGameMode === gameMode) {
      this.selectedGameMode = null; // Deselect the game mode if the same button is clicked again
    } else {
      this.selectedGameMode = gameMode; // Select the game mode
    }
  }

  currentSelectedLabelId: string | null = null;

  increaseLabelSize(id: string): void {
    const currentLabel = this.currentSelectedLabelId ? document.getElementById(this.currentSelectedLabelId) : null;

    // Revert
    if (currentLabel) {
      currentLabel.classList.remove('clicked');
    }

    // Update the currently selected label ID
    this.currentSelectedLabelId = id;

    // Get the label to increase its size and change its color
    const label = document.getElementById(id);
    if (label) {
      label.classList.add('clicked');
    }

    // Get the currently selected label
    // const currentLabel = this.currentSelectedLabelId ? document.getElementById(this.currentSelectedLabelId) : null;

    // // Revert the size and color of the previously selected label if there was one
    // if (currentLabel) {
    //   const originalWidth = parseFloat(currentLabel.dataset.originalWidth || '0');
    //   const originalHeight = parseFloat(currentLabel.dataset.originalHeight || '0');
    //   currentLabel.style.width = originalWidth + 'px';
    //   currentLabel.style.height = originalHeight + 'px';
    //   currentLabel.classList.remove('selected'); // Remove the 'selected' class
    // }

    // // Update the currently selected label ID
    // this.currentSelectedLabelId = id;

    // // Get the label to increase its size and change its color
    // const label = document.getElementById(id);
    // if (label) {
    //   const originalWidth = label.offsetWidth;
    //   const originalHeight = label.offsetHeight;

    //   // Calculate new width and height
    //   const newWidth = originalWidth * 1.025; // Increase width by 2.5%
    //   const newHeight = originalHeight * 1.025; // Increase height by 2.5%

    //   // Adjust left and top positions
    //   const newLeft = parseFloat(label.style.left || '0') - (newWidth - originalWidth) / 2;
    //   const newTop = parseFloat(label.style.top || '0') - (newHeight - originalHeight) / 2;

    //   // Store the original size and position as data attributes
    //   label.dataset.originalWidth = originalWidth.toString();
    //   label.dataset.originalHeight = originalHeight.toString();
    //   label.dataset.originalLeft = label.style.left || '0';
    //   label.dataset.originalTop = label.style.top || '0';

    //   // Update the style with the new size and position
    //   label.style.width = newWidth + 'px';
    //   label.style.height = newHeight + 'px';
    //   label.style.left = newLeft + 'px';
    //   label.style.top = newTop + 'px';

    //   // Add the 'selected' class to change the color
    //   label.classList.add('selected');
    // }
  }

  // Method to navigate based on the selected game mode
  playGame(): void {
    if (this.selectedGameMode) {
      if (this.selectedGameMode === 'Competition') {
        this.router.navigate(['/competition']);
      } else if (this.selectedGameMode === 'Player VS AI') {
        this.router.navigate(['/playervsai']);
      } else if (this.selectedGameMode === 'Practice') {
        this.router.navigate(['/canvas']);
      }
    } else {
      // Show an error message or handle the case when no game mode is selected
      console.log('Please select a game mode');
    }
  }

  // Method to handle clicks outside of the dropdown to close it
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showDropdown = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
