// ====================================================================
// SONGO GAME - VERSION 1: LOCAL MULTIPLAYER (HOT-SEAT MODE)
// With ANIMATED DISTRIBUTION - Seeds move one by one slowly
// Cameroonian Traditional Board Game
// ====================================================================

class SongoGame {
    // Constructor - Initializes a new game
    constructor() {
        this.player1Pits = [5, 5, 5, 5, 5, 5, 5];
        this.player2Pits = [5, 5, 5, 5, 5, 5, 5];
        this.player1Store = 0;
        this.player2Store = 0;
        this.currentTurn = 1;
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.moveHistory = [];
    }

    validateMove(player, pitIndex) {
        if (this.gameOver) {
            return { valid: false, message: "La partie est déjà terminée!" };
        }
        
        if (player !== this.currentTurn) {
            return { valid: false, message: `Ce n'est pas votre tour! C'est au Joueur ${this.currentTurn} de jouer.` };
        }
        
        if (pitIndex < 0 || pitIndex > 6) {
            return { valid: false, message: "Case invalide!" };
        }
        
        const pits = (player === 1) ? this.player1Pits : this.player2Pits;
        
        if (pits[pitIndex] === 0) {
            return { valid: false, message: "Cette case est vide! Choisissez une case qui contient des graines." };
        }
        
        return { valid: true, message: "Coup valide" };
    }

    // Original makeMove (kept for reference - not used directly anymore)
    makeMoveOriginal(player, pitIndex) {
        const validation = this.validateMove(player, pitIndex);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const stateBefore = this.getState();
        
        let currentPits, opponentPits, currentStore, opponentStore;
        
        if (player === 1) {
            currentPits = [...this.player1Pits];
            opponentPits = [...this.player2Pits];
            currentStore = this.player1Store;
            opponentStore = this.player2Store;
        } else {
            currentPits = [...this.player2Pits];
            opponentPits = [...this.player1Pits];
            currentStore = this.player2Store;
            opponentStore = this.player1Store;
        }
        
        let seeds = currentPits[pitIndex];
        currentPits[pitIndex] = 0;
        
        let currentPit = pitIndex;
        let extraTurn = false;
        let seedsCaptured = 0;
        
        while (seeds > 0) {
            currentPit++;
            
            if (currentPit === 7) {
                currentStore++;
                seeds--;
                
                if (seeds === 0) {
                    extraTurn = true;
                }
                currentPit = -1;
                continue;
            }
            
            if (currentPit >= 0 && currentPit < 7) {
                opponentPits[currentPit]++;
                seeds--;
                
                if (seeds === 0 && opponentPits[currentPit] >= 2 && opponentPits[currentPit] <= 3) {
                    seedsCaptured = opponentPits[currentPit];
                    currentStore += seedsCaptured;
                    opponentPits[currentPit] = 0;
                }
            }
        }
        
        if (player === 1) {
            this.player1Pits = currentPits;
            this.player2Pits = opponentPits;
            this.player1Store = currentStore;
            this.player2Store = opponentStore;
        } else {
            this.player2Pits = currentPits;
            this.player1Pits = opponentPits;
            this.player2Store = currentStore;
            this.player1Store = opponentStore;
        }
        
        const gameEndCheck = this.checkGameEnd();
        
        if (gameEndCheck.gameOver) {
            this.gameOver = true;
            this.winner = gameEndCheck.winner;
        } else if (!extraTurn) {
            this.currentTurn = (this.currentTurn === 1) ? 2 : 1;
        }
        
        this.moveCount++;
        this.moveHistory.push({
            moveNumber: this.moveCount,
            player: player,
            pitIndex: pitIndex,
            seedsCaptured: seedsCaptured,
            extraTurn: extraTurn,
            stateBefore: stateBefore,
            timestamp: new Date()
        });
        
        return this.getState();
    }

    checkGameEnd() {
        const WIN_SCORE = 36;
        
        if (this.player1Store >= WIN_SCORE) {
            return { gameOver: true, winner: 1 };
        }
        
        if (this.player2Store >= WIN_SCORE) {
            return { gameOver: true, winner: 2 };
        }
        
        const player1HasSeeds = this.player1Pits.some(seeds => seeds > 0);
        const player2HasSeeds = this.player2Pits.some(seeds => seeds > 0);
        
        if (!player1HasSeeds) {
            const remainingSeeds = this.player2Pits.reduce((a, b) => a + b, 0);
            this.player2Store += remainingSeeds;
            this.player2Pits = [0, 0, 0, 0, 0, 0, 0];
            
            let winner = null;
            if (this.player1Store > this.player2Store) winner = 1;
            else if (this.player2Store > this.player1Store) winner = 2;
            
            return { gameOver: true, winner: winner };
        }
        
        if (!player2HasSeeds) {
            const remainingSeeds = this.player1Pits.reduce((a, b) => a + b, 0);
            this.player1Store += remainingSeeds;
            this.player1Pits = [0, 0, 0, 0, 0, 0, 0];
            
            let winner = null;
            if (this.player1Store > this.player2Store) winner = 1;
            else if (this.player2Store > this.player1Store) winner = 2;
            
            return { gameOver: true, winner: winner };
        }
        
        return { gameOver: false, winner: null };
    }

    getState() {
        return {
            player1Pits: [...this.player1Pits],
            player2Pits: [...this.player2Pits],
            player1Store: this.player1Store,
            player2Store: this.player2Store,
            currentTurn: this.currentTurn,
            gameOver: this.gameOver,
            winner: this.winner,
            moveCount: this.moveCount
        };
    }

    reset() {
        this.player1Pits = [5, 5, 5, 5, 5, 5, 5];
        this.player2Pits = [5, 5, 5, 5, 5, 5, 5];
        this.player1Store = 0;
        this.player2Store = 0;
        this.currentTurn = 1;
        this.gameOver = false;
        this.winner = null;
        this.moveCount = 0;
        this.moveHistory = [];
    }
}

// ====================================================================
// ANIMATION HELPER FUNCTIONS
// ====================================================================

/**
 * Delay function - creates a pause in the animation
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Disable all pits during animation to prevent interference
 */
function disableAllPits() {
    const allPits = document.querySelectorAll('.pit');
    allPits.forEach(pit => {
        pit.style.pointerEvents = 'none';
        pit.style.opacity = '0.6';
    });
}

/**
 * Re-enable all pits after animation
 */
function enableAllPits() {
    const allPits = document.querySelectorAll('.pit');
    allPits.forEach(pit => {
        pit.style.pointerEvents = 'auto';
        pit.style.opacity = '1';
    });
}

/**
 * Animate number counting from old value to new value
 */
async function animateNumberCount(element, from, to, duration) {
    const steps = 8;
    const stepTime = duration / steps;
    const increment = (to - from) / steps;
    
    for (let i = 1; i <= steps; i++) {
        const currentValue = Math.round(from + (increment * i));
        if (element) element.textContent = currentValue;
        await delay(stepTime);
    }
    if (element) element.textContent = to;
}

/**
 * Animate adding a seed to a pit
 */
async function animatePitAddition(isPlayer1, pitIndex, newValue) {
    const pitId = isPlayer1 ? `p1_${pitIndex}` : `p2_${pitIndex}`;
    const pitElement = document.getElementById(pitId);
    const pitDiv = pitElement ? pitElement.parentElement : null;
    
    if (pitDiv) {
        pitDiv.classList.add('pit-highlight');
        
        const oldValue = parseInt(pitElement.textContent);
        await animateNumberCount(pitElement, oldValue, newValue, 200);
        
        await delay(150);
        pitDiv.classList.remove('pit-highlight');
    } else if (pitElement) {
        pitElement.textContent = newValue;
    }
}

/**
 * Animate adding a seed to the store
 */
async function animateStoreAddition(isPlayer1, newValue) {
    const storeId = isPlayer1 ? 'storePlayer1Value' : 'storePlayer2Value';
    const storeElement = document.getElementById(storeId);
    const storeDiv = storeElement ? storeElement.closest('.store') : null;
    
    if (storeDiv) {
        storeDiv.classList.add('store-highlight');
        
        const oldValue = parseInt(storeElement.textContent);
        await animateNumberCount(storeElement, oldValue, newValue, 200);
        
        await delay(150);
        storeDiv.classList.remove('store-highlight');
    }
}

/**
 * Animate capture effect on a pit
 */
async function animateCapture(isPlayer1, pitIndex, capturedSeeds) {
    const pitId = isPlayer1 ? `p1_${pitIndex}` : `p2_${pitIndex}`;
    const pitElement = document.getElementById(pitId);
    const pitDiv = pitElement ? pitElement.parentElement : null;
    
    if (pitDiv) {
        pitDiv.classList.add('pit-capture');
        
        const captureText = document.createElement('div');
        captureText.className = 'capture-text';
        captureText.textContent = `+${capturedSeeds}`;
        pitDiv.style.position = 'relative';
        pitDiv.appendChild(captureText);
        
        await delay(500);
        captureText.remove();
        pitDiv.classList.remove('pit-capture');
    }
}

// ====================================================================
// ANIMATED MAKE MOVE - Seeds are distributed one by one with visual feedback
// ====================================================================

async function makeMoveAnimated(player, pitIndex) {
    // Validate the move
    const validation = game.validateMove(player, pitIndex);
    if (!validation.valid) {
        showMessage(validation.message);
        return false;
    }
    
    // Disable all pits during animation
    disableAllPits();
    
    // Save state before move
    const stateBefore = game.getState();
    
    // Get references to pits and stores
    let currentPits, opponentPits, currentStore, opponentStore;
    let isPlayer1 = (player === 1);
    
    if (isPlayer1) {
        currentPits = [...game.player1Pits];
        opponentPits = [...game.player2Pits];
        currentStore = game.player1Store;
        opponentStore = game.player2Store;
    } else {
        currentPits = [...game.player2Pits];
        opponentPits = [...game.player1Pits];
        currentStore = game.player2Store;
        opponentStore = game.player1Store;
    }
    
    // Get seeds from chosen pit
    let seeds = currentPits[pitIndex];
    currentPits[pitIndex] = 0;
    
    // Immediately update display to show pit emptied
    updateDisplay();
    await delay(300);
    
    let currentPit = pitIndex;
    let extraTurn = false;
    let seedsCaptured = 0;
    let capturePitIndex = -1;
    let capturePlayer = false;
    
    // ============================================================
    // ANIMATED DISTRIBUTION - Seeds move one by one slowly
    // Each seed is distributed with a visual delay
    // ============================================================
    for (let seedNumber = seeds; seedNumber > 0; seedNumber--) {
        currentPit++;
        
        // Check if we reach the store
        if (currentPit === 7) {
            currentStore++;
            await animateStoreAddition(isPlayer1, currentStore);
            
            if (seedNumber === 1) {
                extraTurn = true;
                showMessage("🎉 Dernière graine dans votre grande case! Vous rejouez!", 1500);
            }
            currentPit = -1;
            continue;
        }
        
        // Sow in opponent's pit
        if (currentPit >= 0 && currentPit < 7) {
            opponentPits[currentPit]++;
            
            await animatePitAddition(!isPlayer1, currentPit, opponentPits[currentPit]);
            
            // Check for capture on the LAST seed
            if (seedNumber === 1 && opponentPits[currentPit] >= 2 && opponentPits[currentPit] <= 3) {
                seedsCaptured = opponentPits[currentPit];
                capturePitIndex = currentPit;
                capturePlayer = !isPlayer1;
            }
        }
        
        // Delay between each seed (this makes the seeds move slowly!)
        await delay(450);
    }
    
    // Handle capture animation
    if (seedsCaptured > 0 && capturePitIndex !== -1) {
        await animateCapture(capturePlayer, capturePitIndex, seedsCaptured);
        currentStore += seedsCaptured;
        opponentPits[capturePitIndex] = 0;
        
        await animateStoreAddition(isPlayer1, currentStore);
        showMessage(`🎯 Capture! +${seedsCaptured} graines!`, 1000);
        await delay(500);
    }
    
    // Update game state
    if (isPlayer1) {
        game.player1Pits = currentPits;
        game.player2Pits = opponentPits;
        game.player1Store = currentStore;
        game.player2Store = opponentStore;
    } else {
        game.player2Pits = currentPits;
        game.player1Pits = opponentPits;
        game.player2Store = currentStore;
        game.player1Store = opponentStore;
    }
    
    // Record move in history
    game.moveCount++;
    game.moveHistory.push({
        moveNumber: game.moveCount,
        player: player,
        pitIndex: pitIndex,
        seedsCaptured: seedsCaptured,
        extraTurn: extraTurn,
        stateBefore: stateBefore,
        timestamp: new Date()
    });
    
    updateDisplay();
    
    // Check game end
    const gameEndCheck = game.checkGameEnd();
    
    if (gameEndCheck.gameOver) {
        game.gameOver = true;
        game.winner = gameEndCheck.winner;
        updateDisplay();
        await delay(500);
        handleGameOver(game.winner);
        enableAllPits();
        return true;
    }
    
    // Handle turn switching or extra turn
    if (!extraTurn) {
        game.currentTurn = (game.currentTurn === 1) ? 2 : 1;
        showMessage(`C'est au tour du Joueur ${game.currentTurn}`, 1000);
    } else {
        showMessage(`✨ Rejeu! Le Joueur ${player} rejoue!`, 1500);
    }
    
    updateDisplay();
    highlightCurrentPlayerPits();
    enableAllPits();
    
    return true;
}

// ====================================================================
// USER INTERFACE
// ====================================================================

// Game instance
let game = new SongoGame();
let boardElement, player1ScoreElement, player2ScoreElement, turnPlayerElement, resetBtn, gameOverModal, playAgainBtn, gameOverMessage, gameOverDetails;

document.addEventListener('DOMContentLoaded', () => {
    boardElement = document.getElementById('board');
    player1ScoreElement = document.getElementById('player1Score');
    player2ScoreElement = document.getElementById('player2Score');
    turnPlayerElement = document.getElementById('turnPlayer');
    resetBtn = document.getElementById('resetGameBtn');
    gameOverModal = document.getElementById('gameOverModal');
    playAgainBtn = document.getElementById('playAgainBtn');
    gameOverMessage = document.getElementById('gameOverMessage');
    gameOverDetails = document.getElementById('gameOverDetails');
    
    createBoard();
    updateDisplay();
    
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', () => {
        gameOverModal.classList.remove('show');
        resetGame();
    });
});

function createBoard() {
    boardElement.innerHTML = '';
    
    const storeLeft = document.createElement('div');
    storeLeft.className = 'store store-left';
    storeLeft.id = 'storePlayer2';
    storeLeft.innerHTML = `<div class="store-label">GRANDE CASE</div><div class="store-value" id="storePlayer2Value">0</div><div class="store-label">JOUEUR 2</div>`;
    
    const pitsContainer = document.createElement('div');
    pitsContainer.className = 'pits-container';
    
    const player2PitsDiv = document.createElement('div');
    player2PitsDiv.className = 'player2-pits';
    player2PitsDiv.id = 'player2Pits';
    
    const player1PitsDiv = document.createElement('div');
    player1PitsDiv.className = 'player1-pits';
    player1PitsDiv.id = 'player1Pits';
    
    for (let i = 0; i < 7; i++) {
        const pit2 = document.createElement('div');
        pit2.className = 'pit';
        pit2.dataset.player = '2';
        pit2.dataset.index = i;
        pit2.innerHTML = `<div class="seed-count" id="p2_${i}">5</div><div class="pit-index">${i + 1}</div>`;
        pit2.addEventListener('click', () => onPitClick(2, i));
        player2PitsDiv.appendChild(pit2);
        
        const pit1 = document.createElement('div');
        pit1.className = 'pit';
        pit1.dataset.player = '1';
        pit1.dataset.index = i;
        pit1.innerHTML = `<div class="seed-count" id="p1_${i}">5</div><div class="pit-index">${i + 1}</div>`;
        pit1.addEventListener('click', () => onPitClick(1, i));
        player1PitsDiv.appendChild(pit1);
    }
    
    pitsContainer.appendChild(player2PitsDiv);
    pitsContainer.appendChild(player1PitsDiv);
    
    const storeRight = document.createElement('div');
    storeRight.className = 'store store-right';
    storeRight.id = 'storePlayer1';
    storeRight.innerHTML = `<div class="store-label">GRANDE CASE</div><div class="store-value" id="storePlayer1Value">0</div><div class="store-label">JOUEUR 1</div>`;
    
    boardElement.appendChild(storeLeft);
    boardElement.appendChild(pitsContainer);
    boardElement.appendChild(storeRight);
}

/**
 * ON PIT CLICK - Uses animated distribution (seeds move one by one slowly)
 */
async function onPitClick(player, pitIndex) {
    if (game.gameOver) {
        showMessage("La partie est terminée! Cliquez sur 'Nouvelle partie' pour rejouer.");
        return;
    }
    
    if (player !== game.currentTurn) {
        showMessage(`Ce n'est pas votre tour! C'est au Joueur ${game.currentTurn} de jouer.`);
        return;
    }
    
    // Call the ANIMATED makeMove function
    await makeMoveAnimated(player, pitIndex);
}

function updateDisplay() {
    const state = game.getState();
    
    document.getElementById('player1Score').textContent = state.player1Store;
    document.getElementById('player2Score').textContent = state.player2Store;
    
    const store1El = document.getElementById('storePlayer1Value');
    const store2El = document.getElementById('storePlayer2Value');
    if (store1El) store1El.textContent = state.player1Store;
    if (store2El) store2El.textContent = state.player2Store;
    
    for (let i = 0; i < 7; i++) {
        const pit1El = document.getElementById(`p1_${i}`);
        const pit2El = document.getElementById(`p2_${i}`);
        if (pit1El) pit1El.textContent = state.player1Pits[i];
        if (pit2El) pit2El.textContent = state.player2Pits[i];
    }
    
    turnPlayerElement.textContent = `Joueur ${state.currentTurn}`;
    highlightCurrentPlayerPits();
}

function highlightCurrentPlayerPits() {
    const allPits = document.querySelectorAll('.pit');
    allPits.forEach(pit => pit.classList.remove('active-turn'));
    
    const currentPlayer = game.currentTurn;
    const pitsSelector = currentPlayer === 1 ? '#player1Pits .pit' : '#player2Pits .pit';
    const currentPlayerPits = document.querySelectorAll(pitsSelector);
    currentPlayerPits.forEach(pit => pit.classList.add('active-turn'));
    
    const player1Div = document.getElementById('player1');
    const player2Div = document.getElementById('player2');
    
    if (currentPlayer === 1) {
        player1Div.classList.add('player-highlight');
        player2Div.classList.remove('player-highlight');
    } else {
        player2Div.classList.add('player-highlight');
        player1Div.classList.remove('player-highlight');
    }
}

function handleGameOver(winner) {
    const state = game.getState();
    
    if (winner === 1) {
        gameOverMessage.innerHTML = "🏆 VICTOIRE ! 🏆";
        gameOverDetails.innerHTML = `Félicitations au Joueur 1!<br>Score final: ${state.player1Store} - ${state.player2Store}`;
    } else if (winner === 2) {
        gameOverMessage.innerHTML = "🏆 VICTOIRE ! 🏆";
        gameOverDetails.innerHTML = `Félicitations au Joueur 2!<br>Score final: ${state.player2Store} - ${state.player1Store}`;
    } else {
        gameOverMessage.innerHTML = "🤝 MATCH NUL 🤝";
        gameOverDetails.innerHTML = `Les deux joueurs terminent avec ${state.player1Store} graines chacun.`;
    }
    
    gameOverModal.classList.add('show');
}

function resetGame() {
    game.reset();
    updateDisplay();
    highlightCurrentPlayerPits();
    showMessage("🔄 Nouvelle partie! Le Joueur 1 commence.", 2000);
}

let messageTimeout;
function showMessage(message, duration = 3000) {
    let messageEl = document.getElementById('tempMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'tempMessage';
        messageEl.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:#ffd700;padding:12px 24px;border-radius:40px;font-size:0.9rem;font-weight:500;z-index:1000;backdrop-filter:blur(10px);border:1px solid #ffd700;pointer-events:none;white-space:nowrap;`;
        document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        messageEl.style.display = 'none';
    }, duration);
}