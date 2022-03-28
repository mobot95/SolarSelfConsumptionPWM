const mqtt = require('mqtt');
const shell = require('shelljs');

const config = require('./config.json');
const mqtt_clientId = config.mqtt.clientId_prefix;
const mqtt_hostName = config.mqtt.hostname;
const mqtt_username = config.mqtt.username;
const mqtt_password = config.mqtt.password;


const topic_powerHouse = config.mqtt.topics.powerHouse;
const topic_powerInverter = config.mqtt.topics.powerInverter;
const topic_publishPowerLoad = config.mqtt.topics.powerLoad;
const topic_publishDuty = config.mqtt.topics.publishDuty;
const topic_publishRange = config.mqtt.topics.publishRange;
const topic_publishFrequency = config.mqtt.topics.publishFrequency;

const scanInterval = config.scanInverval; //inverval to verify & apply new duty cycle (ms)

const pwmRange = config.pwm.range;
const pwmFreq = config.pwm.frequency; //frequency in Hz

const load_ratedPower = config.load.ratedPower;
const load_minPower = config.load.minPower;

const customShellExec = config.customShellExec;

const netMarginWatt = config.netMargin; //margin in watt
const pwmPeriod = 1/pwmFreq; //period in seconds
const pwmPulse = pwmPeriod / pwmRange;
const pwmDutyStep = 0.01/pwmPulse; //duty step
const pwmSteps = 100 / pwmFreq; //number of steps
const pwmDutyStepPower = load_ratedPower/pwmSteps; //estimated power of a duty step

let powerLoad = 0;
let pwmDuty = 0;
let powerInverter = 0;
let powerHouse = 0;

console.log("pwmFreq: " + pwmFreq);
console.log("pwmPeriod: " + pwmPeriod);
console.log("pwmPulse: " + pwmPulse);
console.log("pwmDutyStep: " + pwmDutyStep);
console.log("pwmSteps: " + pwmSteps);
console.log("pwmDutyStepPower: " + pwmDutyStepPower);

const client = mqtt.connect(mqtt_hostName, {
  mqtt_clientId,
  clean: true,
  connectTimeout: 4000,
  username: mqtt_username,
  password: mqtt_password,
  reconnectPeriod: 1000,
});


client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic_powerInverter], () => {
    console.log(`Subscribe to topic '${topic_powerInverter}'`)
  })
  client.subscribe([topic_powerHouse], () => {
    console.log(`Subscribe to topic '${topic_powerHouse}'`)
  })
});


client.on('message', (topic, payload) => {
	if (topic == topic_powerHouse){
		powerHouse = parseFloat(payload.toString());
	}
	if (topic == topic_powerInverter){
		powerInverter = parseFloat(payload.toString());
	}
});


client.publish(topic_publishDuty, String(pwmDuty));
client.publish(topic_publishRange, String(pwmRange));
client.publish(topic_publishFrequency, String(pwmFreq));

if (customShellExec){
	shell.exec(customShellExec.replace('{range}',String(pwmRange)).replace('{frequency}', String(pwmFreq)).replace('{duty}', String(pwmDuty)));
}

setInterval(function(){
	const net = powerInverter - powerHouse - netMarginWatt + powerLoad;
	console.log("-------------------------");
	console.log("Inverter:" + powerInverter);
	console.log("Grid: " + powerHouse);
	console.log("Available: " + net);
	
	if (net >= pwmDutyStepPower){
		pwmDuty = Math.floor(net/pwmDutyStepPower) * pwmDutyStep;
		if (pwmDuty >= pwmRange){
			pwmDuty = pwmRange;
		}
		
		powerLoad = pwmDuty/pwmDutyStep*pwmDutyStepPower;
		
		console.log("pwmDuty:" + pwmDuty);
		console.log("powerLoad:" + powerLoad);
			
		if (powerLoad > load_minPower){
			client.publish(topic_publishDuty, String(pwmDuty));
			if (customShellExec){
				shell.exec(customShellExec.replace('{range}',String(pwmRange)).replace('{frequency}', String(pwmFreq)).replace('{duty}', String(pwmDuty)));
			}
		}
		else{
			client.publish(topic_publishDuty, String(0));
			powerLoad = 0;
			if (customShellExec){
				shell.exec(customShellExec.replace('{range}',String(pwmRange)).replace('{frequency}', String(pwmFreq)).replace('{duty}', "0"));
			}
			console.log("Turn Off, not enough power");
		}
	}
	else{
		client.publish(topic_publishDuty, String(0));
		if (customShellExec){
			shell.exec(customShellExec.replace('{range}',String(pwmRange)).replace('{frequency}', String(pwmFreq)).replace('{duty}', "0"));
		}
		console.log("Turn Off");
		powerLoad = 0;
		
	}
	
	client.publish(topic_publishPowerLoad, parseFloat(powerLoad.toString()).toFixed(2));
}, scanInterval);
