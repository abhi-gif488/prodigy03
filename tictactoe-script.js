// Game State
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let gameMode = null; // 'pvp' or 'ai'
let aiDifficulty = null; // 'easy', 'medium', 'hard'
let scores = {
    X: 0,
    O: 0,
    draw: 0
};

// Winning Combinations
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// DOM Elements
const modeSelection = document.getElementById('modeSelection');
const difficultySelection = document.getElementById('difficultySelection');
const gameContainer = document.getElementById('gameContainer');
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turnIndicator');
const turnText = document.getElementById('turnText');
const resultModal = document.getElementById('resultModal');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const playerOName = document.getElementById('playerOName');

// Score Elements
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const scoreDrawElement = document.getElementById('scoreDraw');

// Buttons
const pvpModeBtn = document.getElementById('pvpMode');
const aiModeBtn = document.getElementById('aiMode');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const backToModeBtn = document.getElementById('backToMode');
const restartBtn = document.getElementById('restartBtn');
const resetBtn = document.getElementById('resetBtn');
const menuBtn = document.getElementById('menuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtnModal = document.getElementById('menuBtnModal');

// Event Listeners - Mode Selection
pvpModeBtn.addEventListener('click', () => {
    gameMode = 'pvp';
    playerOName.textContent = 'Player O';
    showGameBoard();
});

aiModeBtn.addEventListener('click', () => {
    gameMode = 'ai';
    showDifficultySelection();
});

// Event Listeners - Difficulty Selection
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        aiDifficulty = btn.dataset.difficulty;
        playerOName.textContent = `AI (${aiDifficulty})`;
        showGameBoard();
    });
});

backToModeBtn.addEventListener('click', () => {
    difficultySelection.classList.add('hidden');
    modeSelection.classList.remove('hidden');
});

// Event Listeners - Game Controls
restartBtn.addEventListener('click', restartGame);
resetBtn.addEventListener('click', resetScores);
menuBtn.addEventListener('click', backToMenu);
playAgainBtn.addEventListener('click', playAgain);
menuBtnModal.addEventListener('click', backToMenu);

// Event Listeners - Board Cells
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Show/Hide Functions
function showDifficultySelection() {
    modeSelection.classList.add('hidden');
    difficultySelection.classList.remove('hidden');
}

function showGameBoard() {
    modeSelection.classList.add('hidden');
    difficultySelection.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initGame();
}

function backToMenu() {
    gameContainer.classList.add('hidden');
    resultModal.classList.add('hidden');
    modeSelection.classList.remove('hidden');
    difficultySelection.classList.add('hidden');
    gameMode = null;
    aiDifficulty = null;
}

// Initialize Game
function initGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
    
    updateTurnIndicator();
    updateScoreboard();
}

// Handle Cell Click
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.dataset.index);
    
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }
    
    makeMove(cellIndex, currentPlayer);
    
    // Check for win or draw
    if (checkWin(currentPlayer)) {
        endGame(currentPlayer);
        return;
    }
    
    if (checkDraw()) {
        endGame('draw');
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    
    // AI turn
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        gameActive = false; // Prevent multiple moves
        setTimeout(() => {
            makeAIMove();
            gameActive = true;
            
            if (checkWin('O')) {
                endGame('O');
                return;
            }
            
            if (checkDraw()) {
                endGame('draw');
                return;
            }
            
            currentPlayer = 'X';
            updateTurnIndicator();
        }, 500);
    }
}

// Make Move
function makeMove(index, player) {
    gameBoard[index] = player;
    const cell = cells[index];
    
    if (player === 'X') {
        cell.innerHTML = '<i class="fas fa-times"></i>';
        cell.classList.add('x');
    } else {
        cell.innerHTML = '<i class="fas fa-circle"></i>';
        cell.classList.add('o');
    }
}

// AI Move Logic
function makeAIMove() {
    let move;
    
    if (aiDifficulty === 'easy') {
        move = getRandomMove();
    } else if (aiDifficulty === 'medium') {
        // 50% optimal, 50% random
        move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
    } else {
        // Hard - always optimal
        move = getBestMove();
    }
    
    makeMove(move, 'O');
}

// Get Random Move
function getRandomMove() {
    const availableMoves = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Get Best Move (Minimax Algorithm)
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = 0;
    
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax Algorithm
function minimax(board, depth, isMaximizing) {
    // Check for terminal states
    if (checkWinForMinimax('O')) return 10 - depth;
    if (checkWinForMinimax('X')) return depth - 10;
    if (checkDrawForMinimax()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check Win
function checkWin(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => gameBoard[index] === player);
    });
}

// Check Win for Minimax
function checkWinForMinimax(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => gameBoard[index] === player);
    });
}

// Check Draw
function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

// Check Draw for Minimax
function checkDrawForMinimax() {
    return gameBoard.every(cell => cell !== '');
}

// End Game
function endGame(winner) {
    gameActive = false;
    
    if (winner === 'draw') {
        scores.draw++;
        showResultModal('draw');
    } else {
        scores[winner]++;
        highlightWinningCells(winner);
        showResultModal(winner);
    }
    
    updateScoreboard();
}

// Highlight Winning Cells
function highlightWinningCells(player) {
    winningCombinations.forEach(combination => {
        if (combination.every(index => gameBoard[index] === player)) {
            combination.forEach(index => {
                cells[index].classList.add('winning');
            });
        }
    });
}

// Show Result Modal
function showResultModal(winner) {
    setTimeout(() => {
        resultModal.classList.remove('hidden');
        
        if (winner === 'draw') {
            resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            resultIcon.className = 'result-icon draw';
            resultTitle.textContent = "It's a Draw!";
            resultMessage.textContent = "Well played! No one wins this round.";
        } else {
            resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            resultIcon.className = 'result-icon win';
            
            if (winner === 'X') {
                resultTitle.textContent = 'Player X Wins!';
                resultMessage.textContent = 'Congratulations! You got three in a row!';
            } else {
                if (gameMode === 'ai') {
                    resultTitle.textContent = 'AI Wins!';
                    resultMessage.textContent = 'The AI beat you this time. Try again!';
                } else {
                    resultTitle.textContent = 'Player O Wins!';
                    resultMessage.textContent = 'Congratulations! You got three in a row!';
                }
            }
        }
    }, 800);
}

// Update Turn Indicator
function updateTurnIndicator() {
    if (currentPlayer === 'X') {
        turnIndicator.innerHTML = '<i class="fas fa-times"></i><span id="turnText">Player X\'s Turn</span>';
        turnIndicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else {
        const playerName = gameMode === 'ai' ? 'AI' : 'Player O';
        turnIndicator.innerHTML = `<i class="fas fa-circle"></i><span id="turnText">${playerName}'s Turn</span>`;
        turnIndicator.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }
}

// Update Scoreboard
function updateScoreboard() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
    scoreDrawElement.textContent = scores.draw;
    
    // Animate score update
    [scoreXElement, scoreOElement, scoreDrawElement].forEach(el => {
        el.style.transform = 'scale(1.2)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    });
}

// Restart Game
function restartGame() {
    initGame();
}

// Reset Scores
function resetScores() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreboard();
    restartGame();
}

// Play Again
function playAgain() {
    resultModal.classList.add('hidden');
    initGame();
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    const keyMap = {
        '1': 0, '2': 1, '3': 2,
        '4': 3, '5': 4, '6': 5,
        '7': 6, '8': 7, '9': 8
    };
    
    const cellIndex = keyMap[e.key];
    
    if (cellIndex !== undefined && gameBoard[cellIndex] === '' && currentPlayer === 'X') {
        handleCellClick({ target: cells[cellIndex] });
    }
    
    // R for restart
    if (e.key.toLowerCase() === 'r') {
        restartGame();
    }
});

// Add hover effect preview
cells.forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
        const cellIndex = parseInt(e.target.dataset.index);
        
        if (gameBoard[cellIndex] === '' && gameActive && currentPlayer === 'X') {
            if (currentPlayer === 'X') {
                e.target.style.opacity = '0.5';
                e.target.innerHTML = '<i class="fas fa-times"></i>';
            }
        }
    });
    
    cell.addEventListener('mouseleave', (e) => {
        const cellIndex = parseInt(e.target.dataset.index);
        
        if (gameBoard[cellIndex] === '') {
            e.target.style.opacity = '1';
            e.target.innerHTML = '';
        }
    });
});

// Add celebration confetti effect (optional)
function celebrateWin() {
    // You can add a confetti library here for a celebration effect
    console.log('🎉 Winner!');
}

// Add sound effects (optional - requires audio files)
function playSound(type) {
    // You can add sound effects here
    // const audio = new Audio(`sounds/${type}.mp3`);
    // audio.play();
}

// Initialize
console.log('🎮 Tic-Tac-Toe game initialized!');
console.log('💡 Tip: Use number keys 1-9 to place X marks!');
console.log('💡 Tip: Press R to restart the game!');
