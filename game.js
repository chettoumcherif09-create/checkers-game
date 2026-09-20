// ==========================================
//  ♟️ لعبة الدامة - الجزء 1: العناصر
// ==========================================

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const turnIndicator = document.getElementById('turn-indicator');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const winnerText = document.getElementById('winnerText');
const statsText = document.getElementById('statsText');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const startScreen = document.getElementById('startScreen');
const btnPvP = document.getElementById('btnPvP');
const btnPvAI = document.getElementById('btnPvAI');
const aiOptions = document.getElementById('aiOptions');
const btnEasy = document.getElementById('btnEasy');
const btnMedium = document.getElementById('btnMedium');
const btnHard = document.getElementById('btnHard');

const redTimeEl = document.querySelector('#redTime strong');
const blackTimeEl = document.querySelector('#blackTime strong');
const redTimeBox = document.getElementById('redTime');
const blackTimeBox = document.getElementById('blackTime');

const themeBtn = document.getElementById('themeBtn');
const themePicker = document.getElementById('themePicker');
const themeOptions = document.querySelectorAll('.theme-option');

const undoBtn = document.getElementById('undoBtn');
const statsBtn = document.getElementById('statsBtn');
const statsOverlay = document.getElementById('statsOverlay');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const statMoves = document.getElementById('statMoves');
const statCaptures = document.getElementById('statCaptures');
const statPromotions = document.getElementById('statPromotions');
const statTime = document.getElementById('statTime');
const statRed = document.getElementById('statRed');
const statBlack = document.getElementById('statBlack');

const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');

const langBtn = document.getElementById('langBtn');
const btnContinue = document.getElementById('btnContinue');

const txtTitle = document.getElementById('txtTitle');
const txtChooseMode = document.getElementById('txtChooseMode');
const txtDifficulty = document.getElementById('txtDifficulty');
const txtTopTitle = document.getElementById('txtTopTitle');
const txtThemeTitle = document.getElementById('txtThemeTitle');
const txtSettings = document.getElementById('txtSettings');
const txtSound = document.getElementById('txtSound');
const txtVibration = document.getElementById('txtVibration');
const txtStats = document.getElementById('txtStats');
const txtMoves = document.getElementById('txtMoves');
const txtCaptures = document.getElementById('txtCaptures');
const txtPromotions = document.getElementById('txtPromotions');
const txtTimeStat = document.getElementById('txtTimeStat');
const txtRedStat = document.getElementById('txtRedStat');
const txtBlackStat = document.getElementById('txtBlackStat');
// ==========================================
//  ♟️ الجزء 2: المتغيرات
// ==========================================

const BOARD_SIZE = 8;
let CELL_SIZE = 50;
let BOARD_PX = 400;

const COLORS = {
  lightSquare: '#f0d9b5',
  darkSquare:  '#b58863',
  selectGlow:  '#ffd700',
  validMove:   'rgba(76, 175, 80, 0.5)',
  validMoveBorder: '#2e7d32',
  captureMove: 'rgba(244, 67, 54, 0.6)',
  captureBorder: '#b71c1c'
};

const PIECE = { EMPTY: 0, RED: 1, BLACK: 2, RED_KING: 3, BLACK_KING: 4 };

let board = [];
let currentTurn = PIECE.RED;
let selectedPiece = null;
let validMoves = [];
let isMultiCapture = false;
let gameEnded = false;

let gameMode = 'PVP';
let aiLevel = 'easy';
let aiColor = PIECE.BLACK;
let aiThinking = false;

let animation = null;

let audioCtx = null;
let soundEnabled = true;

let timePerPlayer = 300;
let redTimeLeft = 300;
let blackTimeLeft = 300;
let timerInterval = null;
let timerRunning = false;

let currentTheme = 'wood';

let moveHistory = [];
let undoLocked = false;

let statsMoves = 0;
let statsCaptures = 0;
let statsPromotions = 0;
let statsStartTime = null;

let currentLang = 'ar';

const SAVE_KEY = 'checkersSavedGame';
// ==========================================
//  ♟️ الجزء 3: الأصوات + الاهتزاز
// ==========================================

function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { soundEnabled = false; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, duration, type, volume) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume || 0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

let vibrationEnabled = true;

function vibrate(pattern) {
  if (!vibrationEnabled) return;
  if (!navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch (e) {}
}

function vibrateSelect() { vibrate(10); }
function vibrateMove() { vibrate(20); }
function vibrateCapture() { vibrate(50); }
function vibratePromotion() { vibrate([30, 50, 30]); }
function vibrateWin() { vibrate([100, 50, 100, 50, 200]); }
function vibrateError() { vibrate([30, 30, 30]); }

function playSelectSound() {
  playTone(660, 0.05, 'sine', 0.1);
  vibrateSelect();
}

function playMoveSound() {
  playTone(440, 0.08, 'sine', 0.15);
  vibrateMove();
}

function playCaptureSound() {
  playTone(880, 0.08, 'square', 0.12);
  setTimeout(function() { playTone(1200, 0.1, 'square', 0.1); }, 60);
  vibrateCapture();
}

function playPromotionSound() {
  playTone(523, 0.12, 'sine', 0.15);
  setTimeout(function() { playTone(659, 0.12, 'sine', 0.15); }, 100);
  setTimeout(function() { playTone(784, 0.12, 'sine', 0.15); }, 200);
  setTimeout(function() { playTone(1046, 0.25, 'sine', 0.18); }, 300);
  vibratePromotion();
}

function playWinSound() {
  const notes = [523, 659, 784, 1046, 1318];
  notes.forEach(function(freq, i) {
    setTimeout(function() { playTone(freq, 0.2, 'triangle', 0.18); }, i * 150);
  });
  vibrateWin();
}

function playErrorSound() {
  playTone(200, 0.15, 'sawtooth', 0.1);
  vibrateError();
}
// ==========================================
//  ♟️ الجزء 4: الساعة + Undo + Stats + Save + Lang
// ==========================================

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function updateTimeDisplay() {
  redTimeEl.textContent = formatTime(redTimeLeft);
  blackTimeEl.textContent = formatTime(blackTimeLeft);

  if (currentTurn === PIECE.RED && !gameEnded) {
    redTimeBox.classList.add('active');
    blackTimeBox.classList.remove('active');
  } else if (currentTurn === PIECE.BLACK && !gameEnded) {
    blackTimeBox.classList.add('active');
    redTimeBox.classList.remove('active');
  } else {
    redTimeBox.classList.remove('active');
    blackTimeBox.classList.remove('active');
  }

  updateWarning(redTimeBox, redTimeLeft);
  updateWarning(blackTimeBox, blackTimeLeft);
}

function updateWarning(el, time) {
  el.classList.remove('warning', 'danger');
  if (time <= 30 && time > 10) el.classList.add('warning');
  else if (time <= 10) el.classList.add('danger');
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;

  timerInterval = setInterval(function() {
    if (gameEnded) { stopTimer(); return; }

    if (currentTurn === PIECE.RED) {
      redTimeLeft--;
      if (redTimeLeft <= 0) {
        redTimeLeft = 0;
        updateTimeDisplay();
        return timeOut('BLACK');
      }
    } else {
      blackTimeLeft--;
      if (blackTimeLeft <= 0) {
        blackTimeLeft = 0;
        updateTimeDisplay();
        return timeOut('RED');
      }
    }
    updateTimeDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRunning = false;
}

function resetTimer() {
  redTimeLeft = timePerPlayer;
  blackTimeLeft = timePerPlayer;
  updateTimeDisplay();
}

function timeOut(winner) {
  gameEnded = true;
  stopTimer();
  const counts = countPieces();
  showGameOver(winner, counts);
  winnerText.textContent = '⏱️ انتهى الوقت! فاز اللاعب ' + (winner === 'RED' ? 'الأحمر' : 'الأسود');
  playWinSound();
}

function cloneBoard(b) {
  return b.map(function(row) { return row.slice(); });
}

function saveState() {
  if (undoLocked) return;
  if (gameEnded) return;

  const state = {
    board: cloneBoard(board),
    currentTurn: currentTurn,
    redTimeLeft: redTimeLeft,
    blackTimeLeft: blackTimeLeft
  };

  moveHistory.push(state);
  if (moveHistory.length > 30) moveHistory.shift();
}

function undoMove() {
  if (moveHistory.length === 0) return;
  if (gameEnded) return;
  if (animation) return;
  if (gameMode === 'PVAI' && aiThinking) return;

  const state = moveHistory.pop();
  board = state.board;
  currentTurn = state.currentTurn;
  redTimeLeft = state.redTimeLeft;
  blackTimeLeft = state.blackTimeLeft;

  selectedPiece = null;
  validMoves = [];
  isMultiCapture = false;

  if (gameMode === 'PVAI' && moveHistory.length > 0) {
    const aiState = moveHistory.pop();
    board = aiState.board;
    currentTurn = aiState.currentTurn;
    redTimeLeft = aiState.redTimeLeft;
    blackTimeLeft = aiState.blackTimeLeft;
  }

  updateTurnIndicator();
  updateTimeDisplay();
  drawBoard();
  playSelectSound();
}

function updateStats() {
  statMoves.textContent = statsMoves;
  statCaptures.textContent = statsCaptures;
  statPromotions.textContent = statsPromotions;

  if (statsStartTime) {
    const elapsed = Math.floor((Date.now() - statsStartTime) / 1000);
    statTime.textContent = formatTime(elapsed);
  }

  const counts = countPieces();
  statRed.textContent = counts.red;
  statBlack.textContent = counts.black;
}

function resetStats() {
  statsMoves = 0;
  statsCaptures = 0;
  statsPromotions = 0;
  statsStartTime = Date.now();
  moveHistory = [];
}

function openStats() {
  updateStats();
  statsOverlay.classList.remove('hidden');
}

function closeStats() {
  statsOverlay.classList.add('hidden');
}

function saveGame() {
  try {
    const data = {
      board: cloneBoard(board),
      currentTurn: currentTurn,
      redTimeLeft: redTimeLeft,
      blackTimeLeft: blackTimeLeft,
      gameMode: gameMode,
      aiLevel: aiLevel,
      aiColor: aiColor,
      gameEnded: gameEnded
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    const data = JSON.parse(saved);
    if (data.gameEnded) return false;

    board = data.board;
    currentTurn = data.currentTurn;
    redTimeLeft = data.redTimeLeft;
    blackTimeLeft = data.blackTimeLeft;
    gameMode = data.gameMode;
    aiLevel = data.aiLevel;
    aiColor = data.aiColor;
    gameEnded = false;
    return true;
  } catch (e) { return false; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

function hasSavedGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    return !JSON.parse(saved).gameEnded;
  } catch (e) { return false; }
}

function applyLanguage(lang) {
  currentLang = lang;
  if (lang === 'en') {
    txtTitle.textContent = '♟️ Checkers';
    txtChooseMode.textContent = 'Choose Mode';
    txtDifficulty.textContent = 'Difficulty:';
    txtTopTitle.textContent = '♟️ Checkers';
    txtThemeTitle.textContent = 'Choose Theme';
    txtSettings.textContent = '⚙️ Settings';
    txtSound.textContent = '🔊 Sound';
    txtVibration.textContent = '📳 Vibration';
    txtStats.textContent = '📊 Game Stats';
    txtMoves.textContent = '🎯 Moves';
    txtCaptures.textContent = '🍽️ Captures';
    txtPromotions.textContent = '👑 Promotions';
    txtTimeStat.textContent = '⏱️ Time';
    txtRedStat.textContent = '🔴 Red';
    txtBlackStat.textContent = '⚫ Black';
    if (btnContinue) btnContinue.textContent = '▶️ Continue';
    document.body.classList.add('lang-en');
    document.body.setAttribute('dir', 'ltr');
  } else {
    txtTitle.textContent = '♟️ الدامة';
    txtChooseMode.textContent = 'اختر وضع اللعب';
    txtDifficulty.textContent = 'مستوى الصعوبة:';
    txtTopTitle.textContent = '♟️ الدامة';
    txtThemeTitle.textContent = 'اختر الثيم';
    txtSettings.textContent = '⚙️ الإعدادات';
    txtSound.textContent = '🔊 الصوت';
    txtVibration.textContent = '📳 الاهتزاز';
    txtStats.textContent = '📊 الإحصائيات';
    txtMoves.textContent = '🎯 الحركات';
    txtCaptures.textContent = '🍽️ الأكلات';
    txtPromotions.textContent = '👑 الترقيات';
    txtTimeStat.textContent = '⏱️ الوقت';
    txtRedStat.textContent = '🔴 حمراء';
    txtBlackStat.textContent = '⚫ سوداء';
    if (btnContinue) btnContinue.textContent = '▶️ متابعة';
    document.body.classList.remove('lang-en');
    document.body.setAttribute('dir', 'rtl');
  }
  try { localStorage.setItem('checkersLang', lang); } catch (e) {}
}
// ==========================================
//  ♟️ الجزء 5: القواعد الأساسية
// ==========================================

function resizeBoard() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const size = Math.min(w, h) * 0.92;
  CELL_SIZE = Math.floor(size / BOARD_SIZE);
  BOARD_PX = CELL_SIZE * BOARD_SIZE;
  canvas.width = BOARD_PX;
  canvas.height = BOARD_PX;
  canvas.style.width = BOARD_PX + 'px';
  canvas.style.height = BOARD_PX + 'px';
}

function createEmptyBoard() {
  const b = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    b[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) b[row][col] = PIECE.EMPTY;
  }
  return b;
}

function isDarkSquare(row, col) { return (row + col) % 2 === 1; }
function insideBoard(row, col) { return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE; }
function isRedPiece(p)   { return p === PIECE.RED || p === PIECE.RED_KING; }
function isBlackPiece(p) { return p === PIECE.BLACK || p === PIECE.BLACK_KING; }
function isKing(p)       { return p === PIECE.RED_KING || p === PIECE.BLACK_KING; }

function isCurrentPlayerPiece(piece) {
  if (currentTurn === PIECE.RED) return isRedPiece(piece);
  if (currentTurn === PIECE.BLACK) return isBlackPiece(piece);
  return false;
}

function isOpponentPiece(piece) {
  if (piece === PIECE.EMPTY) return false;
  if (currentTurn === PIECE.RED) return isBlackPiece(piece);
  if (currentTurn === PIECE.BLACK) return isRedPiece(piece);
  return false;
}

function setupPieces() {
  board = createEmptyBoard();
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isDarkSquare(row, col)) continue;
      if (row < 3) board[row][col] = PIECE.BLACK;
      else if (row > 4) board[row][col] = PIECE.RED;
    }
  }
  currentTurn = PIECE.RED;
  selectedPiece = null;
  validMoves = [];
  isMultiCapture = false;
  gameEnded = false;
  animation = null;
  aiThinking = false;

  stopTimer();
  resetTimer();
  resetStats();
  clearSave();
}

function getDirections(piece) {
  if (piece === PIECE.RED) return [[-1, -1], [-1, 1]];
  if (piece === PIECE.BLACK) return [[1, -1], [1, 1]];
  if (piece === PIECE.RED_KING || piece === PIECE.BLACK_KING)
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  return [];
}

function getSimpleMoves(row, col) {
  const piece = board[row][col];
  const moves = [];
  const dirs = getDirections(piece);
  const isFlight = isKing(piece);

  for (let d = 0; d < dirs.length; d++) {
    const dr = dirs[d][0];
    const dc = dirs[d][1];

    if (isFlight) {
      let nr = row + dr, nc = col + dc;
      while (insideBoard(nr, nc)) {
        if (board[nr][nc] === PIECE.EMPTY) moves.push({ row: nr, col: nc, isCapture: false });
        else break;
        nr += dr; nc += dc;
      }
    } else {
      const nr = row + dr, nc = col + dc;
      if (insideBoard(nr, nc) && board[nr][nc] === PIECE.EMPTY)
        moves.push({ row: nr, col: nc, isCapture: false });
    }
  }
  return moves;
}

function getCaptureMoves(row, col) {
  const piece = board[row][col];
  const moves = [];
  const dirs = getDirections(piece);
  const isFlight = isKing(piece);

  for (let d = 0; d < dirs.length; d++) {
    const dr = dirs[d][0];
    const dc = dirs[d][1];

    if (isFlight) {
      let nr = row + dr, nc = col + dc;
      while (insideBoard(nr, nc) && board[nr][nc] === PIECE.EMPTY) { nr += dr; nc += dc; }
      if (!insideBoard(nr, nc)) continue;
      if (!isOpponentPiece(board[nr][nc])) continue;
      const capturedR = nr, capturedC = nc;
      nr += dr; nc += dc;
      while (insideBoard(nr, nc) && board[nr][nc] === PIECE.EMPTY) {
        moves.push({ row: nr, col: nc, isCapture: true, capturedRow: capturedR, capturedCol: capturedC });
        nr += dr; nc += dc;
      }
    } else {
      const midR = row + dr, midC = col + dc;
      const landR = row + dr * 2, landC = col + dc * 2;
      if (!insideBoard(landR, landC)) continue;
      if (isOpponentPiece(board[midR][midC]) && board[landR][landC] === PIECE.EMPTY)
        moves.push({ row: landR, col: landC, isCapture: true, capturedRow: midR, capturedCol: midC });
    }
  }
  return moves;
}

function getValidMoves(row, col) {
  const piece = board[row][col];
  if (piece === PIECE.EMPTY) return [];
  const captures = getCaptureMoves(row, col);
  if (captures.length > 0) return captures;
  return getSimpleMoves(row, col);
}

function hasAnyCapture() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isCurrentPlayerPiece(board[row][col])) continue;
      if (getCaptureMoves(row, col).length > 0) return true;
    }
  }
  return false;
}
// ==========================================
//  ♟️ الجزء 6: الرسم - تصميم أحجار جديد
// ==========================================

function drawPieceAt(cx, cy, piece, radius) {
  let mainColor, midColor, darkColor, king, glowColor;

  if (piece === PIECE.RED) {
    mainColor = '#ff5252';
    midColor = '#e53935';
    darkColor = '#b71c1c';
    glowColor = 'rgba(255, 82, 82, 0.6)';
    king = false;
  } else if (piece === PIECE.BLACK) {
    mainColor = '#616161';
    midColor = '#424242';
    darkColor = '#1a1a1a';
    glowColor = 'rgba(97, 97, 97, 0.6)';
    king = false;
  } else if (piece === PIECE.RED_KING) {
    mainColor = '#ff5252';
    midColor = '#e53935';
    darkColor = '#b71c1c';
    glowColor = 'rgba(255, 215, 0, 0.8)';
    king = true;
  } else if (piece === PIECE.BLACK_KING) {
    mainColor = '#616161';
    midColor = '#424242';
    darkColor = '#1a1a1a';
    glowColor = 'rgba(255, 215, 0, 0.8)';
    king = true;
  } else {
    return;
  }

  // ===== 1) ظل خارجي قوي =====
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx + 3, cy + 5, radius * 1.05, radius * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // ===== 2) هالة للملكات =====
  if (king) {
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffd700';
  } else {
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  }

  // ===== 3) الجسم الأساسي (تدرج قطري) =====
  const bodyGrad = ctx.createRadialGradient(
    cx - radius * 0.4, cy - radius * 0.4, radius * 0.1,
    cx, cy, radius * 1.2
  );
  bodyGrad.addColorStop(0, mainColor);
  bodyGrad.addColorStop(0.6, midColor);
  bodyGrad.addColorStop(1, darkColor);

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ===== 4) حدود خارجية =====
  if (king) {
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
  } else {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
  ctx.stroke();

  // ===== 5) حلقة داخلية مزخرفة =====
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // ===== 6) دائرة داخلية مملوءة =====
  const innerGrad = ctx.createRadialGradient(
    cx - radius * 0.2, cy - radius * 0.2, radius * 0.05,
    cx, cy, radius * 0.55
  );
  innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');

  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // ===== 7) لمعة علوية (تأثير زجاجي) =====
  const shineGrad = ctx.createRadialGradient(
    cx - radius * 0.45, cy - radius * 0.5, 0,
    cx - radius * 0.45, cy - radius * 0.5, radius * 0.6
  );
  shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = shineGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.35,
    cy - radius * 0.4,
    radius * 0.45,
    radius * 0.3,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ===== 8) لمعة ثانوية سفلية =====
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.ellipse(
    cx + radius * 0.3,
    cy + radius * 0.35,
    radius * 0.25,
    radius * 0.12,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ===== 9) تاج الملكة =====
  if (king) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + Math.floor(CELL_SIZE * 0.55) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.fillText('♛', cx, cy);
    ctx.shadowBlur = 0;
  }
}

function drawPiece(row, col, piece) {
  const cx = col * CELL_SIZE + CELL_SIZE / 2;
  const cy = row * CELL_SIZE + CELL_SIZE / 2;
  drawPieceAt(cx, cy, piece, CELL_SIZE * 0.4);
}

function drawHighlights() {
  if (selectedPiece) {
    const row = selectedPiece.row;
    const col = selectedPiece.col;
    const x = col * CELL_SIZE, y = row * CELL_SIZE;
    ctx.strokeStyle = COLORS.selectGlow;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.selectGlow;
    ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.shadowBlur = 0;
  }

  for (let i = 0; i < validMoves.length; i++) {
    const move = validMoves[i];
    const x = move.col * CELL_SIZE, y = move.row * CELL_SIZE;
    const cx = x + CELL_SIZE / 2, cy = y + CELL_SIZE / 2;

    if (move.isCapture) {
      const r = CELL_SIZE * 0.22;
      ctx.fillStyle = COLORS.captureMove;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.captureBorder;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const s = CELL_SIZE * 0.1;
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s);
      ctx.stroke();
    } else {
      const r = CELL_SIZE * 0.18;
      ctx.fillStyle = COLORS.validMove;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.validMoveBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function drawAllPieces() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (animation && animation.fromRow === row && animation.fromCol === col) continue;
      const piece = board[row][col];
      if (piece !== PIECE.EMPTY) drawPiece(row, col, piece);
    }
  }

  if (animation) {
    const t = Math.min(1, (Date.now() - animation.startTime) / animation.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const fx = animation.fromCol * CELL_SIZE + CELL_SIZE / 2;
    const fy = animation.fromRow * CELL_SIZE + CELL_SIZE / 2;
    const tx = animation.toCol * CELL_SIZE + CELL_SIZE / 2;
    const ty = animation.toRow * CELL_SIZE + CELL_SIZE / 2;
    const cx = fx + (tx - fx) * eased;
    const cy = fy + (ty - fy) * eased;
    drawPieceAt(cx, cy, animation.piece, CELL_SIZE * 0.4);
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const isLight = (row + col) % 2 === 0;
      ctx.fillStyle = isLight ? COLORS.lightSquare : COLORS.darkSquare;
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, BOARD_PX); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(BOARD_PX, i * CELL_SIZE); ctx.stroke();
  }
  drawHighlights();
  drawAllPieces();
}

function updateTurnIndicator() {
  if (gameEnded) { turnIndicator.textContent = '🏁 انتهت اللعبة'; return; }
  if (gameMode === 'PVAI') {
    if (currentTurn === aiColor) {
      turnIndicator.textContent = '🤖 دور الحاسوب...';
      turnIndicator.style.color = '#a0a0ff';
    } else {
      turnIndicator.textContent = '🔴 دورك أنت';
      turnIndicator.style.color = '#ff6b6b';
    }
  } else {
    if (currentTurn === PIECE.RED) {
      turnIndicator.textContent = '🔴 دور اللاعب الأحمر';
      turnIndicator.style.color = '#ff6b6b';
    } else {
      turnIndicator.textContent = '⚫ دور اللاعب الأسود';
      turnIndicator.style.color = '#d0d0d0';
    }
  }
}
// ==========================================
//  ♟️ الجزء 7: الذكاء الاصطناعي (1) - إجبار الأكل
// ==========================================

// ⚡ نسخة محسّنة: تفرض الأكل الإجباري
function getAllMoves(playerPiece) {
  const allMoves = [];
  const savedTurn = currentTurn;
  currentTurn = playerPiece;

  // 1) هل يوجد أي أكل متاح؟
  let hasAnyCaptureMove = false;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!isCurrentPlayerPiece(piece)) continue;
      if (getCaptureMoves(row, col).length > 0) {
        hasAnyCaptureMove = true;
        break;
      }
    }
    if (hasAnyCaptureMove) break;
  }

  // 2) اجمع الحركات
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!isCurrentPlayerPiece(piece)) continue;

      if (hasAnyCaptureMove) {
        // ⚡ الأكل إجباري
        const captures = getCaptureMoves(row, col);
        for (let i = 0; i < captures.length; i++) {
          const m = captures[i];
          allMoves.push({ fromRow: row, fromCol: col, toRow: m.row, toCol: m.col, moveInfo: m });
        }
      } else {
        const moves = getSimpleMoves(row, col);
        for (let i = 0; i < moves.length; i++) {
          const m = moves[i];
          allMoves.push({ fromRow: row, fromCol: col, toRow: m.row, toCol: m.col, moveInfo: m });
        }
      }
    }
  }

  currentTurn = savedTurn;
  return allMoves;
}

function simulateMove(boardCopy, move, playerPiece) {
  boardCopy[move.toRow][move.toCol] = boardCopy[move.fromRow][move.fromCol];
  boardCopy[move.fromRow][move.fromCol] = PIECE.EMPTY;
  if (move.moveInfo.isCapture) {
    boardCopy[move.moveInfo.capturedRow][move.moveInfo.capturedCol] = PIECE.EMPTY;
  }
  const piece = boardCopy[move.toRow][move.toCol];
  if (piece === PIECE.RED && move.toRow === 0) boardCopy[move.toRow][move.toCol] = PIECE.RED_KING;
  if (piece === PIECE.BLACK && move.toRow === BOARD_SIZE - 1) boardCopy[move.toRow][move.toCol] = PIECE.BLACK_KING;
}

// ⚡ تقييم محسّن: قيمة القطعة 100، الملكة 300
function evaluateBoard(boardCopy, player) {
  let score = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const p = boardCopy[row][col];
      if (p === PIECE.EMPTY) continue;
      const isPlayer = (player === PIECE.RED) ? isRedPiece(p) : isBlackPiece(p);
      let value = 0;
      if (p === PIECE.RED || p === PIECE.BLACK) value = 100;
      else value = 300;

      // مكافأة المركز
      const centerBonus = (row >= 2 && row <= 5 && col >= 2 && col <= 5) ? 5 : 0;
      value += centerBonus;

      // مكافأة الدفاع (في الصفوف الخلفية)
      const isBackRow = (player === PIECE.RED && row === 7) || (player === PIECE.BLACK && row === 0);
      if (isBackRow) value += 3;

      if (isPlayer) score += value;
      else score -= value;
    }
  }
  return score;
}

function getAIMoveEasy(player) {
  const moves = getAllMoves(player);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function checkDanger(boardCopy, row, col, player) {
  const opponent = (player === PIECE.RED) ? PIECE.BLACK : PIECE.RED;
  const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (let i = 0; i < dirs.length; i++) {
    const dr = dirs[i][0];
    const dc = dirs[i][1];
    const midR = row + dr;
    const midC = col + dc;
    const fromR = row + dr * 2;
    const fromC = col + dc * 2;

    if (!insideBoard(fromR, fromC)) continue;
    const midPiece = boardCopy[midR][midC];
    const fromPiece = boardCopy[fromR][fromC];

    const isMine = (player === PIECE.RED) ? isRedPiece(fromPiece) : isBlackPiece(fromPiece);
    if (!isMine) continue;
    if (midPiece === PIECE.EMPTY) return true;
  }
  return false;
}

function countThreats(boardCopy, row, col, player, opponent) {
  let threats = 0;
  const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (let i = 0; i < dirs.length; i++) {
    const dr = dirs[i][0];
    const dc = dirs[i][1];
    const oppR = row + dr;
    const oppC = col + dc;
    const backR = row + dr * 2;
    const backC = col + dc * 2;

    if (!insideBoard(backR, backC)) continue;
    const oppPiece = boardCopy[oppR][oppC];
    const backCell = boardCopy[backR][backC];

    const isOpp = (opponent === PIECE.RED) ? isRedPiece(oppPiece) : isBlackPiece(oppPiece);
    if (isOpp && backCell === PIECE.EMPTY) threats++;
  }
  return threats;
}
// ==========================================
//  ♟️ الجزء 8: الذكاء الاصطناعي (2)
// ==========================================

function getAIMoveMedium(player) {
  const moves = getAllMoves(player);
  if (moves.length === 0) return null;

  const opponent = (player === PIECE.RED) ? PIECE.BLACK : PIECE.RED;
  let best = null;
  let bestScore = -Infinity;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const boardCopy = board.map(function(r) { return r.slice(); });
    simulateMove(boardCopy, move, player);

    let score = evaluateBoard(boardCopy, player);

    // ⚡ مكافأة ضخمة للأكل
    if (move.moveInfo.isCapture) {
      score += 500;
      const captured = board[move.moveInfo.capturedRow][move.moveInfo.capturedCol];
      if (isKing(captured)) score += 300;
    }

    // تجنب الخطر
    if (!move.moveInfo.isCapture) {
      const danger = checkDanger(boardCopy, move.toRow, move.toCol, player);
      if (danger) score -= 50;
    }

    // تهديد الخصم
    const threats = countThreats(boardCopy, move.toRow, move.toCol, player, opponent);
    score += threats * 15;

    // التقدم للأمام
    if (player === PIECE.RED) score += (7 - move.toRow) * 3;
    else score += move.toRow * 3;

    // البقاء قريباً من المركز
    const centerDist = Math.abs(move.toCol - 3.5) + Math.abs(move.toRow - 3.5);
    score += (7 - centerDist) * 1;

    // عشوائية صغيرة
    score += Math.random() * 2;

    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

function getAIMoveHard(player) {
  const moves = getAllMoves(player);
  if (moves.length === 0) return null;

  let best = null;
  let bestScore = -Infinity;
  const depth = 3;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const boardCopy = board.map(function(r) { return r.slice(); });
    simulateMove(boardCopy, move, player);

    const opponent = (player === PIECE.RED) ? PIECE.BLACK : PIECE.RED;
    const score = minimax(boardCopy, depth - 1, false, player, opponent, -Infinity, Infinity);

    // ⚡ إضافة مكافأة الأكل حتى في الصعب
    const finalScore = score + (move.moveInfo.isCapture ? 500 : 0);

    if (finalScore > bestScore) {
      bestScore = finalScore;
      best = move;
    }
  }
  return best;
}

function minimax(boardCopy, depth, isMaximizing, player, opponent, alpha, beta) {
  if (depth === 0) return evaluateBoard(boardCopy, player);

  const currentPlayer = isMaximizing ? player : opponent;
  const moves = getMovesForBoard(boardCopy, currentPlayer);

  if (moves.length === 0) return isMaximizing ? -10000 : 10000;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const copy = boardCopy.map(function(r) { return r.slice(); });
      simulateMove(copy, moves[i], currentPlayer);
      let evalScore = minimax(copy, depth - 1, false, player, opponent, alpha, beta);
      if (moves[i].moveInfo.isCapture) evalScore += 500;
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < moves.length; i++) {
      const copy = boardCopy.map(function(r) { return r.slice(); });
      simulateMove(copy, moves[i], currentPlayer);
      let evalScore = minimax(copy, depth - 1, true, player, opponent, alpha, beta);
      if (moves[i].moveInfo.isCapture) evalScore -= 500;
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getMovesForBoard(boardCopy, playerPiece) {
  const allMoves = [];
  const savedBoard = board;
  const savedTurn = currentTurn;
  board = boardCopy;
  currentTurn = playerPiece;

  // هل يوجد أكل؟
  let hasCapture = false;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isCurrentPlayerPiece(board[row][col])) continue;
      if (getCaptureMoves(row, col).length > 0) { hasCapture = true; break; }
    }
    if (hasCapture) break;
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!isCurrentPlayerPiece(piece)) continue;

      if (hasCapture) {
        const captures = getCaptureMoves(row, col);
        for (let i = 0; i < captures.length; i++) {
          const m = captures[i];
          allMoves.push({ fromRow: row, fromCol: col, toRow: m.row, toCol: m.col, moveInfo: m });
        }
      } else {
        const moves = getSimpleMoves(row, col);
        for (let i = 0; i < moves.length; i++) {
          const m = moves[i];
          allMoves.push({ fromRow: row, fromCol: col, toRow: m.row, toCol: m.col, moveInfo: m });
        }
      }
    }
  }

  board = savedBoard;
  currentTurn = savedTurn;
  return allMoves;
}

function performAIMove() {
  if (gameEnded || aiThinking) return;
  if (currentTurn !== aiColor) return;

  aiThinking = true;

  setTimeout(function() {
    let move = null;

    if (aiLevel === 'easy') move = getAIMoveEasy(aiColor);
    else if (aiLevel === 'medium') move = getAIMoveMedium(aiColor);
    else move = getAIMoveHard(aiColor);

    aiThinking = false;

    if (!move) {
      checkGameOver();
      return;
    }

    movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol, move.moveInfo);
  }, 500);
}
// ==========================================
//  ♟️ الجزء 9: النقل + الثيمات
// ==========================================

function switchTurn() {
  if (!timerRunning && !gameEnded) startTimer();

  currentTurn = (currentTurn === PIECE.RED) ? PIECE.BLACK : PIECE.RED;
  selectedPiece = null;
  validMoves = [];
  isMultiCapture = false;
  updateTurnIndicator();
  updateTimeDisplay();
  drawBoard();

  setTimeout(function() {
    if (checkGameOver()) return;
    if (gameMode === 'PVAI' && currentTurn === aiColor && !gameEnded) {
      performAIMove();
    }
  }, 300);
}

function checkPromotion(row, col) {
  const piece = board[row][col];
  if (piece === PIECE.RED && row === 0) {
    board[row][col] = PIECE.RED_KING;
    playPromotionSound();
    statsPromotions++;
    return true;
  }
  if (piece === PIECE.BLACK && row === BOARD_SIZE - 1) {
    board[row][col] = PIECE.BLACK_KING;
    playPromotionSound();
    statsPromotions++;
    return true;
  }
  return false;
}

function movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
  const movingPiece = board[fromRow][fromCol];

  saveState();
  statsMoves++;
  if (moveInfo.isCapture) statsCaptures++;

  animation = {
    piece: movingPiece,
    fromRow: fromRow, fromCol: fromCol,
    toRow: toRow, toCol: toCol,
    startTime: Date.now(),
    duration: 250
  };

  board[toRow][toCol] = movingPiece;
  board[fromRow][fromCol] = PIECE.EMPTY;

  if (moveInfo.isCapture) playCaptureSound();
  else playMoveSound();

  if (moveInfo.isCapture) {
    board[moveInfo.capturedRow][moveInfo.capturedCol] = PIECE.EMPTY;
  }

  selectedPiece = null;
  validMoves = [];

  function animLoop() {
    if (!animation) return;
    const t = (Date.now() - animation.startTime) / animation.duration;
    drawBoard();

    if (t >= 1) {
      animation = null;
      drawBoard();
      const promoted = checkPromotion(toRow, toCol);

      if (moveInfo.isCapture && !promoted) {
        const moreCaptures = getCaptureMoves(toRow, toCol);
        if (moreCaptures.length > 0) {
          selectedPiece = { row: toRow, col: toCol };
          validMoves = moreCaptures;
          isMultiCapture = true;
          drawBoard();

          if (gameMode === 'PVAI' && currentTurn === aiColor) {
            setTimeout(function() {
              let next = null;
              if (aiLevel === 'easy') next = moreCaptures[Math.floor(Math.random() * moreCaptures.length)];
              else next = moreCaptures[0];
              movePiece(toRow, toCol, next.row, next.col, next);
            }, 400);
          }
          return;
        }
      }

      saveGame();
      switchTurn();
      return;
    }
    requestAnimationFrame(animLoop);
  }

  requestAnimationFrame(animLoop);
}

function handleClick(row, col) {
  if (gameEnded || animation) return;
  if (gameMode === 'PVAI' && currentTurn === aiColor) return;

  const piece = board[row][col];

  if (selectedPiece) {
    let moveInfo = null;
    for (let i = 0; i < validMoves.length; i++) {
      if (validMoves[i].row === row && validMoves[i].col === col) {
        moveInfo = validMoves[i];
        break;
      }
    }

    if (moveInfo) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col, moveInfo);
      return;
    }

    if (!isMultiCapture && isCurrentPlayerPiece(piece)) {
      if (hasAnyCapture() && getCaptureMoves(row, col).length === 0) {
        playErrorSound();
        return;
      }
      selectedPiece = { row: row, col: col };
      validMoves = getValidMoves(row, col);
      playSelectSound();
      drawBoard();
      return;
    }
    selectedPiece = null;
    validMoves = [];
    drawBoard();
    return;
  }

  if (isCurrentPlayerPiece(piece)) {
    if (hasAnyCapture() && getCaptureMoves(row, col).length === 0) {
      playErrorSound();
      return;
    }
    selectedPiece = { row: row, col: col };
    validMoves = getValidMoves(row, col);
    playSelectSound();
    drawBoard();
  }
}

function getBoardCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);
  if (!insideBoard(row, col)) return null;
  return { row: row, col: col };
}

function countPieces() {
  let red = 0, black = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const p = board[row][col];
      if (isRedPiece(p)) red++;
      else if (isBlackPiece(p)) black++;
    }
  }
  return { red: red, black: black };
}

function hasAnyMove() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isCurrentPlayerPiece(board[row][col])) continue;
      if (getValidMoves(row, col).length > 0) return true;
    }
  }
  return false;
}

function checkGameOver() {
  if (gameEnded) { stopTimer(); return true; }

  const counts = countPieces();
  let winner = null;

  if (counts.red === 0) winner = 'BLACK';
  else if (counts.black === 0) winner = 'RED';
  else if (!hasAnyMove()) {
    winner = (currentTurn === PIECE.RED) ? 'BLACK' : 'RED';
  }

  if (winner) {
    gameEnded = true;
    stopTimer();
    showGameOver(winner, counts);
    playWinSound();
    return true;
  }
  return false;
}

function showGameOver(winner, counts) {
  stopTimer();

  if (winner === 'RED') {
    winnerText.textContent = '🏆 فاز اللاعب الأحمر!';
    winnerText.style.color = '#ff6b6b';
  } else {
    winnerText.textContent = '🏆 فاز اللاعب الأسود!';
    winnerText.style.color = '#d0d0d0';
  }

  statsText.innerHTML =
    '🔴 القطع الحمراء: <strong>' + counts.red + '</strong><br>' +
    '⚫ القطع السوداء: <strong>' + counts.black + '</strong>';

  gameOverOverlay.classList.remove('hidden');
  updateTurnIndicator();
  clearSave();
}

function applyTheme(theme) {
  currentTheme = theme;
  document.body.classList.remove('theme-modern', 'theme-night', 'theme-nature');

  if (theme === 'modern') document.body.classList.add('theme-modern');
  else if (theme === 'night') document.body.classList.add('theme-night');
  else if (theme === 'nature') document.body.classList.add('theme-nature');

  themeOptions.forEach(function(btn) {
    if (btn.dataset.theme === theme) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  updateBoardColors(theme);
  try { localStorage.setItem('checkersTheme', theme); } catch (e) {}
  drawBoard();
}

function updateBoardColors(theme) {
  if (theme === 'modern') {
    COLORS.lightSquare = '#d0e0f0';
    COLORS.darkSquare = '#5a7a9a';
    COLORS.selectGlow = '#3498db';
  } else if (theme === 'night') {
    COLORS.lightSquare = '#3a3a3a';
    COLORS.darkSquare = '#1a1a1a';
    COLORS.selectGlow = '#ffffff';
  } else if (theme === 'nature') {
    COLORS.lightSquare = '#d4e8c0';
    COLORS.darkSquare = '#7a9c60';
    COLORS.selectGlow = '#81c784';
  } else {
    COLORS.lightSquare = '#f0d9b5';
    COLORS.darkSquare = '#b58863';
    COLORS.selectGlow = '#ffd700';
  }
}
// ==========================================
//  ♟️ الجزء 10: الأزرار
// ==========================================

function bindButton(btn, handler) {
  if (!btn) return;
  let touched = false;

  btn.addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    touched = true;
    try { initAudio(); } catch (err) {}
    handler();
    setTimeout(function() { touched = false; }, 400);
  }, { passive: false });

  btn.addEventListener('click', function(e) {
    if (touched) return;
    try { initAudio(); } catch (err) {}
    handler();
  });
}

bindButton(btnPvP, function() {
  gameMode = 'PVP';
  startScreen.classList.add('hidden');
  aiOptions.classList.add('hidden');
  setupPieces();
  updateTurnIndicator();
  drawBoard();
});

bindButton(btnPvAI, function() {
  aiOptions.classList.remove('hidden');
});

bindButton(btnEasy, function() {
  gameMode = 'PVAI';
  aiLevel = 'easy';
  aiColor = PIECE.BLACK;
  aiThinking = false;
  startScreen.classList.add('hidden');
  aiOptions.classList.add('hidden');
  setupPieces();
  updateTurnIndicator();
  drawBoard();
});

bindButton(btnMedium, function() {
  gameMode = 'PVAI';
  aiLevel = 'medium';
  aiColor = PIECE.BLACK;
  aiThinking = false;
  startScreen.classList.add('hidden');
  aiOptions.classList.add('hidden');
  setupPieces();
  updateTurnIndicator();
  drawBoard();
});

bindButton(btnHard, function() {
  gameMode = 'PVAI';
  aiLevel = 'hard';
  aiColor = PIECE.BLACK;
  aiThinking = false;
  startScreen.classList.add('hidden');
  aiOptions.classList.add('hidden');
  setupPieces();
  updateTurnIndicator();
  drawBoard();
});

bindButton(playAgainBtn, function() {
  gameOverOverlay.classList.add('hidden');
  setupPieces();
  updateTurnIndicator();
  drawBoard();
});

bindButton(backToMenuBtn, function() {
  gameOverOverlay.classList.add('hidden');
  startScreen.classList.remove('hidden');
  aiOptions.classList.add('hidden');
});

bindButton(undoBtn, function() {
  undoMove();
});

bindButton(statsBtn, function() {
  openStats();
});

bindButton(closeStatsBtn, function() {
  closeStats();
});

bindButton(btnContinue, function() {
  if (loadGame()) {
    startScreen.classList.add('hidden');
    aiOptions.classList.add('hidden');
    updateTurnIndicator();
    updateTimeDisplay();
    drawBoard();
    if (gameMode === 'PVAI' && currentTurn === aiColor) performAIMove();
  }
});

bindButton(settingsBtn, function() {
  settingsOverlay.classList.remove('hidden');
});

bindButton(closeSettingsBtn, function() {
  settingsOverlay.classList.add('hidden');
});

bindButton(soundToggle, function() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '✅ تشغيل' : '❌ إيقاف';
  soundToggle.classList.toggle('off', !soundEnabled);
  try { localStorage.setItem('checkersSound', soundEnabled); } catch (e) {}
});

bindButton(vibrationToggle, function() {
  vibrationEnabled = !vibrationEnabled;
  vibrationToggle.textContent = vibrationEnabled ? '✅ تشغيل' : '❌ إيقاف';
  vibrationToggle.classList.toggle('off', !vibrationEnabled);
  try { localStorage.setItem('checkersVibration', vibrationEnabled); } catch (e) {}
});

bindButton(langBtn, function() {
  applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
});

themeBtn.addEventListener('touchend', function(e) {
  e.preventDefault();
  themePicker.classList.toggle('hidden');
}, { passive: false });

themeBtn.addEventListener('click', function() {
  themePicker.classList.toggle('hidden');
});

themeOptions.forEach(function(btn) {
  btn.addEventListener('touchend', function(e) {
    e.preventDefault();
    applyTheme(btn.dataset.theme);
    themePicker.classList.add('hidden');
  }, { passive: false });

  btn.addEventListener('click', function() {
    applyTheme(btn.dataset.theme);
    themePicker.classList.add('hidden');
  });
});
// ==========================================
//  ♟️ الجزء 11: أحداث الكانفس
// ==========================================

canvas.addEventListener('touchend', function(e) {
  e.preventDefault();
  if (e.changedTouches.length === 0) return;
  try { initAudio(); } catch (err) {}
  const t = e.changedTouches[0];
  const coords = getBoardCoords(t.clientX, t.clientY);
  if (coords) handleClick(coords.row, coords.col);
}, { passive: false });

canvas.addEventListener('click', function(e) {
  try { initAudio(); } catch (err) {}
  const coords = getBoardCoords(e.clientX, e.clientY);
  if (coords) handleClick(coords.row, coords.col);
});
// ==========================================
//  ♟️ الجزء 12: التشغيل
// ==========================================

function init() {
  resizeBoard();
  setupPieces();
  updateTurnIndicator();
  drawBoard();

  try {
    const savedTheme = localStorage.getItem('checkersTheme');
    if (savedTheme) applyTheme(savedTheme);

    const savedSound = localStorage.getItem('checkersSound');
    if (savedSound === 'false') {
      soundEnabled = false;
      soundToggle.textContent = '❌ إيقاف';
      soundToggle.classList.add('off');
    }

    const savedVib = localStorage.getItem('checkersVibration');
    if (savedVib === 'false') {
      vibrationEnabled = false;
      vibrationToggle.textContent = '❌ إيقاف';
      vibrationToggle.classList.add('off');
    }

    const savedLang = localStorage.getItem('checkersLang');
    if (savedLang) applyLanguage(savedLang);
  } catch (e) {}

  if (hasSavedGame()) {
    btnContinue.style.display = 'block';
  }
}

window.addEventListener('load', init);
window.addEventListener('resize', function() {
  resizeBoard();
  drawBoard();
});

console.log('♟️ لعبة الدامة — AI مُجبر على الأكل + تصميم أحجار جديد');