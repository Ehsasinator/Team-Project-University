import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import { HttpClient } from '@angular/common/http';

import { UserSettingsService } from 'app/entities/user-settings/service/user-settings.service';
import { IUserSettings, NewUserSettings } from 'app/entities/user-settings/user-settings.model';

import { UserManagementService } from 'app/admin/user-management/service/user-management.service';
//import { IUser } from 'app/admin/user-management/user-management.model';

import { THEME } from 'app/entities/enumerations/theme.model';
import { SIZE } from 'app/entities/enumerations/size.model';

@Component({
  selector: 'jhi-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit, OnDestroy {
  account: Account | null = null;

  //user: IUser | null = null;
  user_id: number | null = null;

  settings_list: IUserSettings[] | null = null;

  settings: IUserSettings | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private http: HttpClient,
    private settingsService: UserSettingsService,
    private userManagementService: UserManagementService
  ) {}

  backToHomePage(): void {
    this.router
      .navigate([''])
      .then(() => {
        console.log('Navigation to home page successful');
      })
      .catch(error => {
        console.error('Error navigating to home page: ', error);
      });
  }

  toAccessibilityPage(): void {
    this.router
      .navigate(['accessibility_setting'])
      .then(() => {
        console.log('Navigation to accessibility page successful');
      })
      .catch(error => {
        console.error('Error navigating to accessibility page: ', error);
      });
  }

  toUpdatePage(): void {
    this.router
      .navigate(['account/settings'])
      .then(() => {
        console.log('Navigation to update page successful');
      })
      .catch(error => {
        console.error('Error navigating to update page: ', error);
      });
  }

  /*setCookie(name: string, value: string, days: number): void {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }

  getCookie(name: string): string {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
  }

  storeSettingsLocal(settings: any): void {
    this.setCookie('drawing_settings_12345', settings.toString(), 30);
  }

  getSettingsLocal(): any {
    return JSON.parse(this.getCookie('drawing_settings_12345'));
  }*/

  /*updateSetting(field: string, value: any): void {
    let setting = this.getSettingsLocal();
    setting[field] = value;
    //this.storeSettingsLocal(setting);
  }*/

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

  /*function storeSettingsServer(settings) {
  
  }*/

  changeThemeLight(): void {
    document.body.classList.remove('contrast', 'dark', 'system', 'colourblind');
    document.body.classList.add('light');
    if (this.settings != null) {
      this.settings.theme = THEME.LIGHT;
      this.settings.colourBlindness = false;
      this.settingsService.update(this.settings).subscribe();
    }
  }

  changeThemeDark(): void {
    document.body.classList.remove('light', 'contrast', 'system', 'colourblind');
    document.body.classList.add('dark');
    if (this.settings != null) {
      this.settings.theme = THEME.DARK;
      this.settings.colourBlindness = false;
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

  setting(): void {
    this.router.navigate(['/setting']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
