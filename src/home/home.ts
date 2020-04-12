import {
  HomeAssistantRXJS,
  selectAttributes,
} from '@ciesielskico/home-assistant-rxjs';
import { Connection } from 'home-assistant-js-websocket';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getEntities, lightOptions } from '../util';
import { Room } from '../util/room';
import { washroomAutomation$ } from '../washroom/washroom';
import { HomeEntity } from './entitites';

export class Home {
  constructor(private harxjs: HomeAssistantRXJS) {}

  readonly entities = this.harxjs.entities;
  readonly services = this.harxjs.services;
  readonly lights = this.harxjs.lights;
  readonly connection$: Observable<Connection | null> = this.harxjs.connection$;

  readonly homeEntityStates$ = getEntities<HomeEntity>(
    this.entities,
    Object.values(HomeEntity),
  );

  rooms?: Room[];
  automations$?: Observable<unknown>;

  async initialize() {
    await this.harxjs.initialize();

    const office = await import('../office/office');
    const bedroom = await import('../bedroom/bedroom');

    this.automations$ = merge(
      office.AUTOMATIONS(),
      bedroom.AUTOMATIONS(),
      washroomAutomation$(this),
    );
    this.automations$!.subscribe();
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
