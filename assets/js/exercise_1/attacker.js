"use strict"

window.onload = function (){

    let n = (document.querySelector(".inp-txt_n")).value; 
    let m = (document.querySelector(".inp-txt_m")).value; 
    let p = (document.querySelector(".inp-txt_p")).value; 

    let hackers = []
    let init = function(n,m,p){
        /*** INIT HACKERS ***/
        hackers = []
        for(let i=0; i<m; i++){
            hackers[i] = getHacker();
        }
        /*** END ***/

        /*** TRY TO ATTACK  ***/
        for (let i=0; i<m; i++){
            console.log("Hacker " + (i+1));
            for (let j=0; j<n; j++){
                console.log("try to attack");
                hackers[i].tryToAttack(p);
            }
            console.log(hackers[i].success);
        }
        /*** END ***/
    }
    init(n,m,p);

    let attackChart;
    let histogramChart;

    let makeGraphicA = function (n,m, legendThreshold = 20) {

        if(attackChart)
            attackChart.destroy();
    
        // Array bidimensionale per rappresentare attacchi di più hacker
        let attacks = [];
        hackers.forEach(function(hacker){
            attacks.push(hacker.success);
        });
    
        console.log(attacks);

        const colors = generateColors(attacks.length);

    // Dati per ogni hacker
    let datasets = [];

    attacks.forEach((hackerAttacks, index) => {
        let data = [0];  // Ogni hacker parte con un attacco iniziale (0,0)
        
        for (let i = 0; i < hackerAttacks.length; i++) {
            if (hackerAttacks[i] === 1) {
                data.push(data[data.length - 1] + 1);  // Successo: aggiunge 1
            } else {
                data.push(data[data.length - 1]);  // Fallimento: linea piatta
            }
        }

        // Aggiungi i dati dell'hacker nel dataset
        datasets.push({
            label: `Hacker ${index + 1}`,
            data: data,
            borderColor: colors[index % colors.length],
            fill: false,
            tension: 0,  // Linea spezzata (senza curve)
            pointRadius: 5,
            pointBackgroundColor: colors[index % colors.length],
        });
    });

    const shouldDisplayLegend = m <= 20;
    // Configurazione del grafico
    const ctx = document.getElementById('attackChart').getContext('2d');
    attackChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...Array(attacks[0].length + 1).keys()], // Asse X: da 0 a n server
            datasets: datasets
        },
        options: {
            plugins: {
                legend: {
                    display: shouldDisplayLegend
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Server'
                    }
                },
                y: {
                    min: 0,
                    max: parseInt(n),
                    title: {
                        display: true,
                        text: 'Level'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1  // Incremento di 1 unità
                    }
                }
            }
        }
    });
 }

 let makeHistogram = function createHistogram() {

    if(histogramChart)
        histogramChart.destroy();

    let attacks = [];
        hackers.forEach(function(hacker){
            attacks.push(hacker.success);
        });


    // Calcola la percentuale di hacker che hanno raggiunto almeno un certo livello di server
    let labels = [];
    let penetrationCounts = new Array(attacks[0].length);
    for(let i=0; i<penetrationCounts.length; i++){
        penetrationCounts[i] = 0;
        labels.push(i);
    }
    labels.push(attacks[0].length);

    let successes = [];
    attacks.forEach(hackerAttacks => {
        let sum_succ = 0;
        hackerAttacks.forEach((attack, index) => {
            sum_succ += attack;
        });
        successes.push(sum_succ);
        penetrationCounts[sum_succ]+=1;
    });

    let sum = 0;
    successes.forEach(function(value){
        sum += value;
    });
    let average = sum / successes.length;
    console.log("media "+average);

    // Calcola le percentuali
    const percentages = penetrationCounts.map(count => (count / hackers.length) * 100);
    console.log("percentuali "+percentages);

    const ctx = document.getElementById('prolongationChart').getContext('2d');
    histogramChart = new Chart(ctx, {
        type: 'bar', // Tipo di grafico
        data: {
            labels: labels, // Etichette sull'asse X
            datasets: [{
                label: 'Level reached by how many hackers',
                data: percentages, // Dati per l'asse Y
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Colore di riempimento
                borderColor: 'rgba(75, 192, 192, 1)', // Colore del bordo
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true, // Inizia l'asse Y da zero
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value, index, values) {
                            // Cambia le etichette qui
                            return value + '%'; // Aggiungi "unità" a ogni valore
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            return 'Hacker: ' + value + '%'; // Aggiunge "%" al valore
                        }
                    }
                }
            }
        },
    });

    let dd = document.getElementById("average");
    dd.innerHTML = "Average penetration: " + average;
 }



    makeGraphicA(n,m);
    makeHistogram();

        let btn_make = document.querySelector(".btn-make");
        btn_make.addEventListener("click", function(event){
            event.preventDefault();
            let n = (document.querySelector(".inp-txt_n")).value; 
            let m = (document.querySelector(".inp-txt_m")).value; 
            let p = (document.querySelector(".inp-txt_p")).value; 
            init(n,m,p);
            makeGraphicA(n,m)
            makeHistogram();
        });
}
    
    



function getHacker(){
    let hacker = new Object();

    hacker.success = [];

    hacker.tryToAttack = function (p){
        // Generate a random number between 0 and 1
       const randomValue = Math.random();
    
        // if random number < p, return 1, else 0
        let wl = randomValue < p ? 1 : 0;
        this.success.push(wl);
        //console.log(this.success);
    }

    return hacker;
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360); // Hue casuale tra 0 e 360
    const saturation = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Saturazione tra 60 e 100
    const lightness = Math.floor(Math.random() * (80 - 40 + 1)) + 40; // Luminosità tra 40 e 80
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function generateColors(m) {
    const colors = new Set(); // Usa un Set per garantire colori unici

    while (colors.size < m) {
        colors.add(getRandomColor()); // Aggiungi un colore casuale
    }

    return Array.from(colors); // Restituisci un array di colori
}