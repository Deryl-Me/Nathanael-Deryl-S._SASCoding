// --- KONFIGURASI GAME ---

const CONFIG_NORMAL = {
    MISSILE_SPEEDS: [2.5, 3.5, 5.0], // Ronde 1, 2, 3
    NUM_SIMULTANEOUS_MISSILES: 3,     // 3 Misil sekaligus
};

const CONFIG_HARD = {
    MISSILE_SPEEDS: [3.5, 5.0, 6.0], // Kecepatan Tinggi
    NUM_SIMULTANEOUS_MISSILES: 4,     // 4 Misil sekaligus
};

const GLOBAL_CONFIG = {
    PLAYER_SPEED: 25, 
    MISSILE_INTERVAL: 800, 
    ROUND_DURATION: 15, 
    TOTAL_ROUNDS: 3,
};

// Variabel Game State
let currentRound = 1;
let gameActive = false;
let roundTimer = 0;
let countdownInterval;
let missileInterval;
let gameLoopInterval;
let currentConfig = CONFIG_NORMAL; 


// Elemen DOM
const player = document.getElementById('player');
const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('start-button');
const hardModeButton = document.getElementById('hard-mode-button'); 
const messageArea = document.getElementById('message-area');
const gameMessage = document.getElementById('game-message');
const roundDisplay = document.getElementById('round-display');
const statusDisplay = document.getElementById('status-display');
const timerDisplay = document.getElementById('timer-display');
const modeButtonsDiv = document.getElementById('mode-buttons'); // Ambil div mode buttons

// Posisi Launcher (8 posisi)
const launcherElements = [
    document.getElementById('launcher-1'), document.getElementById('launcher-2'), 
    document.getElementById('launcher-3'), document.getElementById('launcher-4'),
    document.getElementById('launcher-5'), document.getElementById('launcher-6'), 
    document.getElementById('launcher-7'), document.getElementById('launcher-8'), 
];

const launcherPositions = launcherElements
    .filter(launcher => launcher)
    .map(launcher => 
        launcher.offsetLeft + (launcher.offsetWidth / 2)
    );

// --- Fungsi Utama Game ---

/** Mengatur ulang semua variabel dan UI game ke kondisi awal. */
function resetGame() {
    gameActive = false;
    currentRound = 1;
    roundTimer = 0;
    
    // Tampilkan semua tombol mode saat game reset
    startButton.style.display = 'inline-block';
    hardModeButton.style.display = 'inline-block';
    modeButtonsDiv.style.display = 'flex'; // Pastikan container tombol terlihat

    gameMessage.textContent = 'Pilih Mode Permainan';
    
    roundDisplay.textContent = `${currentRound} / ${GLOBAL_CONFIG.TOTAL_ROUNDS}`;
    timerDisplay.textContent = roundTimer;
    statusDisplay.textContent = 'Siap';
    statusDisplay.classList.remove('danger', 'safe');
    
    document.querySelectorAll('.missile').forEach(m => m.remove());
    
    player.style.left = `${(gameBoard.offsetWidth / 2) - (player.offsetWidth / 2)}px`;
    
    startButton.textContent = 'Mulai Game (Normal)';
}

/** Memulai ronde baru berdasarkan konfigurasi yang dipilih. */
function startRound(config) {
    currentConfig = config; 
    
    gameActive = true;
    roundTimer = 0;
    
    // ⬅️ PERBAIKAN: Sembunyikan messageArea, bukan tombolnya secara individual
    messageArea.classList.add('hidden'); 
    
    statusDisplay.textContent = 'Menghindar!';
    statusDisplay.classList.add('safe');
    statusDisplay.classList.remove('danger');
    
    roundDisplay.textContent = `${currentRound} / ${GLOBAL_CONFIG.TOTAL_ROUNDS}`;

    // Timer Ronde
    countdownInterval = setInterval(() => {
        roundTimer++;
        timerDisplay.textContent = roundTimer;

        if (roundTimer >= GLOBAL_CONFIG.ROUND_DURATION) {
            endRound(true); 
        }
    }, 1000);

    // Penembakan Misil
    missileInterval = setInterval(shootMissile, GLOBAL_CONFIG.MISSILE_INTERVAL);

    // Game Loop
    gameLoopInterval = requestAnimationFrame(gameLoop);
}

/** Mengakhiri ronde. */
function endRound(success) {
    gameActive = false;
    clearInterval(countdownInterval);
    clearInterval(missileInterval);
    cancelAnimationFrame(gameLoopInterval);

    // ⬅️ messageArea ditampilkan kembali, memperlihatkan tombol di dalamnya
    messageArea.classList.remove('hidden'); 
    
    // Tombol Mode Sulit selalu disembunyikan setelah game dimulai/berakhir
    hardModeButton.style.display = 'none';

    if (success) {
        if (currentRound < GLOBAL_CONFIG.TOTAL_ROUNDS) {
            document.querySelectorAll('.missile').forEach(m => m.remove());
            
            const nextRound = currentRound + 1;
            const nextSpeed = currentConfig.MISSILE_SPEEDS[currentRound]; 
            
            gameMessage.innerHTML = `**Ronde ${currentRound} BERHASIL!**<br>Bersiap untuk Ronde ${nextRound}. <br> Kecepatan Misil Selanjutnya: **${nextSpeed.toFixed(1)}**`;
            
            currentRound = nextRound;
            // ⬅️ Tombol 'Lanjut Ronde' tetap terlihat karena hanya hardModeButton yang disembunyikan
            startButton.style.display = 'inline-block';
            startButton.textContent = 'Lanjut Ronde';
            
        } else {
            const modeName = currentConfig === CONFIG_HARD ? 'SULIT 🔥' : 'NORMAL';
            gameMessage.innerHTML = `🎉 **SELAMAT! ANDA BERHASIL MENGHINDARI 3 RONDE (${modeName})!** 🎉`;
            startButton.textContent = 'Main Lagi';
            resetGame(); // resetGame akan menampilkan semua tombol
            return;
        }
    } else {
        statusDisplay.textContent = 'Tertembak!';
        statusDisplay.classList.add('danger');
        statusDisplay.classList.remove('safe');
        gameMessage.innerHTML = `💥 **ANDA TERTEMBAK!** Game Berakhir di Ronde ${currentRound}.`;
        startButton.textContent = 'Coba Lagi';
        resetGame(); // resetGame akan menampilkan semua tombol
        return;
    }
}

/** Membuat dan meluncurkan N misil (3 atau 4) dari penembak acak. */
function shootMissile() {
    const numMissiles = currentConfig.NUM_SIMULTANEOUS_MISSILES;
    
    const actualMissilesToShoot = Math.min(numMissiles, launcherPositions.length);
    let availablePositions = [...launcherPositions];
    
    for (let i = 0; i < actualMissilesToShoot; i++) {
        
        const randomAvailableIndex = Math.floor(Math.random() * availablePositions.length);
        const launcherX = availablePositions[randomAvailableIndex];
        
        const missile = document.createElement('div');
        missile.classList.add('missile');
        missile.style.left = `${launcherX}px`;
        missile.style.top = `15px`; 
        missile.dataset.y = 15; 

        gameBoard.appendChild(missile);

        availablePositions.splice(randomAvailableIndex, 1);
    }
}

/** Game Loop utama untuk animasi dan deteksi tabrakan. */
function gameLoop() {
    if (!gameActive) return;

    const currentSpeedIndex = currentRound - 1;
    const currentMissileSpeed = currentConfig.MISSILE_SPEEDS[currentSpeedIndex];

    if (typeof currentMissileSpeed === 'undefined') {
        console.error(`Kecepatan misil tidak terdefinisi untuk Ronde ${currentRound}.`);
        return;
    }
    
    const missiles = document.querySelectorAll('.missile');
    const boardHeight = gameBoard.offsetHeight;

    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        
        if (checkCollision(player, missile)) {
            endRound(false); 
            return;
        }
        
        let y = parseFloat(missile.dataset.y) + currentMissileSpeed;
        missile.dataset.y = y;
        missile.style.top = `${y}px`;

        if (y > boardHeight) {
            missile.remove();
        }
    }

    if (gameActive) {
        gameLoopInterval = requestAnimationFrame(gameLoop);
    }
}

/** Cek tabrakan antara dua elemen. */
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const boardRect = gameBoard.getBoundingClientRect();
    
    const pX = rect1.left - boardRect.left;
    const pY = rect1.top - boardRect.top;
    const pW = rect1.width;
    const pH = rect1.height;
    
    const mX = rect2.left - boardRect.left;
    const mY = rect2.top - boardRect.top;
    const mW = rect2.width;
    const mH = rect2.height;

    const tolerance = 5; 
    
    return (
        pX + tolerance < mX + mW - tolerance &&
        pX + pW - tolerance > mX + tolerance &&
        pY + tolerance < mY + mH - tolerance &&
        pY + pH - tolerance > mY + tolerance
    );
}

/** Pindahkan pemain ke kiri atau kanan. */
function movePlayer(direction) {
    if (!gameActive) return;

    const boardWidth = gameBoard.offsetWidth;
    const playerWidth = player.offsetWidth;
    let currentX = player.offsetLeft; 
    
    let newX;
    if (direction === 'left') {
        newX = currentX - GLOBAL_CONFIG.PLAYER_SPEED;
    } else if (direction === 'right') {
        newX = currentX + GLOBAL_CONFIG.PLAYER_SPEED;
    }

    newX = Math.max(0, newX);
    newX = Math.min(boardWidth - playerWidth, newX);
    
    player.style.left = `${newX}px`;
}


// --- Event Listener ---

// Mode Normal (Melanjutkan Ronde)
startButton.addEventListener('click', () => {
    // Jika currentRound > 1, ini berarti tombol 'Lanjut Ronde'
    if (currentRound > 1 && gameActive === false) {
        startRound(currentConfig); // Lanjutkan dengan konfigurasi mode yang sama
    } 
    // Jika currentRound == 1, ini berarti tombol 'Mulai Game'
    else if (currentRound === 1 && gameActive === false) {
        startRound(CONFIG_NORMAL);
    }
});

// Mode Sulit
hardModeButton.addEventListener('click', () => {
    // Mode sulit selalu memulai dari Ronde 1
    currentRound = 1; 
    startRound(CONFIG_HARD);
});


gameBoard.addEventListener('click', (event) => {
    if (gameActive && event.target === gameBoard) {
        const boardRect = gameBoard.getBoundingClientRect();
        const clickX = event.clientX - boardRect.left;
        const boardCenter = boardRect.width / 2;

        if (clickX < boardCenter) {
            movePlayer('left');
        } else {
            movePlayer('right');
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (gameActive) {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
            movePlayer('left');
        } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
            movePlayer('right');
        }
    }
});


// Inisialisasi awal saat halaman dimuat
resetGame();