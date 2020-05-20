var Service, Characteristic;

var active = 0;
var swingMode = 0;
var rotationSpeed = 10;
var rotationSpeedMode = 0;

const { execSync } = require('child_process');

var command = "ir-ctl --device=/dev/lirc0 --send=/home/pi/homebridge_plugins/homebridge-fan/ir-signals/";

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-fan", "Fan", FanAccessory);
}

function FanAccessory(log, config) {
  this.log = log;
  this.name = config["fan"];
  
  this.service = new Service.Fanv2(this.name);
  
  this.service
    .getCharacteristic(Characteristic.Active)
    .on('get', this.getActive.bind(this))
    .on('set', this.setActive.bind(this));
  
  this.service
    .getCharacteristic(Characteristic.SwingMode)
    .on('get', this.getSwingMode.bind(this))
    .on('set', this.setSwingMode.bind(this));

  this.service
    .getCharacteristic(Characteristic.RotationSpeed)
    .on('get', this.getRotationSpeed.bind(this))
    .on('set', this.setRotationSpeed.bind(this));
}

FanAccessory.prototype.getActive = function(callback) {
  this.log("Get active: %s", active);
  callback(null, active);
}

FanAccessory.prototype.setActive = function(_active, callback) {
  if (active != _active) {
    active = _active;
    if (active == Characteristic.Active.ACTIVE) {
      let stdout = execSync(command+"power");
      swingMode = Characteristic.SwingMode.SWING_DISABLED;
      rotationSpeed = 10;
    } else {
      let stdout = execSync(command+"power");
    }
  }
  this.log("Set active: %s", active);
  callback(null);
}

FanAccessory.prototype.getSwingMode = function(callback) {
  this.log("Get swingMode: %s", swingMode);
  callback(null, swingMode);
}

FanAccessory.prototype.setSwingMode = function(_swingMode, callback) {
  if (swingMode != _swingMode) {
    swingMode = _swingMode;
    let stdout = execSync(command+"swing");
  }
  this.log("Set swingMode: %s", swingMode);
  callback(null);
}

FanAccessory.prototype.getRotationSpeed = function(callback) {
  this.log("Get rotationSpeed: %s (%s)", rotationSpeed, rotationSpeedMode);
  callback(null, rotationSpeed);
}

FanAccessory.prototype.setRotationSpeed = function(_rotationSpeed, callback) {
  if (rotationSpeed != _rotationSpeed) {
    let stdout = execSync(command+"speed");
    rotationSpeed = _rotationSpeed
    rotationSpeedMode = (rotationSpeedMode == 3) ? 0 : rotationSpeedMode + 1;
  }
  this.log("Set rotationSpeed: %s (%s)", rotationSpeed, rotationSpeedMode);
  callback(null);
}

/*
FanAccessory.prototype.setRotationSpeed = function(_rotationSpeed, callback) {
  var rs = (_rotationSpeed == 0) ? 0 : (_rotationSpeed - 1);
  var targetSpeedMode = rs/25 - ((rs/25)%1);
  this.log("TargetSpeed: %s (%s)", _rotationSpeed, targetSpeedMode);
  
  if (targetSpeedMode > rotationSpeedMode) {
    var i;
    for (i = 0; i < targetSpeedMode - rotationSpeedMode; i++) {
      let stdout = execSync(command+"speed");
    }
  } else if (targetSpeedMode < rotationSpeedMode) {
    var i;
    for (i = 0; i < 4 - rotationSpeedMode; i++) {
      let stdout = execSync(command+"speed");
    }
    for (i = 0; i < targetSpeedMode; i++) {
      let stdout = execSync(command+"speed");
    }
  }
  rotationSpeed = _rotationSpeed;
  rotationSpeedMode = targetSpeedMode;
  this.log("Set rotationSpeed: %s (%s)", rotationSpeed, rotationSpeedMode);
  callback(null);
}
*/

FanAccessory.prototype.getServices = function() {
  return [this.service];
}
