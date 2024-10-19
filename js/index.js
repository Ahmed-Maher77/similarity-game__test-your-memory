// array of cards
let attempts = 5;
let matched_pairs = 0;
class Card {
    constructor(id, symbol) {
        this._id = id;
        this._symbol = symbol;
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
	new Card(4, "🐱")
];


// Attempts
const heartsContainer = document.querySelector('.hearts');
function showHearts() {
    heartsContainer.innerHTML = '';
    for (let i = 0; i < attempts; i++) {
        const heart = document.createElement('i');
        heart.className = "fa-solid fa-heart fs-4 text-danger pe-1";
        heartsContainer.appendChild(heart);
    }
    if (attempts <= 0) {
        setTimeout(() => {
            failMsg()
        }, 500);
    }
}
showHearts();


// Matched Pairs
const matchedPairsSpan = document.querySelector('.matched-pairs span');
function showMatchedPairs() {
    matchedPairsSpan.innerText = matched_pairs;
    successMsg()
}
showMatchedPairs()


// loop over cards >> create each card >> append to its parent
const cardsContainer = document.querySelector(".cards");
cards.forEach((card) => {
	cardsContainer.innerHTML += `
        <div class="col-6 col-sm-4 col-lg-3 col-xl-2">
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
const startBtn = document.getElementById('start-btn');
const cardElements = cardsContainer.querySelectorAll('.card');
startBtn.addEventListener('click', () => {
    // flip all cards
    cardElements.forEach(card => {
        card.classList.add('active');
    });
    // change the button content
    startBtn.innerText = 'Restart the Game';
    startBtn.classList.replace('bg-primary', 'bg-danger');
    // Reset cards after 2s
    setTimeout(() => {
        resetCards()
    }, 2000);
})

// Reset Cards
function resetCards() {
    cardElements.forEach(card => {
        card.classList.remove('active');
    })
}

// when click on each card
let firstCard, secondCard;
cardElements.forEach(card => {
    card.onclick = function() {
        card.classList.add('active');
        if (!firstCard) {
            firstCard = card
        } else {
            secondCard = card
        };

        if (card.getAttribute('data-match') !== 'matched') {
            if (firstCard && secondCard) isMatch()
        }
        
    }
})

// to check if the 2 cards are matched or not
function isMatch() {
    const firstCard_id = firstCard.getAttribute('data-id');
    const secondCard_id = secondCard.getAttribute('data-id');
    if (firstCard_id === secondCard_id) {
        matched_pairs++;
        showMatchedPairs();
        matchedPairsSpan.classList.add('text-success');
        firstCard.querySelector('.front-face').classList.add('bg-green');
        secondCard.querySelector('.front-face').classList.add('bg-green');
        firstCard.setAttribute('data-match', 'matched');
        secondCard.setAttribute('data-match', 'matched');
        console.log(secondCard);
        
    } else {
        setTimeout(() => {
            firstCard.classList.remove('active');
            secondCard.classList.remove('active');
        }, 500);
        attempts--;
        showHearts()
    }
    // Reset variables
    setTimeout(() => {
        firstCard = null;
        secondCard = null;
    }, 500);
}


// Fail Message
function failMsg() {
    // You lost 😥
    // Matched Pairs
    // Try Again
}

// Success Message
function showMatchedPairs() {

}


// when click on [start a new game]

// when click on any card before starting the game

// attempts <= 0   => pop-up
// matched_pairs >= cards.length / 2   => pop-up
