// game.js

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];

// Keep track of what is in every cell of the game using a 2d array
// tetris playfield is 10x20, with a few rows offscreen
const playfield = [];

// populate the empty state
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// colors for each tetromino
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

// the tetrominos shapes and rotations
const tetrominos = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

// generate a new tetromino sequence
function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
        const rand = Math.floor(Math.random() * sequence.length);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// get the next tetromino
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    return {
        name: name,
        matrix: matrix,
        row: 0,
        col: col
    };
}

// rotate the matrix 90 degrees
function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );

    return result;
}

// check to see if the new matrix/row/col is valid
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }

    return true;
}

// place the tetromino on the playfield
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {

                if (tetromino.row + row < 0) {
                    return showGameOver();
                }

                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    for (let row = playfield.length - 1; row >= 0;) {
        if (playfield[row].every(cell => !!cell)) {

            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r-1][c];
                }
            }
        }
        else {
            row--;
        }
    }

    tetromino = getNextTetromino();
}

// show the game over screen
function showGameOver() {
    cancelAnimationFrame(rAF);
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;

function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);

    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];

                context.fillRect(col * grid, row * grid, grid-1, grid-1);
            }
        }
    }

    if (tetromino) {
        if (++count > 35) {
            tetromino.row++;
            count = 0;

            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {

                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
                }
            }
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37
            ? tetromino.col - 1
            : tetromino.col + 1;

        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }

    if (e.which === 38) {
        const matrix = rotate(tetromino.matrix);

        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }

    if (e.which === 40) {
        const row = tetromino.row + 1;

        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row--;
            placeTetromino();
            return;
        }

        tetromino.row = row;
    }
});

rAF = requestAnimationFrame(loop);
