#! /usr/bin/env node

const BBCMicrobit = require('bbc-microbit');
const robot = require('robotjs');

const {
  clear,
  drawArrow,
  drawPattern,
  drawProgess,
  MATRIX_SIZE
} = require('./draw');

let slideCount = 0;
const heldButtons = {
  left: false,
  right: false
};

const BUTTON_ACTIONS = ['released', 'pressed', 'held'];

function connectToMicrobit() {
  console.info('Scanning for micro:bit...');
  BBCMicrobit.discover(microbit => {
    console.info(`Found the micro:bit! (id = ${microbit.id}, address = ${microbit.address})`);

    microbit.on('disconnect', _ => {
      console.info('micro:bit disconnected.');
    });

    console.info('Connecting to micro:bit');
    microbit.connectAndSetUp(_ => {
      console.info('micro:bit connected!');

      // listen for button presses
      microbit.on('buttonAChange', value => handleButton(microbit, 'left', BUTTON_ACTIONS[value]));
      microbit.on('buttonBChange', value => handleButton(microbit, 'right', BUTTON_ACTIONS[value]));
      microbit.subscribeButtons();

      // show a pattern on load
      microbit.writeLedMatrixState(drawPattern());
    });
  });
}

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
  console.info(`\nButton ${direction} ${action}`);

  if (action === 'released') {
    heldButtons[direction] = false;
    microbit.writeLedMatrixState(drawProgess(slideCount));
  }

  if (action === 'pressed') {
    robot.keyTap(direction);
    handleSlideCount(direction);
    microbit.writeLedMatrixState(drawArrow(direction));
  }

  if (action === 'held') {
    heldButtons[direction] = true;

    // if both buttons are held
    if (heldButtons['left'] && heldButtons['right']) {
      console.log('Disconnecting micro:bit!');
      microbit.writeLedMatrixState(clear());

      // disconnect
      setTimeout(_ => {
        microbit.disconnect(_ => {
          console.log('Bye-bye');
          process.exit(1);
        });
      }, 500);
    }
  }
}

connectToMicrobit();
