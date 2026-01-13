// ================= DOM =================
const play = document.getElementById("play");
const start = document.getElementById("start");
const game = document.getElementById("game");
const deal = document.getElementById("deal");
const playing = document.getElementById("playing");
const overlay = document.querySelector(".overlay");

const name = document.querySelector("#name");

play.disabled = true; // start disabled

name.addEventListener("input", function () {
    play.disabled = this.value.trim() === "";
});


let hideDealerCard = true;

const hit = document.getElementById("hit");
const stand = document.getElementById("stand");

document.documentElement.style.overflow = "hidden"; // html
document.body.style.overflow = "hidden"; // body

const computer = document.getElementById("computer_cards");
const user = document.getElementById("user_cards");

const u_score = document.getElementById("u_score");
const c_score = document.getElementById("c_score");

const moneySpan = document.getElementById("money");
const moneySpan2 = document.getElementById("money2");
const chipContainers = document.querySelectorAll(".chip-container");
const resetBtn = document.getElementById("resetBtn");

// ================= CARDS =================
const deck = [
    { src: "ace.png", value: 11 },
    { src: "two.png", value: 2 },
    { src: "tree.png", value: 3 },
    { src: "four.png", value: 4 },
    { src: "five.png", value: 5 },
    { src: "six.png", value: 6 },
    { src: "seven.png", value: 7 },
    { src: "eight.png", value: 8 },
    { src: "nine.png", value: 9 },
    { src: "ten.png", value: 10 },
    { src: "j.png", value: 10 },
    { src: "q.png", value: 10 },
    { src: "k.png", value: 10 }
];

let user_cards = [];
let computer_cards = [];

// ================= MONEY =================
let totalMoney = 1000;
let currentBet = 0; 
const chipCounts = {};

moneySpan.textContent = totalMoney;
moneySpan2.textContent = 0;

// ================= FUNCTIONS =================
function deal_card() {
    return { ...deck[Math.floor(Math.random() * deck.length)] };
}

function calculate_score(cards) {
    let score = 0;
    let aces = 0;

    for (let card of cards) {
        score += card.value;
        if (card.value === 11) aces++;
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    if (score === 21 && cards.length === 2) return 0;
    return score;
}

function updateUI() {
    user.innerHTML = user_cards
        .map(c => `<img src="${c.src}">`)
        .join("");

    computer.innerHTML = computer_cards
        .map((c, i) => {
            if (i === 0 && hideDealerCard) {
                return `<img src="back.jfif">`;
            }
            return `<img src="${c.src}">`;
        })
        .join("");

    u_score.textContent = calculate_score(user_cards);
    c_score.textContent = hideDealerCard ? "?" : calculate_score(computer_cards);
}

function resetRound() {
        hideDealerCard = true;   // ✅ RESET dealer card

    overlay.style.display = "none";
    playing.style.display = "none";
    game.style.display = "flex";
    deal.style.display = "block";
    user_cards = [];
    computer_cards = [];

    currentBet = 0;
    moneySpan2.textContent = 0;

    for (let v in chipCounts) chipCounts[v] = 0;
    chipContainers.forEach(c => c.querySelector(".chip-count").textContent = 0);
}

function endGame(message, moneyChange = 0) {
    overlay.style.display = "flex";
    overlay.innerHTML = `<p>${message}</p><button class="another">Play again</button>`;

    totalMoney += moneyChange;
    moneySpan.textContent = totalMoney;
    moneySpan2.textContent = 0;
    currentBet = 0;

    document.querySelector(".another").onclick = resetRound;
}

function decideWinner() {
    const u = calculate_score(user_cards);
    const c = calculate_score(computer_cards);

    if (u === c) {    
        hideDealerCard = false;return endGame("Draw");}
    if (c === 0) {    
        hideDealerCard = false;return endGame("You lose (Dealer Blackjack)", -currentBet);}
    if (u === 0) {    
        hideDealerCard = false;return endGame("You win (Blackjack!)", currentBet);}
    if (u > 21){    
        hideDealerCard = false;
        
         return endGame("You lose (Bust)", -currentBet);
    }
    if (c > 21) {    
        hideDealerCard = false;return endGame("You win (Dealer bust)", currentBet);}
    if (u > c) {    
        hideDealerCard = false;return endGame("You win", currentBet);}
    updateUI()
    endGame("You lose", -currentBet);
}

// ================= EVENTS =================
play.onclick = () => {
    
    localStorage.setItem("username", name.value);

    start.style.display = "none";
    play.style.display = "none";
    game.style.display = "flex";
    deal.style.display = "block";
    
};

deal.onclick = () => {
    document.documentElement.style.overflow = "unset"; // html
document.body.style.overflow = "unset"; // body
        hideDealerCard = true; // ✅ ensure hidden on deal

    if (totalMoney === 0) return alert("You lost all your money!");
    if (currentBet === 0) return alert("Choose your bet!");

    game.style.display = "none";
    deal.style.display = "none";
    playing.style.display = "block";

    user_cards.push(deal_card(), deal_card());
    computer_cards.push(deal_card(), deal_card());

    updateUI();

    if (calculate_score(user_cards) === 0)
        endGame("You win (Blackjack!)", currentBet);
    else if (calculate_score(computer_cards) === 0) {
    hideDealerCard = false;
    updateUI(); // ✅ reveal dealer blackjack
    endGame("Computer wins (Blackjack)", -currentBet);
}
};

hit.onclick = () => {
    user_cards.push(deal_card());
    updateUI();

    if (calculate_score(user_cards) > 21) {
    hideDealerCard = false;

   

    updateUI(); // ✅ REVEAL DEALER CARD
    endGame("You lose (Bust)", -currentBet);
}
};

stand.onclick = () => {
        hideDealerCard = false;

    while (calculate_score(computer_cards) < 17) {
        computer_cards.push(deal_card());
    }
    updateUI();
    decideWinner();
};

// ================= BETTING =================
chipContainers.forEach(container => {
    const img = container.querySelector("img");
    const countSpan = container.querySelector(".chip-count");
    const value = parseInt(img.dataset.value);

    chipCounts[value] = 0;

    img.onclick = () => {
        if (currentBet + value <= totalMoney) {
            chipCounts[value]++;
            currentBet += value;
            countSpan.textContent = chipCounts[value];
            moneySpan.textContent = totalMoney - currentBet;
            moneySpan2.textContent = currentBet;
        }
    };

    countSpan.onclick = () => {
        if (chipCounts[value] > 0) {
            chipCounts[value]--;
            currentBet -= value;
            countSpan.textContent = chipCounts[value];
            moneySpan.textContent = totalMoney - currentBet;
            moneySpan2.textContent = currentBet;
        }
    };
});

resetBtn.onclick = () => {
    currentBet = 0;
    moneySpan.textContent = totalMoney;
    moneySpan2.textContent = 0;

    for (let v in chipCounts) chipCounts[v] = 0;
    chipContainers.forEach(c => c.querySelector(".chip-count").textContent = 0);
};

fetch("https://sharemydocs.lovestoblog.com/get_scores.php")
  .then(res => res.json())
  .then(data => {
      const table = document.getElementById("scoreTable");
      table.innerHTML = "";

      if (data.length > 0) { // check if array has elements
          data.forEach((row) => {
              table.innerHTML += `
                  <tr>
                      <td>${row.player_name}</td>
                      <td>${row.score}</td>
                  </tr>
              `;
          });
      } else {
          table.innerHTML = `<tr><td colspan="2">No scores yet</td></tr>`;
      }
  })
  .catch(err => console.error(err));



