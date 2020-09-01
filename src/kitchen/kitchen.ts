import {
  selectNumericState,
  selectState,
} from '@ciesielskico/home-assistant-rxjs';
import { interval, merge, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { HOME } from '..';
import { checkState } from '../util';

export enum KitchenEntities {
  DishwasherPower = 'sensor.dishwasher_power',
  Dishwasher = 'input_select.dishwasher_status',
}

export type DishwasherStatus = 'Dirty' | 'Clean' | 'Running' | 'Drying';

export const dishwasherPower$ = HOME.entities.pipe(
  selectNumericState(KitchenEntities.DishwasherPower),
);

export const dishwasher$ = HOME.entities.pipe(
  selectState(KitchenEntities.Dishwasher),
  map(status => status as DishwasherStatus),
);

export const dishwasherAutomation$: Observable<unknown> = merge(
  interval(60 * 1000),
  dishwasherPower$,
).pipe(checkState(dishwasherPower$, watts => watts >= 10));

export const dishwasherRunning$ = dishwasher$.pipe(
  filter(status => status === 'Running'),
);

export const dishwasherNotRunning$ = dishwasher$.pipe(
  filter(status => status !== 'Running'),
);

const setDishwasherStatus = (value: DishwasherStatus) =>
  HOME.services.call('input_select', 'set_option', { value });
