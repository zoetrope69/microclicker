
const BBCMicrobit = require('bbc-microbit');
const robot = require('robotjs');

const {
  clear,
  drawArrow,
  drawPattern,
  drawProgess,
  MATRIX_SIZE
} = require('./draw');

const DEBUG = false; // toggle console info
const QUIET_LEDS = false; // disable leds
const PERIOD = 2000; // time to check accelerometer in ms
const BUTTON_ACTIONS = ['released', 'pressed', 'held'];

function connectToMicrobit() {
  DEBUG && console.info('scanning for microbit');
  BBCMicrobit.discover(microbit => {
    DEBUG && console.info('discovered microbit: id = %s, address = %s', microbit.id, microbit.address);

    microbit.on('disconnect', _ => {
      DEBUG && console.info('microbit disconnected!');
    });

    microbit.on('buttonAChange', value => handleButton(microbit, 'left', BUTTON_ACTIONS[value]));
    microbit.on('buttonBChange', value => handleButton(microbit, 'right', BUTTON_ACTIONS[value]));

    microbit.on('accelerometerChange', (x, y, z) => handleAccelerometer(microbit, x, y, z));

    DEBUG && console.info('connecting to microbit');
    microbit.connectAndSetUp(_ => {
      DEBUG && console.info('connected to microbit');

      microbit.subscribeButtons(function() {
        DEBUG && console.info('subscribed to buttons');
      });

      DEBUG && console.info('setting accelerometer period to %d ms', PERIOD);
      microbit.writeAccelerometerPeriod(PERIOD, function() {
        DEBUG && console.info('accelerometer period set');

        DEBUG && console.info('subscribing to accelerometer');
        microbit.subscribeAccelerometer(function() {
          DEBUG && console.info('subscribed to accelerometer');
        });
      });

      // clear leds
      microbit.writeLedMatrixState(clear());

      !QUIET_LEDS && microbit.writeLedMatrixState(drawPattern());
    });
  });
}

let slideCount = 0;
function handleSlideCount(type) {
  if (type === 'left') {
    if (slideCount > 0) {
      slideCount--;
    }
  } else {
    if (slideCount < MATRIX_SIZE) {
      slideCount++;
    }
  }
}

function handleButton(microbit, direction, action) {
  DEBUG && console.info(`button ${direction} ${action}`);

  if (action === 'released') {
    !QUIET_LEDS && microbit.writeLedMatrixState(drawProgess(slideCount));
  }

  if (action === 'pressed') {
    DEBUG && console.info(`moved slides ${direction}`);
    robot.keyTap(direction);
    handleSlideCount(direction);
    !QUIET_LEDS && microbit.writeLedMatrixState(drawArrow(direction));
  }
}

function handleAccelerometer(microbit, x, y, z) {
  const upsideDown = z > 0.9;
  if (upsideDown) {
    DEBUG && console.info('upside down');
    slideCount = 0;
    !QUIET_LEDS && microbit.writeLedMatrixState(drawPattern());
  }
}

connectToMicrobit();
