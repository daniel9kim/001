// game.js

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];

// 캔버스를 화면 크기에 맞게 조정
function resizeCanvas() {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = canvasSize;
    canvas.height = canvasSize * 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 나머지 기존 코드...

// generate a new tetromino sequence
function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
        const rand = Math.floor(Math.random() * sequence.length);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// 나머지 기존 코드...

// 터치 컨트롤 이벤트 추가
document.getElementById('left').addEventListener('click', () => moveTetromino(-1));
document.getElementById('right').addEventListener('click', () => moveTetromino(1));
document.getElementById('rotate').addEventListener('click', rotateTetromino);
document.getElementById('down').addEventListener('click', dropTetromino);

function moveTetromino(direction) {
    const col = tetromino.col + direction;

    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
    }
}

function rotateTetromino() {
    const matrix = rotate(tetromino.matrix);

    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
    }
}

function dropTetromino() {
    const row = tetromino.row + 1;

    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
        return;
    }

    tetromino.row = row;
}

// 나머지 기존 코드...

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
