"use strict"

window.onload = function (){

    let n = (document.getElementById("inp-txt_n")).value; 
    let m = (document.getElementById("inp-txt_m")).value; 
    //let p = (document.getElementById("inp-txt_p")).value;
    let lambda = (document.getElementById("inp-txt_lambda")).value;

    /** FOR TESTING **/
    /*let n = 5;
    let m = 3;
    //let p = 0.8;
    let lambda = 2;*/

    let p = lambda*1/n;

    let hackers;
    let relative_distribution_at_time;

    let init = function(n,m,p){
        hackers = getHackers(m);
        /*** TRY TO ATTACK  ***/
        console.log(hackers.hacker_list);
        hackers.doAttacks(p, n);
        /*** END ***/
        relative_distribution_at_time = hackers.getRelativeDistributionAtTime(n);
    


    }
    init(n,m,p);

    let attackChart;
    let distributionChart;
    let distributionChartB;

    let makeGraphicA = function (n,m) {

        if(attackChart)
            attackChart.destroy();
    
        let attacks = hackers.getListOfAttacks();
    
        console.log(attacks);

        const colors = generateColors(attacks.length);

        // Dati per ogni hacker
        let datasets = [];

        hackers.hacker_list.forEach((hacker, index) => {
            let path = hacker.path;
            // Aggiungi i dati dell'hacker nel dataset
            datasets.push({
                label: `Hacker ${index + 1}`,
                data: path,
                borderColor: colors[index % colors.length],
                fill: false,
                tension: 0,  // Linea spezzata (senza curve)
                pointRadius: 1,
                pointBackgroundColor: colors[index % colors.length],
                showLegend: false, // Mostra solo la leggenda per questa linea
                order: 2
            });
        });

        /*datasets.push({
            type: "bar",
            data: distr_y.map(item => ({
                x: item.x, // Coordinata x in cui parte la colonna
                y: item.y, // Coordinata y
                //v: item.length // Lunghezza della colonna come percentuale di un'unità
            })),
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Colore di riempimento
            borderColor: 'rgba(75, 192, 192, 1)', // Colore del bordo
            borderWidth: 5,
            fill: false,
            tension: 0
            //categoryPercentage: 2.0, // Imposta la larghezza della barra
            //barPercentage: 1.0,
        });*/


        // Configurazione del grafico
        let ctx = document.getElementById('attackChart');
        //ctx.setAttribute("style","height:400px");
        ctx = ctx.getContext('2d');
        console.log("newwww charttt");
        attackChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...Array(attacks[0].length + 1).keys()], // Asse X: da 0 a n server
                datasets: datasets
            },
            options: {
                responsive: true,
                //maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            generateLabels: function(chart) {
                                // Personalizza la leggenda mostrando solo una voce per le linee orizzontali
                                const legendLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                
                                // Ritorna una singola etichetta per la "Distribuzione Relativa"
                                console.log("kllll " +hackers.getMeanAtTime(n));
                                return [
                                    {
                                        text: 'Relative Distribution at time ' + n + "; Mean: " + roundToTwoDecimalPlaces(hackers.getMeanAtTime(n)) + "; Variance: " + roundToTwoDecimalPlaces(hackers.getVarianceAtTime(n)),
                                        fillStyle: 'rgba(255, 0, 0)',  // Colore della legenda
                                        strokeStyle: 'rgba(255, 0, 0)',
                                        lineWidth: 3,
                                        hidden: false,  // Non nascondere questa voce
                                        datasetIndex: 1  // Associa al secondo dataset (esempio)
                                    },
                                ];
                            }
                        }
                    },
                },
                scales: {
                    x: {
                        
                        type: "linear",
                        title: {
                            display: true,
                            text: 'Time'
                        },
                        ticks: {
                            callback: function(value) {
                                // Mostra solo numeri interi
                                return Number.isInteger(value) && value<=n ? value : '';
                            },
                        }
                    },
                    y: {
                        type: 'linear',
                        min: 0,
                        max: + parseInt(n),
                        title: {
                            display: true,
                            text: 'Level'
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1  // Incremento di 1 unità
                        }
                    },
                    y2: { // Configurazione per l'asse Y secondario
                        type: 'linear', // Assicurati che sia di tipo lineare,
                        min: 0,
                        max: + parseInt(n),
                        position: 'right', // Posizione dell'asse Y secondario
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false // Nascondi la griglia per l'asse secondario
                        },
                        // Mappa l'asse secondario all'asse primario
                        ticks: {
                            callback: function(value, index, values) {
                                return value; // Restituisce lo stesso valore dell'asse principale
                            }
                        }
                    }
                },
                
            }
        });

        // Aggiungi la linea orizzontale a tempo n
        let half_chart_remain = (n*0.2); //la rimanente è il 20 percento del valore di n aggiunto automaticamente da chart
        // Ricalcola la distribuzione relativa a tempo n
        relative_distribution_at_time = hackers.getRelativeDistributionAtTime(n, parseInt(n))
 
        relative_distribution_at_time.forEach((length, index) => {
            let i_y = n-index;
            const yPosition = i_y; // Y per l'indice corrente
            const startX = parseInt(n);
            const endX = parseInt(n) + (length)*half_chart_remain*5; // Estensione della linea orizzontale fino a un massimo del 50% della rimanente x in avanti

            // Aggiungi la linea orizzontale
            attackChart.data.datasets.push({
                label: `Relative distribution`,
                data: [
                    { x: startX+0.3, y: yPosition  },
                    { x: endX+0.3, y: yPosition }
                ],
                borderColor: 'rgb(255, 0, 0)', // Colore della linea orizzontale
                borderWidth: 10,
                fill: false, // Non riempire l'area sotto la linea
                tension: 0, // Rimuovi le curve
                pointRadius: 0, // Nascondi i punti all'estremità della linea
                showLegend: true, // Mostra solo la leggenda per questa linea
                order: 3
            });
        });

        // Aggiorna il grafico per riflettere le nuove linee orizzontali
        attackChart.update();

 }  

 let makeHistogram = function (n) {
    console.log("MAKEHISTOGRAM")

    if(distributionChart)
        distributionChart.destroy();
        
    const absoluteDistribution_n = hackers.getAbsoluteDistributionAtTime(n, n);


    // Configurazione del grafico
    const ctx = document.getElementById('distributionChart').getContext('2d');

    //limita il set in modo che sull'asse x nel grafico solo i valori in un range (min_x, max_x) tale che nessun valore prima di min_x  ha un valore di distribuzione maggiore di 0 e lo stesso per max_x 
   
    
    distributionChart = new Chart(ctx, {
        type: 'bar', // Usa 'bar' per un grafico a barre
        data: {
            labels: [...Array(n * 2 + 1).keys()].map(i => i - n), // Genera etichette da -n a +n
            datasets: [
                {
                    label: '# Hacker ',
                    data: absoluteDistribution_n.reverse(),
                    backgroundColor: 'rgba(255, 0, 0)', // Colore delle barre
                    borderColor: 'rgba(255, 0, 0)',
                    borderWidth: 1,
                    minBarLength: 2, // Cambia questo valore in base alle esigenze
                    barPercentage: 0.8, // Diminuisci per evitare sovrapposizioni
                    categoryPercentage: 0.8, // Diminuisci per avere più spazio tra le categorie     
               }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    min: 0,
                    max: n,
                    title: {
                        display: true,
                        text: 'Time' 
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of hacker'
                    },
                    beginAtZero: true // Inizia da zero sull'asse Y
                }
            }
        }
    });
            
}


    makeGraphicA(n,m);
    makeHistogram(n);

    let btn_make = document.querySelector(".btn-make");
    btn_make.addEventListener("click", function(event){
        event.preventDefault();
        let n = (document.getElementById("inp-txt_n")).value; 
        let m = (document.getElementById("inp-txt_m")).value; 
        let lambda = (document.getElementById("inp-txt_lambda")).value; 
        if(ceckInput3(n,m,lambda)){
            let p = lambda*1/n;
            init(n,m,p);
            makeGraphicA(n,m);
            makeHistogram(n);
        }
    });
}
    

function getHackers(m){

    let hackers = new Object();

    hackers.hacker_list = []

    //push hackers
    for(let i=0; i<m; i++){
        hackers.hacker_list.push(getHacker());
        console.log("push " + hackers.hacker_list[i]);
    }

    // esegui attacchi e imposta i cammini di ognuno nel grafico
    hackers.paths = []
    hackers.doAttacks = function(p, n){
        for(let i=0; i<this.hacker_list.length; i++){
            this.hacker_list[i].tryToAttack(p, n);
            console.log(this.hacker_list[i].success);
        }

        let setPaths = function(hackers){
            for(let i=0; i<hackers.hacker_list.length; i++){
                hackers.paths.push(hackers.hacker_list[i].path);
            }
        }
        setPaths(this);
        console.log("paths");
        console.log(this.paths);
    }

    // media scores degli hacker al tempo time
    hackers.getMeanAtTime = function(time){
        let score_at_time; 
        let mean = 0;
        if(time==0)
            return 0;
        for(let i=0; i<this.hacker_list.length; i++){
            score_at_time = this.hacker_list[i].getScoreAtTime(time);
            console.log("score at time " + time + ": " + score_at_time + " per hacker " + i);
            mean = mean + score_at_time/this.hacker_list.length;
        }
        console.log("mean at time: " + time + ": " + mean);
        return mean;
    }
    
    // varianza scores hacker al tempo time
    hackers.getVarianceAtTime = function(time){
        let score_at_time; 
        let mean = this.getMeanAtTime(time);
        let variance = 0;
        if(time==0)
            return 0;
        for(let i=0; i<this.hacker_list.length; i++){
            
            score_at_time = this.hacker_list[i].getScoreAtTime(time);
            variance += ((score_at_time - mean)**2) / time;
        }
        return variance;
    }

    // Array bidimensionale per rappresentare gli attacchi di tutti gli hacker
    hackers.getListOfAttacks = function(){
        let attacks = [];
        this.hacker_list.forEach(function(hacker){
            attacks.push(hacker.success);
        });
        return attacks;
    }

    // per ogni livello raggiungibile quanti hacker hanno raggiunto quel livello
    hackers.getAbsoluteDistributionAtTime = function(n, time){
        let distribution = Array(2*n+1).fill(0); // livello i corrisponde a [n - i]
        for(let i=0; i<this.hacker_list.length; i++){
            let hackerScoreAtTime = this.hacker_list[i].getScoreAtTime(time);
            console.log("hacker "+ i + " score: " + hackerScoreAtTime);
            distribution[n - hackerScoreAtTime] += 1;
        }
        return distribution;
    }

    hackers.getRelativeDistributionAtTime = function(n, time){
        let absolute_distribution = this.getAbsoluteDistributionAtTime(n, time) // livello -i corrisponde a [i]; livello +i corrisponde a [n+i]
        let relative_distribution = []
        for(let i=0; i<absolute_distribution.length; i++){
            relative_distribution.push(absolute_distribution[i] / this.hacker_list.length);
        }
        return relative_distribution;
    }

    return hackers;
}



function getHacker(){
    let hacker = new Object();

    hacker.success = [];
    hacker.path = [0];

    hacker.tryToAttack = function (p, n){
        for(let i=0; i<n; i++){
            // Generate a random number between 0 and 1
            const randomValue = Math.random();
            
            // if random number < p, return 1, else 0
            let wl = randomValue < p ? 1 : 0;
            this.success.push(wl);
            //console.log(this.success);
        }
        // imposta il cammino del grafico. Se decrement = 1 ogni insuccesso decrementa il punteggio.
        let setPath = function(hacker, decrement){ 
            for(let i=0,j=1; i<hacker.success.length; i++,j++){
                if(decrement==1 && hacker.success[i] == 0)
                    hacker.path.push(hacker.path[j-1] - 1);
                else if(hacker.success[i] == 1)
                    hacker.path.push(hacker.path[j-1] + 1);
                else // decrement==0 && success==0
                    hacker.path.push(hacker.path[j-1]); //linea piatta
            }
        }
        setPath(this, 0);
    }

    hacker.getScoreAtTime = function(time){
        return this.path[time];
    }

    return hacker;
}



function getMean(hackers, time){

    let score_at_time; 
    let mean = 0;
    for(let i=0; i<hackers.length; i++){
        
        score_at_time = hackers[i].getScoreAtTime(time);
        mean = mean + score_at_time/time;
    }

    return mean;

}





function getRandomColor() {
    const hue = Math.floor(Math.random() * 360); // Hue casuale tra 0 e 360
    const saturation = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Saturazione tra 60 e 100
    const lightness = Math.floor(Math.random() * (80 - 40 + 1)) + 40; // Luminosità tra 40 e 80

     // Converti HSL a RGB
     const rgb = hslToRgb(hue, saturation / 100, lightness / 100);
     const alpha = 0.5; // Imposta il valore di trasparenza tra 0 e 1
 
     return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// Funzione per convertire HSL a RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // Se non c'è saturazione, ottieni un grigio
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 3) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h / 360 + 1 / 3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, h / 360 - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function generateColors(m) {
    const colors = new Set(); // Usa un Set per garantire colori unici

    while (colors.size < m) {
        colors.add(getRandomColor()); // Aggiungi un colore casuale
    }

    return Array.from(colors); // Restituisci un array di colori
}

function roundToTwoDecimalPlaces(num) {
    return Math.round(num * 100) / 100;
}

function ceckInput(n, m, p, time_step){
    if(n===undefined || n <= 0){
        alert("server must be > 0");
        return false;
    }
    if(m===undefined || m <= 0){
        alert("hacker must be > 0");
        return false;
    }
    if(p===undefined || p < 0 || p>1){
        alert("p must be between 0 and 1");
        return false;
    }
    if(time_step===undefined || time_step<0 || time_step>n){
        alert("time step must be between 0 and " + n);
        return false;
    }
    return true;
}

function ceckInput3(n, m, lambda){
    if(n===undefined || n <= 0){
        alert("time must be > 0");
        return false;
    }
    if(m===undefined || m <= 0){
        alert("hacker must be > 0");
        return false;
    }

    if(lambda===undefined || lambda<0 || lambda>n){
        alert("lambda must be between 0 and " + n);
        return false;
    }
    return true;
}