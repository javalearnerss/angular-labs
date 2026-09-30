import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  loading$ = new BehaviorSubject<boolean>(false);

  show() {
    this.counter++;
    this.loading$.next(true);
  }

  hide() {
    this.counter--;
    if (this.counter <= 0) {
      this.counter = 0;
      this.loading$.next(false);
    }
  }
}