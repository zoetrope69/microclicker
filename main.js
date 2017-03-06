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

console.info('🔎 🖱️  micro:clicker\n');

function connectToMicrobit() {
  console.info('🔮  Scanning for micro:bit...');
  BBCMicrobit.discover(microbit => {
    console.info(`🤖  micro:bit found!\n`);

    microbit.on('disconnect', _ => {
      console.info('🤖  micro:bit disconnected.an');
    });

    console.info('🔌  Connecting to micro:bit');
    microbit.connectAndSetUp(_ => {
      console.info('🤖  micro:bit connected!\n');
      console.info('     ➡️️  Press right arrow to move right.');
      console.info('     ⬅️  Press left arrow to move left.');
      console.info('   ⬅️ ➡️ ️ Hold both buttons to disconnect.\n');

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
  // console.info(`⏺️  Button ${direction} ${action}\n`);

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
      console.log('\n🔌  Disconnecting micro:bit!');

      // disconnect
      setTimeout(_ => {
        microbit.writeLedMatrixState(clear());
        microbit.disconnect(_ => {
          console.log('👋  Bye-bye\n');
          process.exit(1);
        });
      }, 500);
    }
  }
}

connectToMicrobit();
