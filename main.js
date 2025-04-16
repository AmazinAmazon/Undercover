var currentWords = [];
var roles = [];
var currentPlayer = 1;
var currentTurn = 1;

async function getWordsLength() {
    try {
        const response = await fetch('./words_en.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        console.log('Length of words object:', Object.keys(words).length);
    } catch (error) {
        console.error('Error fetching or parsing the JSON file:', error);
    }
}

async function getRandomIndex() {
    try {
        const response = await fetch('./words_en.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        const wordKeys = Object.keys(words);
        return Math.floor(Math.random() * wordKeys.length);
    } catch (error) {
        console.error('Error fetching or parsing the JSON file:', error);
        return -1;
    }
}

function clickPlayer(player) {
    console.log(player)
    if (currentTurn / 2 < roles.length || roles.length == 0) {
        alert(`You can only check the player's role after the game is over!`)
    }
}

async function play(citizens, undercover, whites) {

    // Todo: Add game checks here
    // Check if players are valid numbers 
    // Check if there are more citizens than undercovers

    const players = citizens + undercover + whites; 
    roles = []; // Reset roles array

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

    for (let i = 0; i < roles.length; i++) {
        roles[i] = (i+1) + roles[i];  // Adding player order to roles
    }

    shuffleRoles(roles);

    // White cannot be the first player
    if (roles[0].includes("white")) {
        // Find first non-white role to swap with
        for (let i = 1; i < roles.length; i++) {
            if (!roles[i].includes("white")) {
                [roles[0], roles[i]] = [roles[i], roles[0]];
                break;
            }
        }
    }

    console.log(roles)

    playerInfo.textContent = `Player order: `;
    for (let i = 0; i < roles.length; i++) {
       playerInfo.textContent += `| ${roles[i].slice(0, 1)} `;
    }
    playerInfo.textContent += `| Click on a player number to reveal their role!`;

    alert(`Finished distributing roles!`);

    // TODO: Code to reveal player roles

}


async function getJsonIndexWord(index) {
    fetch('./words_en.json')
        .then(response => response.json())
        .then(data => {
            const word = data[index];
            currentWords = word;
        })
        .catch(error => console.error('Error fetching the JSON file:', error));    
}