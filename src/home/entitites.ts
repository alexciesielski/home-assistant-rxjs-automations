export enum HomeEntity {
  AutomaticLights = 'input_boolean.automatic_lights',
  AutomaticBlinds = 'input_boolean.automatic_blinds',
  Presence = 'input_boolean.presence',
  ColorMode = 'input_select.color_mode',
  Sleep = 'input_boolean.sleep',
  PeopleSleepingCount = 'input_select.people_sleeping_count',

  CircadianSensor = 'sensor.circadian_values',
}
