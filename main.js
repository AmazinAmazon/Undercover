var currentWords = [];
var roles = [];
var currentPlayer = 1;
var currentTurn = 1;

async function getWordsLength() {
    try {
        const response = await fetch('./words.json');
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
        const response = await fetch('./words.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        const wordKeys = Object.keys(words);
        const randomIndex = Math.floor(Math.random() * wordKeys.length);
        return randomIndex;
    } catch (error) {
        console.error('Error fetching or parsing the JSON file:', error);
        return -1;
    }
}

function clickPlayer(player) {
    console.log(currentTurn, roles.length)
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
    await getJsonIndexWord(wordIndex)

    // Add the correct number of players to the playerInfoRow
    let playerInfoRow = document.getElementById('playerInfoRow');
    let newInfo = ""
    for (let i = 0; i < players; i++) {
        if (i == 0) {
            newInfo += `<div class="col-sm d-grid p-0"><button class="btn btn-sm btn-success p-0" onclick="clickPlayer(${i+1})">${i+1}</button></div>`
            
        } else {
            newInfo += `<div class="col-sm d-grid p-0"><button class="btn btn-sm btn-dark p-0" onclick="clickPlayer(${i+1})">${i+1}</button></div>`
        }
    }
    playerInfoRow.innerHTML = newInfo

    // Assign a role to each player

    for (let i = 0; i < citizens; i++) roles.push("citizen");
    for (let i = 0; i < undercover; i++) roles.push("undercover");
    for (let i = 0; i < whites; i++) roles.push("white");

    // Shuffle roles using Fisher-Yates Shuffle
    for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    // If "white" is at the beginning, swap it with a non-white role
    if (roles[0] === "white") {
        // Find first non-white role to swap with
        for (let i = 1; i < roles.length; i++) {
            if (roles[i] !== "white") {
                [roles[0], roles[i]] = [roles[i], roles[0]];
                break;
            }
        }
    }

    console.log(roles);

}

function ready() {
    const infoSection = document.getElementById("wordContainer")

    // Check if the first child exists and is a paragraph
    if (infoSection.firstElementChild.textContent != "") {
        currentTurn += 1;
    }
    var playerInfo = infoSection.firstElementChild;

    console.log(currentPlayer)

    if (currentTurn / 2 >= roles.length){
        playerInfo.textContent = `Finished distributing roles!`;
        // Give player order
    } else if (currentTurn%2 == 0 && currentTurn / 2 < roles.length) {
        playerInfo.textContent = `Please pass the phone to the next player!`;
        currentPlayer += 1;
    } else if (roles[currentPlayer-1] == "citizen") {
        playerInfo.textContent = `Player ${currentPlayer}: Your word is ${currentWords["citizen"]};`
    } else if (roles[currentPlayer-1] == "undercover") {
        playerInfo.textContent = `Player ${currentPlayer}: Your word is ${currentWords["undercover"]};`
    } else if (roles[currentPlayer-1] == "white") {
        playerInfo.textContent = `Player ${currentPlayer}: You're Mr White. You don't have any word, you'll have to bluff!;`
    } 
    console.log(currentTurn, currentPlayer)
}

async function getJsonIndexWord(index) {
    fetch('./words.json')
        .then(response => response.json())
        .then(data => {
            const word = data[index];
            currentWords = word;
        })
        .catch(error => console.error('Error fetching the JSON file:', error));    
}