const MATRIX_WIDTH = 5;
const MATRIX_HEIGHT = 5;
const MATRIX_SIZE = MATRIX_WIDTH * MATRIX_HEIGHT;

function leadingZero(hex){
  return ('000000000' + hex).substr(-2);
}

function binaryStringToHexString(binaryString) {
  return parseInt(binaryString, 2).toString(16).toUpperCase();
}

function createLedMatrixBuffer(input) {
  const rowCount = 5;
  let bufferString = '';

  for (var i = 0; i < rowCount; i++) {
    const matrixRow = input.slice(rowCount * i, rowCount * (i + 1)).join('');
    const hex = binaryStringToHexString(matrixRow);

    bufferString += leadingZero(hex);
  }

  return new Buffer(bufferString, 'hex');
}

function clear() {
  return createLedMatrixBuffer([
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ]);
}

function drawArrow(direction) {
  const arrows = {
    left: [
      0, 0, 1, 0, 0,
      0, 1, 0, 0, 0,
      1, 1, 1, 1, 1,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
    ],
    right: [
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
      1, 1, 1, 1, 1,
      0, 0, 0, 1, 0,
      0, 0, 1, 0, 0,
    ]
  }

  return createLedMatrixBuffer(arrows[direction]);
}

function drawPattern() {
  return createLedMatrixBuffer([
    1, 0, 1, 0, 1,
    0, 1, 0, 1, 0,
    1, 0, 1, 0, 1,
    0, 1, 0, 1, 0,
    1, 0, 1, 0, 1,
  ]);
}

function drawProgess(amount) {
  const binaryArray = [];
  let ledsOn = amount;

  if (amount > MATRIX_SIZE) {
    ledsOn = MATRIX_SIZE;
  } else if (amount < 0) {
    ledsOn = 0;
  }

  for (var i = 0; i < MATRIX_SIZE; i++) {
    let ledState = 0;
    if (i < ledsOn) {
      ledState = 1;
    }
    binaryArray.push(ledState)
  }

  return createLedMatrixBuffer(binaryArray);
}

module.exports = {
  clear,
  drawArrow,
  drawPattern,
  drawProgess,
  MATRIX_SIZE
};
