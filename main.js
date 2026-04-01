var currentWords = [];
var roles = [];
var currentPlayer = 1;
var currentTurn = 1;
var currentLanguage = "en";
var revealedPlayers = new Set();

function setLanguage(language) {
    currentLanguage = language;
}

function getRevealMessageElement() {
    return document.getElementById("revealMessage");
}

function showRevealMessage(message) {
    const revealMessage = getRevealMessageElement();
    if (!revealMessage) return;
    revealMessage.textContent = message;
    revealMessage.classList.remove("d-none");
}

function clearRevealMessage() {
    const revealMessage = getRevealMessageElement();
    if (!revealMessage) return;
    revealMessage.textContent = "";
    revealMessage.classList.add("d-none");
}

function getUsedWordIndexes() {
    const sessionKey = `usedWordIndexes_${currentLanguage}`;
    const stored = sessionStorage.getItem(sessionKey);
    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function setUsedWordIndexes(indexes) {
    const sessionKey = `usedWordIndexes_${currentLanguage}`;
    sessionStorage.setItem(sessionKey, JSON.stringify(indexes));
}

async function fetchWordsData() {
    const response = await fetch(`./words_${currentLanguage}.json`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function getWordsLength() {
    try {
        const words = await fetchWordsData();
        console.log('Length of words object:', Object.keys(words).length);
    } catch (error) {
        console.error('Error fetching or parsing the JSON file:', error);
    }
}

async function getRandomIndex() {
    try {
        const words = await fetchWordsData();
        const wordsLength = words.length;
        let usedIndexes = getUsedWordIndexes();
        let availableIndexes = [];

        for (let i = 0; i < wordsLength; i++) {
            if (!usedIndexes.includes(i)) {
                availableIndexes.push(i);
            }
        }

        if (availableIndexes.length === 0) {
            usedIndexes = [];
            setUsedWordIndexes(usedIndexes);
            for (let i = 0; i < wordsLength; i++) {
                availableIndexes.push(i);
            }
        }

        const randomAvailableIndex = Math.floor(Math.random() * availableIndexes.length);
        const selectedIndex = availableIndexes[randomAvailableIndex];

        usedIndexes.push(selectedIndex);
        setUsedWordIndexes(usedIndexes);

        return selectedIndex;
    } catch (error) {
        console.error('Error fetching or parsing the JSON file:', error);
        return -1;
    }
}

function clickPlayer(player) {
    console.log(player)
    if (currentTurn / 2 < roles.length || roles.length == 0) {
        showRevealMessage(`You can only check player roles after the game is over.`)
        return;
    }

    const role = roles[player - 1];
    if (!role) {
        return;
    }

    const playerButton = document.getElementById(`player${player}`);

    if (revealedPlayers.has(player)) {
        return;
    }

    if (role === "citizen") {
        showRevealMessage(`Player ${player} is a Citizen.`);
        playerButton.className = "btn btn-sm btn-primary p-2";
    } else if (role === "undercover") {
        showRevealMessage(`Player ${player} is the Undercover.`);
        playerButton.className = "btn btn-sm btn-danger p-2";
    } else if (role === "white") {
        showRevealMessage(`Player ${player} is Mr. White.`);
        playerButton.className = "btn btn-sm btn-light text-dark p-2";
    }

    revealedPlayers.add(player);
}

async function play(citizens, undercover, whites) {

    // Todo: Add game checks here
    // Check if players are valid numbers 
    // Check if there are more citizens than undercovers

    const players = citizens + undercover + whites; 
    roles = []; // Reset roles array
    revealedPlayers.clear();
    currentPlayer = 1;
    currentTurn = 1;
    clearRevealMessage();

    currentWords = []; // Reset currentWords array
    const wordIndex = await getRandomIndex(); // Get a random index
    // Todo : Check if player already played with these words

    await getJsonIndexWord(wordIndex)

    // Add the correct number of players to the playerInfoRow
    let playerInfoRow = document.getElementById('playerInfoRow');
    let newInfo = ""
    for (let i = 0; i < players; i++) {
        if (i === 0) {
            newInfo += `<div class="col-sm d-grid p-0"><button class="btn btn-sm btn-success p-2" onclick="clickPlayer(${i+1})" id="player${i+1}">${i+1}</button></div>`
            
        } else {
            newInfo += `<div class="col-sm d-grid p-0"><button class="btn btn-sm btn-dark p-2" onclick="clickPlayer(${i+1})" id="player${i+1}">${i+1}</button></div>`
        }
    }
    playerInfoRow.innerHTML = newInfo
    document.getElementById('inputsDiv').classList.add('d-none')
    document.getElementById('playerInfo').classList.remove('d-none')

    // Assign a role to each player
    for (let i = 0; i < citizens; i++) roles.push("citizen");
    for (let i = 0; i < undercover; i++) roles.push("undercover");
    for (let i = 0; i < whites; i++) roles.push("white");

    // Shuffle roles using Fisher-Yates Shuffle
    console.log(roles)
    shuffleRoles(roles)

    // If "white" is at the beginning, swap it with a non-white role
    console.log(roles);

}

function restartGame() {
    roles = [];
    currentWords = [];
    currentPlayer = 1;
    currentTurn = 1;
    revealedPlayers.clear();

    const playerInfoRow = document.getElementById('playerInfoRow');
    playerInfoRow.innerHTML = "";

    const playerInfo = document.getElementById("wordContainer").firstElementChild;
    playerInfo.textContent = "";

    clearRevealMessage();

    document.getElementById('playerInfo').classList.add('d-none');
    document.getElementById('inputsDiv').classList.remove('d-none');
}

function shuffleRoles(roles) {
    for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
    }
}

function ready() {
    const wordContainer = document.getElementById("wordContainer")

    // Check if the first child exists and is a paragraph
    if (wordContainer.firstElementChild.textContent !== "") {
        currentTurn += 1;
    }
    const playerInfo = wordContainer.firstElementChild;

    console.log(currentPlayer)

    if (currentTurn / 2 >= roles.length){ // Finished distributing roles
        document.getElementById(`player${roles.length}`).className = "btn btn-sm btn-dark p-2"
        finishedDistributing();
        // Give player order
    } else if (currentTurn%2 == 0 && currentTurn / 2 < roles.length) {
        playerInfo.textContent = `Please pass the phone to the next player!`;
        currentPlayer += 1;
    } else if (roles[currentPlayer-1] == "citizen") {
        playerInfo.textContent = `Player ${currentPlayer}: Your word is ${currentWords["citizen"]};`

        document.getElementById(`player${currentPlayer}`).className = "btn btn-sm btn-success p-2"
        if (currentPlayer > 1) {
            document.getElementById(`player${currentPlayer-1}`).className = "btn btn-sm btn-dark p-2"
        }
    } else if (roles[currentPlayer-1] == "undercover") {
        playerInfo.textContent = `Player ${currentPlayer}: Your word is ${currentWords["undercover"]};`

        document.getElementById(`player${currentPlayer}`).className = "btn btn-sm btn-success p-2"
        if (currentPlayer > 1) {
            document.getElementById(`player${currentPlayer-1}`).className = "btn btn-sm btn-dark p-2"
        }
    } else if (roles[currentPlayer-1] == "white") {
        playerInfo.textContent = `Player ${currentPlayer}: You're Mr White. You don't have any word, you'll have to bluff!;`

        document.getElementById(`player${currentPlayer}`).className = "btn btn-sm btn-success p-2"
        if (currentPlayer > 1) {
            document.getElementById(`player${currentPlayer-1}`).className = "btn btn-sm btn-dark p-2"
        }
    } 
    console.log(currentTurn, currentPlayer)
}

function finishedDistributing() {
    const playerInfo = document.getElementById("wordContainer").firstElementChild
    const speakingOrder = [];

    for (let i = 0; i < roles.length; i++) {
        speakingOrder.push((i + 1) + roles[i]);
    }

    shuffleRoles(speakingOrder);

    // White cannot be the first player
    if (speakingOrder[0].includes("white")) {
        // Find first non-white role to swap with
        for (let i = 1; i < speakingOrder.length; i++) {
            if (!speakingOrder[i].includes("white")) {
                [speakingOrder[0], speakingOrder[i]] = [speakingOrder[i], speakingOrder[0]];
                break;
            }
        }
    }

    console.log(speakingOrder)

    playerInfo.textContent = `Player order: `;
    for (let i = 0; i < speakingOrder.length; i++) {
       playerInfo.textContent += `| ${speakingOrder[i].slice(0, 1)} `;
    }
    playerInfo.textContent += `| Click on a player number to reveal their role!`;

    showRevealMessage(`Finished distributing roles. Click a player number to reveal their role.`);

    // TODO: Code to reveal player roles

}


async function getJsonIndexWord(index) {
    fetch(`./words_${currentLanguage}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const word = data[index];
            currentWords = word;
        })
        .catch(error => console.error('Error fetching the JSON file:', error));    
}