export enum OfficeEntity {
  AutomaticLights = 'input_boolean.automatic_lights_office',
  LightsTimeout = 'input_number.office_light_timeout',
  ColorMode = 'input_select.color_mode_office',

  CeilingLED = 'light.office_office_ceiling_led_37',
  CeilingLight = 'light.office_office_ceiling_light_104',
  DesktopPlug = 'switch.office_desktop_plug_208',
  DesktopPowerConsumption = 'sensor.desktop_power',

  Motion = 'binary_sensor.office_office_motion_114',
  Lux = 'sensor.office_office_lux_sensor_116',
  Temperature = 'sensor.office_office_temperature_115',
}
/* 
export const OfficeEntityMapping: Record<
  OfficeEntity,
  {
    state_type: String | Number | Boolean;
  }
> = {
  [OfficeEntity.AutomaticLights]: {
    state_type: Boolean,
  },
};
 */
