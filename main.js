var currentWords = [];

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

async function play(players) {
    let playerInfoRow = document.getElementById('playerInfoRow');
    const index = await getRandomIndex();

    await getJsonIndexWord(index);
    console.log(index, playerInfoRow)

    let newInfo = ""
    for (let i = 0; i < players; i++) {
        newInfo += `<div class="col-sm text-bg-dark rounded-3">${i+1}</div>`
    }

    playerInfoRow.innerHTML = newInfo
}

async function getJsonIndexWord(index) {
    fetch('./words.json')
        .then(response => response.json())
        .then(data => {
            const word = data[index];
            console.log(word);
        })
        .catch(error => console.error('Error fetching the JSON file:', error));    
}