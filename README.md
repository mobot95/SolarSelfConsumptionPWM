# SolarSelfConsumptionPWM

A Node.js App that permits to optimize the self-consumption of Solar Energy ON-Grid system, using the energy available (produced and not used) to control a PWM generator
Throught MQTT Topics, it receive instant power (W) of Inverter (mqtt.topics.powerInverter) and of House (mqtt.topics.powerHouse) and it calculate the specific duty cycle to send in a PWM controller throught MQTT protocol / custom shell command


Config Example:
{
    "mqtt": {
        "clientId_prefix": "SolarSelfConsumptionPWM_",
        "hostname": "mqtt://192.168.1.2522:1883",
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
In the example, I'm using a frequency of 10hz (pwm.frequency) and a range of 100 (pwm.range), it generate 10 duty steps specific for an AC frequency of 50hz (period of 100ms, duty cycle of 10ms).
I'm driving a resistive load rated at 1530w (load.ratedPower), I want to active the PWM when the power available is atleast 350w (load.minPower), I want to do the scan every 5000ms (scanInterval)
I want to let 50w in the grid (netMargin)