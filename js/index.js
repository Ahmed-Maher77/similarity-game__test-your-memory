/* ================== GAME STATE VARIABLES ================== */
let attempts = 5;
let matched_pairs = 0;
let gameStarted = false;
let isCheckingMatch = false; // Prevents clicks during match check
let firstCard, secondCard;
let initialLoadComplete = false;
const restartGame_btns = document.querySelectorAll(".restart-game");

/* ================== AUDIO SYSTEM ================== */
class AudioManager {
	constructor() {
		this.audioContext = null;
		this.isEnabled = true;
		this.initAudio();
	}

	initAudio() {
		try {
			this.audioContext = new (window.AudioContext ||
				window.webkitAudioContext)();
		} catch (e) {
			console.log("Web Audio API not supported");
		}
	}

	playTone(frequency, duration, type = "sine", volume = 0.3) {
		if (!this.audioContext || !this.isEnabled) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.frequency.setValueAtTime(
			frequency,
			this.audioContext.currentTime
		);
		oscillator.type = type;

		gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime(
			volume,
			this.audioContext.currentTime + 0.01
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.001,
			this.audioContext.currentTime + duration
		);

		oscillator.start(this.audioContext.currentTime);
		oscillator.stop(this.audioContext.currentTime + duration);
	}

	toggle() {
		this.isEnabled = !this.isEnabled;
		const audioToggle = document.querySelector("#audio-toggle");
		const icon = audioToggle.querySelector("i");
		const statusText = audioToggle.querySelector(".visually-hidden");

		icon.className = this.isEnabled
			? "fa-solid fa-volume-high"
			: "fa-solid fa-volume-mute";

		// toggle aria-pressed and aria-label (for accessibility)
		audioToggle.setAttribute("aria-pressed", this.isEnabled);
		statusText.textContent = this.isEnabled
			? "Sound is on"
			: "Sound is off";
	}

	playGameStart() {
		const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
		notes.forEach((note, index) => {
			setTimeout(
				() => this.playTone(note, 0.3, "sine", 0.2),
				index * 150
			);
		});
	}

	playWin() {
		const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
		notes.forEach((note, index) => {
			setTimeout(
				() => this.playTone(note, 0.4, "sine", 0.25),
				index * 200
			);
		});
	}

	playLose() {
		const notes = [523.25, 466.16, 415.3, 369.99]; // C5, A#4, G#4, F#4
		notes.forEach((note, index) => {
			setTimeout(
				() => this.playTone(note, 0.5, "sawtooth", 0.2),
				index * 200
			);
		});
	}

	playMatch() {
		this.playTone(659.25, 0.2, "sine", 0.15); // E5
	}

	playWrong() {
		this.playTone(220, 0.3, "sawtooth", 0.2); // A3
	}
}

const audioManager = new AudioManager();

/* ================== CARD CLASS & DATA ================== */
class Card {
	constructor(id, symbol) {
		this.id = id;
		this.symbol = symbol;
	}
}
const cards = [
	new Card(1, "⭐"),
	new Card(1, "⭐"),
	new Card(2, "👩‍🎓"),
	new Card(2, "👩‍🎓"),
	new Card(3, "🚀"),
	new Card(3, "🚀"),
	new Card(4, "🐱"),
	new Card(4, "🐱"),
	new Card(5, "🤷‍♀️"),
	new Card(5, "🤷‍♀️"),
];

/* ================== SELECT DOM ELEMENTS ================== */
const heartsContainer = document.querySelector(".hearts");
const matchedPairsSpan = document.querySelector(".matched-pairs span");
const cardsContainer = document.querySelector(".cards");
const startBtn = document.getElementById("start-btn");
const audioToggle = document.getElementById("audio-toggle");
const failMatchedPairs = document.querySelector(".fail-matched-pairs");
const closeFailMsg = document.querySelector(".close-fail-msg");
const closeSuccessMsg = document.querySelector(".close-success-msg");

/* ================== GAME FUNCTIONS ================== */
// show hearts
function showHearts() {
	heartsContainer.innerHTML = "";
	for (let i = 0; i < attempts; i++) {
		const heart = document.createElement("i");
		heart.className = "fa-solid fa-heart fs-5 text-danger pe-1";
		heartsContainer.appendChild(heart);
	}

	// Trigger animation for hearts (reset and restart)
	const heartElements = heartsContainer.querySelectorAll("i");
	heartElements.forEach((heart, index) => {
		heart.style.animation = "none";
		heart.offsetHeight; // Trigger reflow
		heart.style.animation = "heartPopIn 0.4s ease-out forwards";
		heart.style.animationDelay = "0s"; // Immediate animation for gameplay
	});

	if (attempts <= 0) {
		setTimeout(() => failMsg(), 500);
	}
}

// show matched pairs
function showMatchedPairs() {
	matchedPairsSpan.innerText = matched_pairs;
	if (matched_pairs >= cards.length / 2) {
		successMsg();
	}
}

// shuffle cards
function shuffleCards(els) {
	return els.sort(() => 0.5 - Math.random()).sort(() => 0.5 - Math.random());
}

// flip cards
function flipCards() {
	const cardElements = cardsContainer.querySelectorAll(".card");
	cardElements.forEach((card) => card.classList.add("active"));
}

// reset cards
function resetCards() {
	const cardElements = cardsContainer.querySelectorAll(".card");
	cardElements.forEach((card, index) => {
		card.classList.remove("active");
		// reset aria-pressed and aria-label (for accessibility)
		card.setAttribute("aria-pressed", "false");
		card.setAttribute("aria-label", `Card ${index + 1}, click to flip`);
	});
}

// check if the 2 cards are matched or not
function isMatch() {
	const firstCard_id = firstCard.getAttribute("data-id");
	const secondCard_id = secondCard.getAttribute("data-id");

	if (firstCard_id === secondCard_id) {
		// Match found
		audioManager.playMatch();
		matched_pairs++;
		showMatchedPairs();
		matchedPairsSpan.classList.add("text-success");

		// Visual feedback
		firstCard.querySelector(".front-face").classList.add("bg-green");
		secondCard.querySelector(".front-face").classList.add("bg-green");
		firstCard.setAttribute("data-match", "matched");
		secondCard.setAttribute("data-match", "matched");

		// Animation
		firstCard.classList.add("matched");
		secondCard.classList.add("matched");
		setTimeout(() => {
			firstCard.classList.remove("matched");
			secondCard.classList.remove("matched");
		}, 600);
	} else {
		// No match
		audioManager.playWrong();
		firstCard.classList.add("wrong");
		secondCard.classList.add("wrong");

		setTimeout(() => {
			firstCard.classList.remove("active", "wrong");
			secondCard.classList.remove("active", "wrong");
		}, 500);
		attempts--;

		// Update hearts with a small delay to ensure visibility
		setTimeout(() => {
			showHearts();
		}, 100);
	}

	// Reset variables
	setTimeout(() => {
		firstCard = null;
		secondCard = null;
		isCheckingMatch = false;
	}, 500);
}

// fail message
function failMsg() {
	audioManager.playLose();
	const triggerFail = document.getElementById("trigger-fail");
	const failAttempts = document.querySelector(".fail-attempts");
	failAttempts.innerText = 5 - attempts;
	failMatchedPairs.innerText = matched_pairs;
	triggerFail.click();
}

// success message
function successMsg() {
	audioManager.playWin();
	createConfetti();

	const triggerSuccess = document.getElementById("trigger-success");
	const successAttempts = document.querySelector(".success-attempts");
	successAttempts.innerText = 5 - attempts;
	triggerSuccess.click();
}

// create confetti (celebration in winning state)
function createConfetti() {
	const celebration = document.createElement("div");
	celebration.className = "celebration";
	document.body.appendChild(celebration);

	for (let i = 0; i < 50; i++) {
		const confetti = document.createElement("div");
		confetti.className = "confetti";
		confetti.style.left = Math.random() * 100 + "%";
		confetti.style.animationDelay = Math.random() * 3 + "s";
		confetti.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
		celebration.appendChild(confetti);
	}

	setTimeout(() => document.body.removeChild(celebration), 3000);
}

// restart game
function restartGame() {
	attempts = 5;
	showHearts();
	matched_pairs = 0;
	matchedPairsSpan.classList.remove("text-success");
	showMatchedPairs();
	gameStarted = false;
	firstCard = null;
	secondCard = null;

	// Reset button state
	startBtn.innerHTML = `<i class="fa-solid fa-play me-2"></i> Start Game`;
	startBtn.classList.replace("rounded", "rounded-pill");
	startBtn.classList.replace("bg-danger", "bg-primary");

	// Shuffle and regenerate cards for restart
	shuffleCards(cards);
	regenerateCardsForRestart();

	// Start the game directly without clicking the button
	audioManager.playGameStart();
	flipCards();
	startBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Restart the Game`;
	startBtn.classList.replace("rounded-pill", "rounded");
	startBtn.classList.replace("bg-primary", "bg-danger");

	setTimeout(() => {
		resetCards();
		gameStarted = true;
	}, 1000);
}

/* ================== CARD MANAGEMENT ================== */
// generate cards
function generateCards() {
	cardsContainer.innerHTML = "";
	shuffleCards(cards).forEach((card, index) => {
		cardsContainer.innerHTML += `
			<div class="col-4 col-sm-3 col-lg-2">
				<div 
					class="card border h-300" 
					data-id='${card.id}' 
					role="gridcell"
					tabindex="0"
					aria-label="Card ${index + 1}, click to flip"
					aria-describedby="card-${index + 1}-description"
				>
					<div class="front-face font-big bg-secondary h-100 w-100 d-flex justify-content-center align-items-center px-2 rounded">
						<p class="mb-0" id="card-${index + 1}-description">${card.symbol}</p>
					</div>
					<div class="back-face bg-gray h-100 w-100 rounded" aria-hidden="true">
						<span class="visually-hidden">Card back, click to reveal</span>
					</div>
				</div>
			</div>
		`;
	});
}

// regenerate cards
function regenerateCards() {
	cardsContainer.innerHTML = "";
	shuffleCards(cards).forEach((card, index) => {
		cardsContainer.innerHTML += `
			<div class="col-4 col-sm-3 col-lg-2">
				<div 
					class="card border h-300" 
					data-id='${card.id}'
					role="gridcell"
					tabindex="0"
					aria-label="Card ${index + 1}, click to flip"
					aria-describedby="card-${index + 1}-description"
				>
					<div class="front-face font-big bg-secondary h-100 w-100 d-flex justify-content-center align-items-center px-2 rounded">
						<p class="mb-0" id="card-${index + 1}-description">${card.symbol}</p>
					</div>
					<div class="back-face bg-gray h-100 w-100 rounded" aria-hidden="true">
						<span class="visually-hidden">Card back, click to reveal</span>
					</div>
				</div>
			</div>
		`;
	});

	cardsContainer.classList.add("game-start");
	setTimeout(() => showCardsImmediately(), 200);
	setTimeout(() => cardsContainer.classList.remove("game-start"), 1200);
	attachCardEventListeners();
}

// regenerate cards for restart (no conflicting animations)
function regenerateCardsForRestart() {
	cardsContainer.innerHTML = "";
	shuffleCards(cards).forEach((card, index) => {
		cardsContainer.innerHTML += `
			<div class="col-4 col-sm-3 col-lg-2">
				<div 
					class="card border h-300" 
					data-id='${card.id}'
					role="gridcell"
					tabindex="0"
					aria-label="Card ${index + 1}, click to flip"
					aria-describedby="card-${index + 1}-description"
				>
					<div class="front-face font-big bg-secondary h-100 w-100 d-flex justify-content-center align-items-center px-2 rounded">
						<p class="mb-0" id="card-${index + 1}-description">${card.symbol}</p>
					</div>
					<div class="back-face bg-gray h-100 w-100 rounded" aria-hidden="true">
						<span class="visually-hidden">Card back, click to reveal</span>
					</div>
				</div>
			</div>
		`;
	});

	// Show cards immediately without animations
	showCardsImmediately();
	attachCardEventListeners();
}

// trigger card animations
function triggerCardAnimations() {
	const cardElements = cardsContainer.querySelectorAll(".card");
	cardElements.forEach((card, index) => {
		card.style.animation = "none";
		card.offsetHeight; // Trigger reflow
		card.style.animation = `cardLoadIn 0.6s ease-out forwards`;
		card.style.animationDelay = `${index * 0.1}s`;
	});
}

// show cards immediately
function showCardsImmediately() {
	const cardElements = cardsContainer.querySelectorAll(".card");
	cardElements.forEach((card) => {
		card.style.opacity = "1";
		card.style.transform = "translateY(0) rotateY(0deg) scale(1)";
		card.style.boxShadow = "var(--shadow-light)";
	});
}

// attach card event listeners
function attachCardEventListeners() {
	const cardElements = cardsContainer.querySelectorAll(".card");

	// Cursor states and accessibility
	cardElements.forEach((card) => {
		card.onmouseover = () => {
			if (gameStarted && !card.classList.contains("active")) {
				card.style.cursor = "pointer";
			} else {
				card.style.cursor = "not-allowed";
			}
		};

		// Card interactions (click and keyboard)
		const handleCardInteraction = () => {
			if (
				gameStarted &&
				!isCheckingMatch &&
				card.getAttribute("data-match") !== "matched"
			) {
				card.classList.add("active");
				card.setAttribute("aria-pressed", "true");

				// Update aria-label for flipped state (for accessibility)
				const cardIndex = Array.from(cardElements).indexOf(card) + 1;
				const symbol = card.querySelector(".front-face p").textContent;
				card.setAttribute(
					"aria-label",
					`Card ${cardIndex} showing ${symbol}`
				);

				if (!firstCard) {
					firstCard = card;
				} else {
					secondCard = card;
					isCheckingMatch = true;
				}
				if (firstCard && secondCard) isMatch();
			}
		};

		// Click event
		card.onclick = handleCardInteraction;

		// Keyboard event (Enter and Space)
		card.onkeydown = (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleCardInteraction();
			}
		};
	});
}

/* ================== ANIMATION FUNCTIONS ================== */
// create welcome message
function createWelcomeMessage() {
	const welcomeDiv = document.createElement("div");
	welcomeDiv.className = "welcome-message";
	welcomeDiv.innerHTML = `
		<div class="welcome-content">
			<h2>🧠 Memory Game</h2>
			<p>Test your memory skills!</p>
		</div>
	`;
	document.body.appendChild(welcomeDiv);
	document.body.style.overflow = "hidden";

	setTimeout(() => {
		if (welcomeDiv.parentNode) {
			welcomeDiv.parentNode.removeChild(welcomeDiv);
			window.scrollTo(0, 0, { behavior: "smooth" });
			document.body.style.overflow = "auto";
		}
		triggerCardAnimations();
		triggerFooterAnimation();
		initialLoadComplete = true;
	}, 3000);
}

// create background animation
function createBackgroundAnimation() {
	const bgAnimation = document.createElement("div");
	bgAnimation.className = "bg-animation";
	document.body.appendChild(bgAnimation);
}

// trigger footer animation
function triggerFooterAnimation() {
	const footer = document.querySelector("footer");
	if (footer) {
		// Reset animation to trigger it
		footer.style.animation = "none";
		footer.offsetHeight; // Trigger reflow
		footer.style.animation = "footerSlideIn 0.8s ease-out forwards";
	}
}

// enable audio (required by browsers)
function enableAudio() {
	if (
		audioManager.audioContext &&
		audioManager.audioContext.state === "suspended"
	) {
		audioManager.audioContext.resume();
	}
}

/* ================== EVENT LISTENERS ================== */
// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
	if (!initialLoadComplete) {
		createWelcomeMessage();
	} else {
		triggerCardAnimations();
		triggerFooterAnimation();
	}

	createBackgroundAnimation();
	document.addEventListener("click", enableAudio, { once: true });
	document.addEventListener("touchstart", enableAudio, { once: true });
});

// toggle audio
audioToggle.addEventListener("click", () => audioManager.toggle());

// start button
startBtn.addEventListener("click", () => {
	if (!gameStarted) {
		audioManager.playGameStart();
		flipCards();
		startBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Restart the Game`;
		startBtn.classList.replace("rounded-pill", "rounded");
		startBtn.classList.replace("bg-primary", "bg-danger");

		setTimeout(() => {
			resetCards();
			gameStarted = true;
		}, 2500);
	} else {
		restartGame();
	}
});

// restart game buttons
restartGame_btns.forEach((btn) => {
	btn.onclick = () => {
		restartGame();
		closeFailMsg.click();
		closeSuccessMsg.click();
	};
});

/* ================== INITIALIZATION ================== */
showHearts();
showMatchedPairs();
generateCards();
attachCardEventListeners();

/* ================== Set Current Year in Footer ================== */
document.getElementById("copyright-year").textContent =
	new Date().getFullYear();
