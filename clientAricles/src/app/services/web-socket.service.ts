import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:4000');
  }

  onArticleUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('article-updated', data => observer.next(data));
    });
  }
}
