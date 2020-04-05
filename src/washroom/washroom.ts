import { merge, Observable } from 'rxjs';
import { debounceTime, filter, switchMapTo } from 'rxjs/operators';
import { Home } from '../home/home';
import { checkState, getEntityStates, Room } from '../util';
import { WashroomEntity } from './entities';

export class WashroomRoom extends Room {
  constructor(private home: Home) {
    super();
  }

  readonly entityStates = getEntityStates<WashroomEntity>(
    this.home.entities,
    Object.values(WashroomEntity),
  );

  readonly light$ = this.entityStates[WashroomEntity.Light];
  readonly automations$ = merge(this.lightTurnOff(this.light$));

  lightTurnOff(light$: Observable<string>) {
    return light$.pipe(
      filter(light => light === 'on'),
      debounceTime(10 * 60 * 1000),
      checkState(this.home.getAutomaticLights(), 'on'),
      switchMapTo(this.home.lights.turnOff(WashroomEntity.Light)),
    );
  }
}
