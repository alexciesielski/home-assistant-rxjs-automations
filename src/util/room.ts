import { Observable } from 'rxjs';

export abstract class Room {
  constructor() {}

  entities$: Record<string, Observable<string>> = {};
  automations$!: Observable<any>;
}
