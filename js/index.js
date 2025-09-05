let attempts = 5;
let matched_pairs = 0;
let gameStarted = false;
// flag to temporarily disable clicks while the match check is in progress
let isCheckingMatch = false;
let firstCard, secondCard;
const restartGame_btns = document.querySelectorAll(".restart-game");

class Card {
	constructor(id, symbol) {
		this.id = id;
		this.symbol = symbol;
	}
}

// array of cards
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

// Attempts
const heartsContainer = document.querySelector(".hearts");
function showHearts() {
	heartsContainer.innerHTML = "";
	for (let i = 0; i < attempts; i++) {
		const heart = document.createElement("i");
		heart.className = "fa-solid fa-heart fs-5 text-danger pe-1";
		heartsContainer.appendChild(heart);
	}
	if (attempts <= 0) {
		setTimeout(() => {
			failMsg();
		}, 500);
	}
}
showHearts();

// Matched Pairs
const matchedPairsSpan = document.querySelector(".matched-pairs span");
function showMatchedPairs() {
	matchedPairsSpan.innerText = matched_pairs;
	if (matched_pairs >= cards.length / 2) {
		successMsg();
	}
}
showMatchedPairs();

// arrange cards randomly
const shuffleCards = (els) =>
	els.sort(() => 0.5 - Math.random()).sort(() => 0.5 - Math.random());

// loop over cards >> create each card >> append them to their parent
const cardsContainer = document.querySelector(".cards");
shuffleCards(cards).forEach((card) => {
	cardsContainer.innerHTML += `
        <div class="col-4 col-sm-3 col-lg-2">
            <div class="card border h-300" data-id='${card.id}'>
                <div class="front-face font-big bg-secondary h-100 w-100 d-flex justify-content-center align-items-center px-2 rounded">
                    <p class="mb-0">${card.symbol}</p>
                </div>
                <div class="back-face bg-gray h-100 w-100 rounded"></div>
            </div>
        </div>
    `;
});

// Function to attach event listeners to card elements
function attachCardEventListeners() {
	const cardElements = cardsContainer.querySelectorAll(".card");

	// Adjust Cursor Status
	cardElements.forEach((card) => {
		card.onmouseover = () => {
			if (gameStarted && !card.classList.contains("active")) {
				card.style.cursor = "pointer";
			} else {
				card.style.cursor = "not-allowed";
			}
		};
	});

	// when click on each card
	cardElements.forEach((card) => {
		card.onclick = function () {
			if (
				gameStarted &&
				!isCheckingMatch &&
				card.getAttribute("data-match") !== "matched"
			) {
				card.classList.add("active");
				if (!firstCard) {
					firstCard = card;
				} else {
					secondCard = card;
					isCheckingMatch = true;
				}

				if (firstCard && secondCard) isMatch();
			}
		};
	});
}

// Attach initial event listeners
attachCardEventListeners();

// when click the start button >> change its content [start a new game], its color [bg-danger]
const startBtn = document.getElementById("start-btn");
startBtn.addEventListener("click", () => {
	if (!gameStarted) {
		flipCards();
		// change the button content
		startBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Restart the Game`;
		startBtn.classList.replace("rounded-pill", "rounded");
		startBtn.classList.replace("bg-primary", "bg-danger");

		// Reset cards after 2s
		setTimeout(() => {
			resetCards();
			gameStarted = true;
		}, 1000);
	} else {
		restartGame();
	}
});

// flip all cards
function flipCards() {
	const cardElements = cardsContainer.querySelectorAll(".card");
	cardElements.forEach((card) => {
		card.classList.add("active");
	});
}

// Reset Cards
function resetCards() {
	const cardElements = cardsContainer.querySelectorAll(".card");
	cardElements.forEach((card) => {
		card.classList.remove("active");
	});
}

// to check if the 2 cards are matched or not
function isMatch() {
	const firstCard_id = firstCard.getAttribute("data-id");
	const secondCard_id = secondCard.getAttribute("data-id");
	if (firstCard_id === secondCard_id) {
		// Match found
		matched_pairs++;
		showMatchedPairs();
		matchedPairsSpan.classList.add("text-success");
		firstCard.querySelector(".front-face").classList.add("bg-green");
		secondCard.querySelector(".front-face").classList.add("bg-green");
		firstCard.setAttribute("data-match", "matched");
		secondCard.setAttribute("data-match", "matched");

		// Add matched animation
		firstCard.classList.add("matched");
		secondCard.classList.add("matched");

		// Remove animation class after animation
		setTimeout(() => {
			firstCard.classList.remove("matched");
			secondCard.classList.remove("matched");
		}, 600);
	} else {
		// No match
		firstCard.classList.add("wrong");
		secondCard.classList.add("wrong");

		setTimeout(() => {
			firstCard.classList.remove("active", "wrong");
			secondCard.classList.remove("active", "wrong");
		}, 500);
		attempts--;
		showHearts();
	}
	// Reset variables
	setTimeout(() => {
		firstCard = null;
		secondCard = null;
		isCheckingMatch = false;
	}, 500);
}

const failMatchedPairs = document.querySelector(".fail-matched-pairs");
// Fail Message
function failMsg() {
	const triggerFail = document.getElementById("trigger-fail");
	const failAttempts = document.querySelector(".fail-attempts");
	failAttempts.innerText = 5 - attempts;
	failMatchedPairs.innerText = matched_pairs;
	triggerFail.click();
}

// Success Message
function successMsg() {
	// Create confetti celebration
	createConfetti();

	const triggerSuccess = document.getElementById("trigger-success");
	const successAttempts = document.querySelector(".success-attempts");
	successAttempts.innerText = 5 - attempts;
	triggerSuccess.click();
}

// Create confetti celebration
function createConfetti() {
	const celebration = document.createElement("div");
	celebration.className = "celebration";
	document.body.appendChild(celebration);

	// Create confetti pieces
	for (let i = 0; i < 50; i++) {
		const confetti = document.createElement("div");
		confetti.className = "confetti";
		confetti.style.left = Math.random() * 100 + "%";
		confetti.style.animationDelay = Math.random() * 3 + "s";
		confetti.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
		celebration.appendChild(confetti);
	}

	// Remove confetti after animation
	setTimeout(() => {
		document.body.removeChild(celebration);
	}, 3000);
}

const closeFailMsg = document.querySelector(".close-fail-msg");
const closeSuccessMsg = document.querySelector(".close-success-msg");
restartGame_btns.forEach((btn) => {
	btn.onclick = () => {
		restartGame();
		closeFailMsg.click();
		closeSuccessMsg.click();
	};
});

// Restart the game
function restartGame() {
	attempts = 5;
	showHearts();
	matched_pairs = 0;
	matchedPairsSpan.classList.remove("text-success");
	showMatchedPairs();
	gameStarted = false;
	firstCard = null;
	secondCard = null;

	// Shuffle cards and regenerate HTML
	shuffleCards(cards);
	regenerateCards();

	startBtn.click();
}

// Function to regenerate cards with new order
function regenerateCards() {
	// Clear existing cards
	cardsContainer.innerHTML = "";

	// Generate new cards with shuffled order
	shuffleCards(cards).forEach((card) => {
		cardsContainer.innerHTML += `
			<div class="col-4 col-sm-3 col-lg-2">
				<div class="card border h-300" data-id='${card.id}'>
					<div class="front-face font-big bg-secondary h-100 w-100 d-flex justify-content-center align-items-center px-2 rounded">
						<p class="mb-0">${card.symbol}</p>
					</div>
					<div class="back-face bg-gray h-100 w-100 rounded"></div>
				</div>
			</div>
		`;
	});

	// Add game start animation class
	cardsContainer.classList.add("game-start");

	// Remove animation class after animation completes
	setTimeout(() => {
		cardsContainer.classList.remove("game-start");
	}, 1200);

	// Re-attach event listeners to new card elements
	attachCardEventListeners();
}
