import {
  HomeAssistantRXJS,
  selectAttributes,
} from '@ciesielskico/home-assistant-rxjs';
import { from, Observable } from 'rxjs';
import { map, merge, mergeMap } from 'rxjs/operators';
import { OfficeRoom } from '../office';
import { getEntities, lightOptions } from '../util';
import { Room } from '../util/room';
import { WashroomRoom } from '../washroom/washroom';
import { HomeEntity } from './entitites';

export class Home {
  constructor(private harxjs: HomeAssistantRXJS) {}

  readonly entities = this.harxjs.entities;
  readonly services = this.harxjs.services;
  readonly lights = this.harxjs.lights;
  readonly connection$ = this.harxjs.connection$;

  readonly homeEntityStates$ = getEntities<HomeEntity>(
    this.entities,
    Object.values(HomeEntity),
  );

  rooms?: Room[];
  automations$?: Observable<unknown>;

  initialize() {
    this.rooms = [new OfficeRoom(this), new WashroomRoom(this)];
    this.automations$ = from(this.rooms).pipe(
      mergeMap(room => room.automations$),
      merge(),
    );
    this.harxjs.initialize().then(() => this.automations$!.subscribe());
  }

  getLightOptions(colorMode?: string) {
    return lightOptions(this, colorMode);
  }

  getCircadianColor() {
    return this.entities.pipe(
      selectAttributes(HomeEntity.CircadianSensor),
      map(attributes => attributes.rgb_color),
      map(rgb_color => rgb_color as [number, number, number]),
    );
  }

  getAutomaticLights() {
    return this.homeEntityStates$[HomeEntity.AutomaticLights];
  }

  getColorMode() {
    return this.homeEntityStates$[HomeEntity.ColorMode];
  }

  getSleepMode() {
    return this.homeEntityStates$[HomeEntity.Sleep];
  }

  getPeopleSleepingCount() {
    return this.homeEntityStates$[HomeEntity.PeopleSleepingCount].pipe(
      map(count => Number.parseInt(count)),
    );
  }
}
