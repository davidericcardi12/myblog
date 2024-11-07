"use strict"

window.onload = function (){

    const maruyama_simulator = 1; //homework 1
    const maruyama_sde = 2; //homework 2
    const sde_continuos_process = 3; //homework 3
    const sde_with_time_continuity = 4; //homework4

    let n;
    let m;
    let p;
    let lambda;
    let time_step;
    let offset_path;
    let decrement;

    let chosen_euler = sde_with_time_continuity; // the starting euler
    let chosen_form;

    let interfaceChoice = function(chosen){
        switch(chosen){
            case maruyama_simulator:
                chosen_form  = document.getElementById("h1");
                n = chosen_form.querySelector("#inp-txt_n").value; 
                m = chosen_form.querySelector("#inp-txt_m").value; 
                p = chosen_form.querySelector("#inp-txt_p").value;
                offset_path = 1;
                decrement = 0;
                break;
            case maruyama_sde:
                chosen_form  = document.getElementById("h2");
                n = chosen_form.querySelector("#inp-txt_n").value; 
                m = chosen_form.querySelector("#inp-txt_m").value; 
                p = chosen_form.querySelector("#inp-txt_p").value; 
                time_step = parseInt((chosen_form.querySelector("#inp-txt_timestep")).value);
                offset_path = 1;
                decrement = 1;
                break;
            case sde_continuos_process:
                chosen_form  = document.getElementById("h3");
                n = chosen_form.querySelector("#inp-txt_n").value; 
                m = chosen_form.querySelector("#inp-txt_m").value; 
                lambda = chosen_form.querySelector("#inp-txt_lambda").value;
                p = lambda*1/n;
                offset_path = 1;
                decrement = 0;
                break;
            case sde_with_time_continuity:
                chosen_form  = document.getElementById("h4");
                n = chosen_form.querySelector("#inp-txt_n").value; 
                m = chosen_form.querySelector("#inp-txt_m").value; 
                p = chosen_form.querySelector("#inp-txt_p").value;
                offset_path = Math.sqrt(0.1);
                decrement = 1;
                break;
        }
    }
    interfaceChoice(chosen_euler);

    /*let n = (document.getElementById("inp-txt_n")).value; 
    let m = (document.getElementById("inp-txt_m")).value; 
    let p = (document.getElementById("inp-txt_p")).value;
    let lambda = (document.getElementById("inp-txt_lambda")).value;*/

    /** FOR TESTING **/
    /*let n = 5;
    let m = 3;
    //let p = 0.8;
    let lambda = 2;*/

    //let p = lambda*1/n;
    

    let hackers;
    let relative_distribution_at_time;

    let init = function(n,m,p){
        hackers = getHackers(m);
        hackers.changeOffsetPath(offset_path);
        hackers.changeDecrement(decrement);
        /*** TRY TO ATTACKS  ***/
        console.log(hackers.hacker_list);
        hackers.doAttacks(p, n);
        /*** END ATTACKS ***/
        relative_distribution_at_time = hackers.getRelativeDistributionAtTime(n);
    
        console.log("path len: "+hackers.hacker_list[0].path.length);

    }
    init(n,m,p);

    let attackChart;
    let histogramChart1;
    let histogramChart2;

    console.log("MAX "+ Math.ceil(Math.max(...hackers.paths.flat())));

    let makeGraphicA = function (n,m) {

        if(attackChart)
            attackChart.destroy();
    
        let attacks = hackers.getListOfAttacks();
    
        console.log(attacks);

        const colors = generateColors(attacks.length);

        // Dati per ogni hacker
        let datasets = [];

        let relative_distribution_at_timestep;
        if(chosen_euler == maruyama_sde)
            relative_distribution_at_timestep = hackers.getRelativeDistributionAtTime(n, time_step);

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

        console.log("MIN Y: "+ - Math.ceil(Math.max(...hackers.paths.flat()) / 20) * 20);

        let min_y
        if(decrement){
            min_y = - Math.ceil(Math.max(...hackers.paths.flat().map(Math.abs)) / 20) * 20;
        }
        else{
            min_y = 0;
        }

        let max_y
        if(chosen_euler == maruyama_simulator || chosen_euler == maruyama_sde){
            max_y = parseInt(n);
        }
        else{
            max_y = Math.ceil(Math.max(...hackers.paths.flat().map(Math.abs)) / 20) * 20;
        }

        // Configurazione del grafico
        let ctx = document.getElementById('attackChart');
        //ctx.setAttribute("style","height:400px");
        ctx = ctx.getContext('2d');
        console.log("newwww charttt");
        attackChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels:  Array.from({ length: Math.ceil(n / hackers.offset_path +1) }, (_, i) => (i * hackers.offset_path).toFixed(2)),
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
                                console.log("kllll " +hackers.getMeanAtTime(n, n));
                                return [
                                    {
                                        text: 'Relative Distribution at time ' + n + "; Mean: " + roundToTwoDecimalPlaces(hackers.getMeanAtTime(n, n)) + "; Variance: " + roundToTwoDecimalPlaces(hackers.getVarianceAtTime(n, n)),
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
                        min: 0,
                        //max: parseInt(n), 
                        type: "linear",
                        title: {
                            display: true,
                            text: 'Time'
                        },
                        ticks: {
                            //stepSize: offset_path,
                            /*callback: function(value) {
                                // Mostra solo i valori desiderati (ad esempio, solo i multipli di 10)
                                return (value % 10 === 0 || value === 1 || value === n) ? Math.round(value) : '';
                            }*/
                        }
                    },
                    y: {
                        type: 'linear',
                        min: min_y,
                        max:  max_y,
                        title: {
                            display: true,
                            text: 'Level'
                        },
                        beginAtZero: true,
                        
                    },
                    y2: { // Configurazione per l'asse Y secondario
                        type: 'linear', // Assicurati che sia di tipo lineare,
                        min: min_y,
                        max:  max_y,
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

        let half_chart_remain;

        if(chosen_euler == maruyama_sde){
            // Aggiungi la linea orizzontale in un certo punto 'time_step' 
            half_chart_remain = n-time_step;
            if(half_chart_remain==0){
                half_chart_remain = 1;
            }
            console.log("RDAT: "+time_step +": "+ relative_distribution_at_timestep);
            relative_distribution_at_timestep.forEach((length, index) => {
                let i_y = n-index;
                const yPosition = i_y; // Y per l'indice corrente
                const startX = time_step;
                const endX = time_step + (length)*half_chart_remain // Estensione della linea orizzontale fino a un massimo del 50% della rimanente x in avanti
                // Aggiungi la linea orizzontale
                attackChart.data.datasets.push({
                    label: `Relative distribution`,
                    data: [
                        { x: startX, y: yPosition },
                        { x: endX, y: yPosition }
                    ],
                    borderColor: 'rgba(138, 43, 226, 1)', // Colore della linea orizzontale
                    borderWidth: 3,
                    fill: false, // Non riempire l'area sotto la linea
                    tension: 0, // Rimuovi le curve
                    pointRadius: 0, // Nascondi i punti all'estremità della linea
                    showLegend: true, // Mostra solo la leggenda per questa linea
                    order: 1
                });
            });

            // Aggiorna il grafico per riflettere le nuove linee orizzontali
            attackChart.update();
        }

        // Aggiungi la linea orizzontale a tempo n
        half_chart_remain = (n*0.2); //la rimanente è il 20 percento del valore di n aggiunto automaticamente da chart
        
        // Ricalcola la distribuzione relativa a tempo n
        relative_distribution_at_time = hackers.getRelativeDistributionAtTime(n, parseInt(n))
        let absolute_distribution_at_time = hackers.getAbsoluteDistributionAtTime(n, parseInt(n));
        const indexedList = relative_distribution_at_time.map((value, index) => [value, n - index * hackers.offset_path]);
        const indexedList1 = absolute_distribution_at_time.map((value, index) => [value, n - index * hackers.offset_path]);
        console.log(indexedList);   
        console.log(indexedList1);

        relative_distribution_at_time.forEach((length, index) => {
            let i_y = n - index * hackers.offset_path;
            let yPosition = i_y; // Y per l'indice corrente
            if(hackers.offset_path%1!=0)
                yPosition += hackers.offset_path;
            let startX = hackers.offset_path*hackers.getNumberOfAttacks(n);
            console.log("start x: ", startX);
            const endX = startX + (length)*half_chart_remain*5; // Estensione della linea orizzontale fino a un massimo del 50% della rimanente x in avanti

            // Aggiungi la linea orizzontale
            attackChart.data.datasets.push({
                label: `Relative distribution`,
                data: [
                    { x: startX, y: yPosition  },
                    { x: endX, y: yPosition }
                ],
                borderColor: 'rgb(255, 0, 0)', // Colore della linea orizzontale
                borderWidth: 3,
                fill: false, // Non riempire l'area sotto la linea
                tension: 0, // Rimuovi le curve
                pointRadius: 0, // Nascondi i punti all'estremità della linea
                showLegend: true, // Mostra solo la leggenda per questa linea
                order: 3
            });
        });

        // Aggiorna il grafico per riflettere le nuove linee orizzontali
        attackChart.update();

        //Aggiungi gli istogrammi dei rispettivi homework a seconda del selezionato
        let histogram1 = document.getElementById("histogramChart1");
        let histogram2 =  document.getElementById("histogramChart2");
        let dd = document.getElementById("average");
        switch(chosen_euler){
            case maruyama_simulator: 
                histogram1.style.display = "block";
                histogram2.style.display = "none";
                makeHistogram1(n);
                dd.style.display = 'block';
                break;
            case maruyama_sde: 
                histogram1.style.display = "block";
                histogram2.style.display = "block";
                makeHistogram21(n, time_step);
                makeHistogram22(n, time_step);
                dd.style.display = 'none';
                break;
            case sde_continuos_process: 
                histogram1.style.display = "block";
                histogram2.style.display = "none";
                makeHistogram3(n);
                dd.style.display = 'none';
                break;
            case sde_with_time_continuity: 
                histogram1.style.display = "none";
                histogram2.style.display = "none";
                dd.style.display = 'none';
                break;
        }

    }  

    let makeHistogram1 = function createHistogram(n) {

        if(histogramChart1)
            histogramChart1.destroy();

        let attacks = hackers.getListOfAttacks();


        // Calcola la percentuale di hacker che hanno raggiunto almeno un certo livello di server
        let labels = [];
        let penetrationCounts = new Array(attacks[0].length+1);
        for(let i=0; i<penetrationCounts.length; i++){
            penetrationCounts[i] = 0;
            labels.push(i);
        }
        labels.push(attacks[0].length);

        let successes = [];
        hackers.hacker_list.forEach(hacker => {
            successes.push(hacker.getScoreAtTime(n));
            penetrationCounts[hacker.getScoreAtTime(n)]+=1;
        });

        let sum = 0;
        successes.forEach(function(value){
            sum += value;
        });
        let average = sum / successes.length;
        console.log("media "+average);

        // Calcola le percentuali
        console.log(penetrationCounts.length)
        const percentages = penetrationCounts.map(count => (count / hackers.hacker_list.length) * 100);
        console.log("percentuali "+percentages);

        const ctx = document.getElementById('histogramChart1').getContext('2d');
        histogramChart1 = new Chart(ctx, {
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
                    },
                    x: {
                        min: 0,
                        max: parseInt(n)
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

    let makeHistogram21 = function (n, time_step) {
        console.log("MAKEHISTOGRAM")

        if(histogramChart1)
            histogramChart1.destroy();
            
        const relativeDistribution_ts = hackers.getRelativeDistributionAtTime(n, time_step);
        const relativeDistribution_n = hackers.getRelativeDistributionAtTime(n, n);

        // Configurazione del grafico
        const ctx = document.getElementById('histogramChart1').getContext('2d');

        //limita il set in modo che sull'asse x nel grafico solo i valori in un range (min_x, max_x) tale che nessun valore prima di min_x  ha un valore di distribuzione maggiore di 0 e lo stesso per max_x 
       
        
        histogramChart1 = new Chart(ctx, {
            type: 'bar', // Usa 'bar' per un grafico a barre
            data: {
                labels: [...Array(n * 2 + 1).keys()].map(i => i - n), // Genera etichette da -n a +n
                datasets: [
                   {
                    label: 'Relative Distribution at time ' + time_step,
                    data: relativeDistribution_ts.reverse(),
                    backgroundColor: 'rgba(138, 43, 226)', // Colore delle barre
                    borderColor: 'rgba(138, 43, 226)',
                    borderWidth: 1,
                    minBarLength: 2, // Cambia questo valore in base alle esigenze
                    barPercentage: 0.8, // Diminuisci per evitare sovrapposizioni
                    categoryPercentage: 0.8, // Diminuisci per avere più spazio tra le categorie
                },
                {
                    label: 'Relative Distribution at time ' + n,
                    data: relativeDistribution_n.reverse(),
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
                        title: {
                            display: true,
                            text: 'Level' 
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            //text: 'Valori' // Sostituisci con il tuo titolo
                        },
                        beginAtZero: true // Inizia da zero sull'asse Y
                    }
                }
            }
        });
                
    }

    let makeHistogram22 = function (n, time_step) {
        console.log("MAKEHISTOGRAM")

        if(histogramChart2)
            histogramChart2.destroy();
            
        const absoluteDistribution_n = hackers.getAbsoluteDistributionAtTime(n, n);
        const absoluteDistribution_ts = hackers.getAbsoluteDistributionAtTime(n, time_step);

        // Configurazione del grafico
        const ctx = document.getElementById('histogramChart2').getContext('2d');

        console.log("klssd");
        histogramChart2 = new Chart(ctx, {
            type: 'bar', // Usa 'bar' per un grafico a barre
            data: {
                labels: [...Array(n * 2 + 1).keys()].map(i => i - n), // Genera etichette da -n a +n
                datasets: [
                    {
                        label: 'Absolute Distribution at time ' + time_step,
                        data: absoluteDistribution_ts.reverse(),
                        backgroundColor: 'rgba(138, 43, 226, 0.5)', // Colore delle barre
                        borderColor: 'rgba(138, 43, 226, 0.5)',
                        borderWidth: 1,
                        minBarLength: 2, // Cambia questo valore in base alle esigenze
                        barPercentage: 1, // Diminuisci per evitare sovrapposizioni
                        categoryPercentage: 1, // Diminuisci per avere più spazio tra le categorie
                    },
                    {
                        label: 'Absolute Distribution at time ' + n,
                        data: absoluteDistribution_n.reverse(),
                        backgroundColor: 'rgba(255, 0, 0, 0.5)', // Colore delle barre
                        borderColor: 'rgba(255, 0, 0, 0.5)',
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
                        title: {
                            display: true,
                            text: 'Level' 
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            //text: 'Valori' // Sostituisci con il tuo titolo
                        },
                        beginAtZero: true // Inizia da zero sull'asse Y
                    }
                }
            }
        });
                
    }

    let makeHistogram3 = function (n) {
        console.log("MAKEHISTOGRAM")
    
        if(histogramChart1)
            histogramChart1.destroy();
            
        const absoluteDistribution_n = hackers.getAbsoluteDistributionAtTime(n, n);
    
    
        // Configurazione del grafico
        const ctx = document.getElementById('histogramChart1').getContext('2d');
    
        //limita il set in modo che sull'asse x nel grafico solo i valori in un range (min_x, max_x) tale che nessun valore prima di min_x  ha un valore di distribuzione maggiore di 0 e lo stesso per max_x 
       
        
        histogramChart1 = new Chart(ctx, {
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
    //makeHistogram(n);

    let label_ms = document.getElementById("maruyama_simulator");
    let label_msde = document.getElementById("maruyama_sde");
    let label_scp = document.getElementById("sde_continuos_process");
    let label_swtc = document.getElementById("sde_with_time_continuity");

    /*label_ms.querySelector('[name="selector"]').addEventListener("click", function(event){
        //change the input form
        chosen_form.style.display = "none";
        chosen_euler = maruyama_simulator;
        interfaceChoice(chosen_euler);
        chosen_form.style.display = "block";
        init(n,m,p);
        makeGraphicA(n,m);
    });*/

    let btn_make;
    let selectors = document.querySelectorAll(".radio-btn");
    selectors.forEach((element, index) =>{
        element.addEventListener("click", function(event){
            //change the input form
            chosen_form.style.display = "none";
            chosen_euler = parseInt(element.getAttribute('data-value'));;
            console.log("KSLS ", chosen_euler);
            interfaceChoice(chosen_euler);
            btnMake(); // add listener to button make
            chosen_form.style.display = "block";
            init(n,m,p);
            makeGraphicA(n,m);
        });
    });

    let btnMake = function(){
        btn_make = chosen_form.querySelector(".btn-make");
        btn_make.addEventListener("click", function(event){
            event.preventDefault();
            interfaceChoice(chosen_euler);
            switch(chosen_euler){
                case maruyama_simulator: 
                    if(ceckInput1(n,m,p)){
                        init(n,m,p);
                        makeGraphicA(n,m);
                    }
                    break;
                case maruyama_sde: 
                    if(ceckInput2(n,m,p,time_step)){
                        init(n,m,p);
                        makeGraphicA(n,m);
                        //makeHistogram(n);
                    }
                    break;
                case sde_continuos_process: 
                   if(ceckInput3(n,m,lambda)){
                        init(n,m,p);
                        makeGraphicA(n,m);
                        //makeHistogram(n);
                    }
                    break;
                case sde_with_time_continuity: 
                    if(ceckInput1(n,m,p)){
                        init(n,m,p);
                        makeGraphicA(n,m);
                    }
                    break;
            }
        });
    }
    btnMake();

    
}
    

function getHackers(m){

    let hackers = new Object();

    hackers.hacker_list = []

    hackers.offset_path = 1;
    hackers.changeOffsetPath = function(offset){
        this.offset_path = offset;
    }

    hackers.decrement = 0;
    hackers.changeDecrement = function(dec){
        this.decrement = dec;
    }

    hackers.getPathIndex = function(time,n){
        if(time == n)
            return this.getNumberOfAttacks(n);

        return Math.round(time/this.offset_path);
    }

    hackers.getNumberOfAttacks = function(n){
        let num_attacks = Math.ceil(n/this.offset_path);
        if(num_attacks % 1 != 0)
            num_attacks += 1;
    
        return num_attacks;
    }

    //push hackers
    for(let i=0; i<m; i++){
        hackers.hacker_list.push(getHacker());
        console.log("push " + hackers.hacker_list[i]);
    }

    // esegui attacchi e imposta i cammini di ognuno nel grafico
    hackers.paths = []
    hackers.doAttacks = function(p, n){
        for(let i=0; i<this.hacker_list.length; i++){
            this.hacker_list[i].tryToAttack(p, n, this.offset_path, this.decrement);
            console.log(this.hacker_list[i].success);
        }

        let setPaths = function(hackers){
            for(let i=0; i<hackers.hacker_list.length; i++){
                hackers.paths.push(hackers.hacker_list[i].path);
            }
        }
        setPaths(this);
        console.log(this.paths);
    }

    // media scores degli hacker al tempo time
    hackers.getMeanAtTime = function(time, n){
        let index_time = this.getPathIndex(time,n); //l'indice corrisponde al tempo 'time'. Se offset = 1 => index_time = time
        let score_at_time; 
        let mean = 0;
        if(time==0)
            return 0;
        for(let i=0; i<this.hacker_list.length; i++){
            score_at_time = this.hacker_list[i].getScoreAtTime(index_time);
            //console.log("score at time " + time + ": " + score_at_time + " per hacker " + i);
            mean = mean + score_at_time/this.hacker_list.length;
        }
        //console.log("mean at time: " + time + ": " + mean);
        return mean;
    }
    
    // varianza scores hacker al tempo time
    hackers.getVarianceAtTime = function(time, n){
        let index_time = this.getPathIndex(time, n); //l'indice corrisponde al tempo 'time'. Se offset = 1 => index_time = time
        let score_at_time; 
        let mean = this.getMeanAtTime(time,n);
        let variance = 0;
        if(time==0)
            return 0;
        for(let i=0; i<this.hacker_list.length; i++){
            
            score_at_time = this.hacker_list[i].getScoreAtTime(index_time);
            variance += ((score_at_time - mean)**2) / index_time;
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

    hackers.getDistributionIndex = function(n, hacker_score){
        const offset = this.offset_path;
        const total_time = Math.ceil(n/offset);
        let r = hacker_score/offset;
        if(Math.abs(r - Math.round(r)) <= offset){
            r = Math.round(r);
            console.log("r: "+r);
        }
        return total_time-r;
    }

    // per ogni livello raggiungibile quanti hacker hanno raggiunto quel livello
    hackers.getAbsoluteDistributionAtTime = function(n, time){
        const offset = this.offset_path;
        const index_time = this.getPathIndex(time, n); //l'indice corrispondente al tempo 'time'. Se offset = 1 => index_time = time
        const total_time = Math.ceil(n/offset);
        let distribution = Array(2*total_time+1).fill(0); // livello i corrisponde a [total_time - i]
        let l = []
        for(let i=0; i<this.hacker_list.length; i++){
            let hackerScoreAtTime = this.hacker_list[i].getScoreAtTime(index_time);
            console.log("at time: "+index_time + " Hacker "+i+" score: "+hackerScoreAtTime);
            let distribution_index = this.getDistributionIndex(n, hackerScoreAtTime)
            l.push([distribution_index, hackerScoreAtTime]);
            distribution[distribution_index] += 1;
        }
        console.log("jjsj");
        console.log(l);
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

    hacker.tryToAttack = function (p, n, offset_path, decrement){
        const total_time = Math.ceil(n/offset_path);
        for(let i=0; i<total_time; i++){
            // Generate a random number between 0 and 1
            const randomValue = Math.random();
            
            // if random number < p, return 1, else 0
            let wl = randomValue < p ? 1 : 0;
            this.success.push(wl);
            //console.log(this.success);
        }
       
        // imposta il cammino del grafico. Se decrement = 1 ogni insuccesso decrementa il punteggio.
        let setPath = function(hacker){ 
            for(let i=0,j=1; i<hacker.success.length; i++,j++){
                if(decrement==1 && hacker.success[i] == 0)
                    hacker.path.push(hacker.path[j-1] - offset_path);
                else if(hacker.success[i] == 1)
                    hacker.path.push(hacker.path[j-1] + offset_path);
                else // decrement==0 && success==0
                    hacker.path.push(hacker.path[j-1]); //linea piatta
            }
        }
        setPath(this);
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

function ceckInput1(n, m, p){
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
    return true;
}

function ceckInput2(n, m, p, time_step){
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
    if(n===undefined || parseInt(n) <= 0){
        alert("time must be > 0");
        return false;
    }
    if(m===undefined || parseInt(m) <= 0){
        alert("hacker must be > 0");
        return false;
    }

    if(lambda===undefined || parseInt(lambda)<0 || parseInt(lambda)>parseInt(n)){
        console.log("ERR "+lambda)
        console.log("ERN" + n);
        alert("lambda:"+lambda +" must be between 0 and " + n);
        return false;
    }
    return true;
}