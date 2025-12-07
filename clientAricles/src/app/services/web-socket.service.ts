import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  private articleUpdated$ = new Subject<any>();

  constructor() {
    this.socket = io('http://localhost:4000');

    this.socket.on('article-updated', msg => {
      this.articleUpdated$.next(msg);
    });
  }

  onArticleUpdated(): Observable<any> {
    return this.articleUpdated$.asObservable();
  }
}
