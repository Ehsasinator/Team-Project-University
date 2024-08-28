import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class PlayerVSAIService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('/playervsai');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  //    getRandomWord(): string {
  //       const words = ['apple', 'banana', 'orange', 'grape', 'melon'];
  //       const randomIndex = Math.floor(Math.random() * words.length);
  //       return words[randomIndex];
  //     }

  getResult(): Observable<string> {
    //this format needed as you telling angular to treat message as text and not json - this prevents parse error
    return this.http.get(`${this.resourceUrl}/randomWord`, { responseType: 'text' });
  }
  getNewWord(): Observable<string> {
    //this format needed as you telling angular to treat message as text and not json - this prevents parse error
    return this.http.get(`${this.resourceUrl}/newWord`, { responseType: 'text' });
  }
  sendImageData(imageData: string) {
    return this.http.post(`${this.resourceUrl}/savedoodle`, { data: imageData });
  }
}

//   // Example HTTP GET request
//   getData(): Observable<any> {
//     return this.http.get<any>(`${this.baseUrl}/data`);
//   }
//
//   // Example HTTP POST request
//   postData(data: any): Observable<any> {
//     return this.http.post<any>(`${this.baseUrl}/data`, data);
//   }
//
