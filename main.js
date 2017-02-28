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
const PERIOD = 2000; // time to check accelerometer in ms
const BUTTON_ACTIONS = ['released', 'pressed', 'held'];

function connectToMicrobit() {
  DEBUG && console.info('scanning for microbit');
  BBCMicrobit.discover(microbit => {
    DEBUG && console.info(`discovered microbit: id = ${microbit.id}, address = ${microbit.address}`);

    microbit.on('disconnect', _ => {
      DEBUG && console.info('microbit disconnected!');
    });

    DEBUG && console.info('connecting to microbit');
    microbit.connectAndSetUp(_ => {
      DEBUG && console.info('connected to microbit');

      // listen for button presses
      microbit.on('buttonAChange', value => handleButton(microbit, 'left', BUTTON_ACTIONS[value]));
      microbit.on('buttonBChange', value => handleButton(microbit, 'right', BUTTON_ACTIONS[value]));
      microbit.subscribeButtons();

      // poll the accelerometer
      microbit.on('accelerometerChange', (x, y, z) => handleAccelerometer(microbit, x, y, z));
      microbit.writeAccelerometerPeriod(PERIOD, microbit.subscribeAccelerometer());

      // show a pattern on load
      microbit.writeLedMatrixState(drawPattern());
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
    microbit.writeLedMatrixState(drawProgess(slideCount));
  }

  if (action === 'pressed') {
    robot.keyTap(direction);
    handleSlideCount(direction);
    microbit.writeLedMatrixState(drawArrow(direction));
  }
}

function handleAccelerometer(microbit, x, y, z) {
  const upsideDown = z > 0.9;
  if (upsideDown) {
    DEBUG && console.info('upside down');
    slideCount = 0;
    microbit.writeLedMatrixState(drawPattern());
  }
}

connectToMicrobit();
