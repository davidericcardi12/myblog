"use strict"


window.onload = function (){

    let nWords = parseInt(document.getElementById("inp-txt_char").value);
    let shift = parseInt(document.getElementById("inp-txt_shift").value);

    // URL del file da scaricare
    const fileUrl = 'https://raw.githubusercontent.com/davidericcardi12/myblog/refs/heads/main/mytext.txt';

    // Carica il file .txt tramite fetch

    let chaart1;
    let chaart2;

    let makechartBar1 = function(frequency){
        const canvas = document.getElementById("chartBar1"); // Ottieni il canvas per l'ID
        if(chaart1)
            chaart1.destroy();
         // pulisci il canvas prima di creare un nuovo grafico
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Prepara i dati per il grafico
        const labels = [];
        const data = [];

        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(97 + i); // 'a' è 97 in ASCII
            labels.push(char);
            data.push(frequency[char] || 0); // Se non esiste il carattere, metti 0
        }

        let label;
        let backgroundColor;
        
        label = "Original Char Frequency"
        backgroundColor = 'rgba(75, 192, 192)';

        console.log("INIZIALIZZAZIONE CHARTBAR 1");
        console.log(chaart1);
        chaart1 = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        console.log(chaart1);
    }

    let makechartBar2 = function(frequency){
        const canvas = document.getElementById("chartBar2"); // Ottieni il canvas per l'ID
        if(chaart2)
            chaart2.destroy();
         // pulisci il canvas prima di creare un nuovo grafico
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Prepara i dati per il grafico
        const labels = [];
        const data = [];

        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(97 + i); // 'a' è 97 in ASCII
            labels.push(char);
            data.push(frequency[char] || 0); // Se non esiste il carattere, metti 0
        }

        let label;
        let backgroundColor;
        label = "Cypher Char Frequency";
        backgroundColor = 'rgba(153, 102, 255, 0.7)'

        console.log("INIZIALIZZAZIONE CHARTBAR 2");
        console.log(chaart2);
        chaart2 = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        console.log(chaart2);
    }
    
    // Decrypt message just using the frequency
    let decryptMessage = function(frequencyOriginal, frequencyCypher){
        console.log("decrypting message");

        const alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 
            'u', 'v', 'w', 'x', 'y', 'z'
        ];
        let length = alphabet.length;
        let shift;

        let potentialShift = 0;
        let winner = 0;
        for(let i=0; i<length && winner == 0; i++){
            let matching = 1;
            for(let k=0; k<length && matching == 1; k++){
                let currentCharOriginal = alphabet[k];
                //console.log("current char original: " + currentCharOriginal);
                let currentCharCypher = alphabet[ ( ((k+potentialShift)%26) + 26) % 26];
                //console.log("current char cyber: " + currentCharCypher);
                if(frequencyOriginal[currentCharOriginal] != frequencyCypher[currentCharCypher]){
                    matching = 0;
                }
            }
            if(matching == 1){
                winner = 1;
                shift = potentialShift;
            }
            potentialShift++;
        }
        return shift;    
    }

    let portionText;
    let portionTextEncrypted;
    let frequencyOriginal;
    let frequencyCypher;

    let scrollableContainerOriginal = document.querySelectorAll(".scrollable-text")[0];
    let scrollableContainerCypher = document.querySelectorAll(".scrollable-text")[1];

    let generateRandom = function(text, nWords,shift){
        console.log("GENERATE RANDOM");
        console.log(cb1);
        console.log(cb2);
        portionText = getRandomPortion(text, nWords);
        scrollableContainerOriginal.textContent = portionText;
        //console.log(portionText);
        portionTextEncrypted = caesarChifer(portionText, shift);
        scrollableContainerCypher.textContent = portionTextEncrypted;
        //console.log(portionTextEncrypted);
        frequencyOriginal =  characterFrequency(portionText);
        makechartBar1(frequencyOriginal);
        frequencyCypher = characterFrequency(portionTextEncrypted);
        makechartBar2(frequencyCypher);
        //scrivi il calcolo di decryptMesssage nel description-code element
        let shiftValue = decryptMessage(frequencyOriginal, frequencyCypher);
        let dd = document.getElementById("description-code");
        dd.querySelector("b").textContent = `Running code -> SHIFT = ${shiftValue}`;
        console.log("END GENERATE")
    }


    let cb1 ;
    let cb2 ;
    
    fetch(fileUrl)
        .then(response => response.text())  // Converte la risposta in testo
        .then(text => {
            console.log("FETCHATO FILE");  // Mostra il contenuto del file nella console
            console.log("DICHIARAZIONE CHARTBAR 1");
            console.log("DICHIARAZIONE CHARTBAR 2");
           generateRandom(text, nWords, shift);
           let btn = document.querySelector(".btn-make");
            btn.addEventListener("click", function(){
                console.log("RUNNING LISTNER")
                console.log(cb1);
                console.log(cb2);
                nWords = parseInt(document.getElementById("inp-txt_char").value);
                shift = parseInt(document.getElementById("inp-txt_shift").value);
                //checkInput(nWords, shift);
                generateRandom(text, nWords, shift);
                console.log("END LISTNER")
            });
            console.log("ADDED LISTNER TO BUTTON")
        })
        .catch(error => {
            console.error('Errore nel caricamento del file .txt:', error);
        });

}

function getRandomPortion(text, wordsNumber){
    const wordsList = extractWords(text)
    const n = wordsList.length;
    const start = getRandomNumber(0, n);
    const end = start + wordsNumber;
    const w = joinWords(wordsList, start, end);
    return w.toLowerCase().replace(/[^a-z\s]/g, '');
}

function getRandomNumber(j, k) {
    return Math.floor(Math.random() * (k - j + 1)) + j;
}

function extractWords(text) {
    // Usa una regex per trovare tutte le sequenze di caratteri che sono parole (alfabetiche o con apostrofi)
    return text.match(/\b\w+\b/g) || [];
}

function joinWords(words, start, end) {
    // Usa slice per ottenere la sottolista di parole
    let slicedWords = words.slice(start, end);
    // Unisce le parole in una singola stringa con uno spazio tra di esse
    return slicedWords.join(' ');
}

function caesarChifer(text, shift){
    const base = 97;
    let cypherText = "";
    text.split('').forEach(char => {
        // Trova il codice ASCII del carattere
        let newChar;
        if(char == ' '){
            newChar = ' ';
        }
        else{
            let charCode = char.charCodeAt(0);
            // Calcola il nuovo carattere shiftato, usando modulo 26 per mantenere il ciclo dell'alfabeto
            newChar = String.fromCharCode((charCode - base + shift) % 26 + base);
        }
        cypherText += newChar;
    });
    return cypherText;
}

function characterFrequency(text) {
    const frequency = {};
    // Itera su ogni carattere della stringa
    for (let char of text) {    
        frequency[char] = (frequency[char] || 0) + 1;
    }
    return frequency;
}