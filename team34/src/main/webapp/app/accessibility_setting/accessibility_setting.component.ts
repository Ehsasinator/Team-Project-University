import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import { UserSettingsService } from 'app/entities/user-settings/service/user-settings.service';
import { IUserSettings, NewUserSettings } from 'app/entities/user-settings/user-settings.model';

import { UserManagementService } from 'app/admin/user-management/service/user-management.service';
//import { IUser } from 'app/admin/user-management/user-management.model';

import { THEME } from 'app/entities/enumerations/theme.model';
import { SIZE } from 'app/entities/enumerations/size.model';

@Component({
  selector: 'jhi-setting',
  templateUrl: './accessibility_setting.component.html',
  styleUrls: ['./accessibility_setting.component.scss'],
})
export class AccessibilitySettingComponent implements OnInit, OnDestroy {
  account: Account | null = null;

  //user: IUser | null = null;
  user_id: number | null = null;

  settings_list: IUserSettings[] | null = null;

  settings: IUserSettings | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private settingsService: UserSettingsService,
    private userManagementService: UserManagementService
  ) {}

  backToSettingPage(): void {
    this.router
      .navigate(['setting'])
      .then(() => {
        console.log('Navigation to setting page successful');
      })
      .catch(error => {
        console.error('Error navigating to setting page: ', error);
      });
  }

  updateCSSFromSettings(): void {
    if (this.settings == null) {
      return;
    }
    if (this.settings!.theme == THEME.DARK) {
      document.body.classList.remove('light', 'contrast', 'system', 'colourblind');
      document.body.classList.add('dark');
    }
    if (this.settings!.theme == THEME.LIGHT) {
      document.body.classList.remove('dark', 'contrast', 'system', 'colourblind');
      document.body.classList.add('light');
    }
    if (this.settings!.theme == THEME.DARK) {
      document.body.classList.remove('light', 'dark', 'system', 'colourblind');
      document.body.classList.add('contrast');
    }
    if (this.settings!.colourBlindness == true) {
      document.body.classList.remove('light', 'contrast', 'system', 'dark');
      document.body.classList.add('colourblind');
    }
    if (this.settings!.dyslexicFont == true) {
      document.body.classList.add('dyslexic');
    } else {
      document.body.classList.remove('dyslexic');
    }
    return;
  }

  flipBodyClass(): void {
    /*
    if (document.body.classList.contains('dyslexic')) {
      //document.body.id = '';
      document.body.classList.remove('dyslexic');
    } else {
      //document.body.id = 'dyslexic';
      document.body.classList;
    }
    */
    document.body.classList.toggle('dyslexic');
    if (this.settings != null) {
      this.settings.dyslexicFont = true;
      this.settingsService.update(this.settings).subscribe();
    }
  }

  contrastThemeClick(): void {
    document.body.classList.remove('light', 'dark', 'system', 'colourblind');
    document.body.classList.add('contrast');
    if (this.settings != null) {
      this.settings.theme = THEME.HIGH_CONTRAST;
      this.settings.colourBlindness = false;
      this.settingsService.update(this.settings).subscribe();
    }
  }

  colourThemeClick(): void {
    document.body.classList.remove('light', 'dark', 'system', 'contrast');
    document.body.classList.add('colourblind');
    if (this.settings != null) {
      this.settings.theme = THEME.DARK;
      this.settings.colourBlindness = true;
      this.settingsService.update(this.settings).subscribe();
    }
  }

  createDefaultSettings(): void {
    console.log('here i am');
    this.settingsService
      .create({
        id: null,
        theme: THEME.DARK,
        hud: SIZE.MEDIUM,
        fontSize: SIZE.MEDIUM,
        dyslexicFont: false,
        colourBlindness: false,
        user: { id: this.user_id!, login: this.account!.login },
      })
      .subscribe(res => {
        this.findUserSettings();
      });
  }

  findUserSettings(): void {
    if (this.account === null) {
      return;
    }
    this.settingsService.query().subscribe(list => {
      console.log(list.body);
      this.settings_list = list.body;
      //console.log(this.settings_list);
      if (this.settings_list === null) {
        return;
      }
      for (let i = 0; i < this.settings_list.length; ++i) {
        if (this.settings_list[i].user == null) {
          continue;
        }
        if (this.settings_list[i].user!.login == this.account!.login) {
          this.settings = this.settings_list[i];
          console.log(this.settings);
          this.updateCSSFromSettings();
          return;
        }
      }
      this.createDefaultSettings();
      return;
      //return false;
    });
    //if (this.settings == null) {
    //  return false;
    //}
    //return true;
    return;
  }

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      console.log(this.account);
      if (this.account != null) {
        this.userManagementService.find(this.account!.login).subscribe(user => {
          this.user_id = user.id;
          this.findUserSettings();
        });
      }
    });
  }

  accessibility_setting(): void {
    this.router.navigate(['/accessibility_setting']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
