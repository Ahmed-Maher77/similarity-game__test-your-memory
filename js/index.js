let attempts = 5;
let matched_pairs = 0;
let gameStarted = false;
// flag to temporarily disable clicks while the match check is in progress
let isCheckingMatch = false;
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
	new Card(5, "🤷‍♀️")
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
const shuffleCards = (els) => els.sort(() => 0.5 - Math.random()).sort(() => 0.5 - Math.random());


// loop over cards >> create each card >> append them to their parent
const cardsContainer = document.querySelector(".cards");
shuffleCards(cards).forEach((card) => {
	cardsContainer.innerHTML += `
        <div class="col-4 col-sm-3 col-lg-2">
            <div class="card border h-300" data-id='${card.id}'>
                <div class="front-face font-big bg-secondary h-100 w-100 d-flex justify-content-center align-items-center px-2 rounded">
                    <p>${card.symbol}</p>
                </div>
                <div class="back-face bg-gray h-100 w-100 rounded"></div>
            </div>
        </div>
    `;
});


// when click the start button >> change its content [start a new game], its color [bg-danger]
const startBtn = document.getElementById("start-btn");
const cardElements = cardsContainer.querySelectorAll(".card");
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

// Adjust Cusror Status
cardElements.forEach((card) => {
	card.onmouseover = () => {
		if (gameStarted && !card.classList.contains("active")) {
			card.style.cursor = "pointer";
		} else {
			card.style.cursor = "not-allowed";
		}
	};
});

// flip all cards
function flipCards() {
	cardElements.forEach((card) => {
		card.classList.add("active");
	});
}

// Reset Cards
function resetCards() {
	cardElements.forEach((card) => {
		card.classList.remove("active");
	});
}

// when click on each card
let firstCard, secondCard;
cardElements.forEach((card) => {
	card.onclick = function () {
		if (gameStarted  && !isCheckingMatch && card.getAttribute("data-match") !== "matched") {
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

// to check if the 2 cards are matched or not
function isMatch() {
	const firstCard_id = firstCard.getAttribute("data-id");
	const secondCard_id = secondCard.getAttribute("data-id");
	if (firstCard_id === secondCard_id) {
		matched_pairs++;
		showMatchedPairs();
		matchedPairsSpan.classList.add("text-success");
		firstCard.querySelector(".front-face").classList.add("bg-green");
		secondCard.querySelector(".front-face").classList.add("bg-green");
		firstCard.setAttribute("data-match", "matched");
		secondCard.setAttribute("data-match", "matched");
	} else {
		setTimeout(() => {
			firstCard.classList.remove("active");
			secondCard.classList.remove("active");
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


const failMatchedPairs = document.querySelector('.fail-matched-pairs');
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
	const triggerSuccess = document.getElementById("trigger-success");
	const successAttempts = document.querySelector(".success-attempts");
	successAttempts.innerText = 5 - attempts;
	triggerSuccess.click();
}

const closeFailMsg = document.querySelector('.close-fail-msg');
const closeSuccessMsg = document.querySelector('.close-success-msg');
restartGame_btns.forEach(btn => {
	btn.onclick = () => {
		restartGame();
		closeFailMsg.click();
		closeSuccessMsg.click();
	};
})

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
    // Reset the card elements
	cardElements.forEach((card) => {
        card.classList.remove("active");
		card.querySelector(".front-face").classList.remove("bg-green");
		card.setAttribute("data-match", "");
	});
    // Reset the start button
    startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start Game`;
    startBtn.classList.replace("bg-danger", "bg-primary");
    startBtn.classList.replace("rounded", "rounded-pill");
    // shuffleCards(cards);
	startBtn.click();
}
