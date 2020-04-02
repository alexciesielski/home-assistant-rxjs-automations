import { HomeAssistantRXJS, select } from 'home-assistant-rxjs';
import { from } from 'rxjs';
import { map, merge, mergeMap } from 'rxjs/operators';
import { OfficeRoom } from '../office';
import { getEntities } from '../util';
import { Room } from '../util/room';
import { HomeEntity } from './entities';

export class Home extends HomeAssistantRXJS {
  constructor() {
    super();
    this.initialize();
  }

  readonly homeEntityStates$ = getEntities<HomeEntity>(
    this.entities,
    Object.values(HomeEntity),
  );

  readonly colorMode$ = this.homeEntityStates$[HomeEntity.ColorMode];
  readonly sleepMode$ = this.homeEntityStates$[HomeEntity.Sleep];

  readonly peopleSleepingCount$ = this.homeEntityStates$[
    HomeEntity.PeopleSleepingCount
  ].pipe(map(count => Number.parseInt(count)));

  readonly circadian$ = this.entities.pipe(
    select(HomeEntity.CircadianSensor, 'attributes', 'rgb_color'),
  );

  rooms: Room[] = [new OfficeRoom(this)];
  automations$ = from(this.rooms).pipe(
    mergeMap(room => room.automations$),
    merge(),
  );

  initialize() {
    this.automations$.subscribe(x => console.log(x));
  }
}
