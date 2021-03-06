# Solar Self-Consumption PWM

A Node.js App that permits to optimize the self-consumption of Solar Energy ON-Grid system, using the energy available (produced and not used) to control a PWM generator.

Throught MQTT Topics, it receive instant power (W) of Inverter (mqtt.topics.powerInverter) and of House (mqtt.topics.powerHouse) and it calculate the specific duty cycle to send in a PWM controller throught MQTT protocol or custom shell command

Tested using:
-  [Remote PWM Controller - ESP8266](https://github.com/mobot95/RemotePWMController-ESP8266) or Pigpio library with RPI Model B using a custom shell
-  Home-Assistant MQTT Broker
-  SolarEdge AC Inverter (Modbus Integration in Home-Assistant)
-  Shelly EM

## Installation
###### Prerequisites:
```
-  MQTT Broker
-  node
-  npm
-  pm2 (optional)
```

###### Install & Execution:
```
npm i
node App.js
```

###### Run at boot (pm2 required):
```
pm2 start App.js
```

## Configuration Example:
```JSON
{
  "mqtt": {
    "clientId_prefix": "SolarSelfConsumptionPWM_",
    "hostname": "mqtt://192.168.1.252:1883",
    "username": "mqtt",
    "password": "mqtt",
    "topics": {
      "powerHouse": "shellies/shelly_em/emeter/0/power",
      "powerInverter": "solaredge/power",
      "publishPowerLoad": "PWMHeater/power",
      "publishDuty": "PWMHeater/duty",
      "publishRange": "PWMHeater/range",
      "publishFrequency": "PWMHeater/frequency"
    }
  },
  "pwm": {
    "frequency": 10,
    "range": 100
  },
  "load": {
    "ratedPower": 1530,
    "minPower": 350
  },
  "customShellExec": "",
  "scanInverval": 5000,
  "netMargin": 50
}
```
In the example, a frequency of 10hz (pwm.frequency) and a range of 100 (pwm.range) are set in order to drive an SSR with a resistive load rated at 1530w (load.ratedPower).

PWM is active when the power available is atleast 350w (load.minPower), PWM settings are generated every 5000ms (scanInterval) and a power of atleast 50w it will be available on the grid (netMargin).

PWM settings (duty, range and frequency) are published to specific topics in order to manage a remote PWM controller.

An estimated power associated to the duty applied to PWM  it's published to specific topic (topics.publishPowerLoad)

## Custom Shell Execution
Instead of MQTT, A custom shell can be executed every time PWM settings are generated.

It's possible to write a custom shell editing the "customShellExec" parameter in the configuration

###### Example:
```
"customShellExec": "python3 pwm-controller.py {frequency} {range} {duty}"
```
