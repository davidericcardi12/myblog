"use strict"

window.onload = function (){

    const chance = new Chance();

    //let distribution = [0.8, 0.1, 0.05, 0.05];
    //const interations = 100;

    let updateInterface = function(fields, new_fields, distribution){
        
        let li = document.querySelectorAll(".input-list-el");
            li.forEach((item, index) => {
                let inp_el = item.querySelector("#input-list-el-id");
                console.log("ind " + index);
                console.log(inp_el);
                inp_el.value = distribution[index];
            });
    }

    let INTERFACE_EXISTS = 0;

    let createInterface = function(fields, distribution){
        //ripristina se l'interfaccia è stata già creata
        if(INTERFACE_EXISTS==1){
            document.getElementById("input-list").innerHTML = "";
            btn_start.parentNode.removeChild(btn_start);
        }
        console.log("CIAO");
        const ul = document.getElementById("input-list");
        let inputElement;
        let li;	
        for(let i=0; i<fields; i++){
            console.log("CIAO");
            li = document.createElement("li"); //<li><input type="text" size="5" value="" class="inp_txt"></li>	
            li.classList.add("input-list-el");
            inputElement = document.createElement('input');
            inputElement.type="text";
            inputElement.id = "input-list-el-id";
            //inputElement.size="20";
            //inputElement.setAttribute('data-float', distribution[i]);
            inputElement.value= "" + distribution[i];
            li.appendChild(inputElement);
            ul.appendChild(li);
        }
        //<button name="data" type="button" class="btn-make" id="btn-fields">Generate random distribution</button>
        btn_start = document.createElement("button");
        btn_start.type = "button";
        //btn_start.classList.add("btn-make");
        btn_start.id = "btn-start";
        btn_start.innerText = "Start sampling";
        /*
        //inserisco btn vicino al bottone già esistente
        let form = document.getElementById("form");
        form.insertBefore(btn_start, form.children[2].nextSibling);*/
        let jkk = document.getElementById("jkk");
        jkk.style.display="block";
        jkk.appendChild(btn_start);

        btn_start.addEventListener("click", function(){
            let li = document.querySelectorAll(".input-list-el");
            li.forEach((item, index) => {
                let value = parseFloat(item.querySelector("#input-list-el-id").value);
                distribution[index] = value;
                console.log("value: " +value);
            });
            let iterations = parseInt(document.getElementById("inp-txt_samples").value);
            console.log("ITERATIONS: "+iterations);
            init(distribution, iterations);
        });
        INTERFACE_EXISTS = 1;
    }

    let g;
    let init = function(distribution, iterations){
        g = getGraph(distribution, iterations);
        g.setLines();
        g.setDatasetLines();
        makeChartPaths(distribution, iterations);
        makechartBar(distribution, iterations);
        console.log(g.datasets);
    }

    let fields;
    let btn_fields = document.getElementById("btn-fields");
    let btn_start;
    btn_fields.addEventListener("click", function(){
        fields = parseInt(document.getElementById("inp-txt_fields").value);
        console.log("fields: "+fields);
        createInterface(fields, generateNormalizedDistribution(fields));
    })

    let chartPaths;
    let chartBar;

    let makeChartPaths = function(distribution, iterations){

        if(chartPaths)
            chartPaths.destroy();

        let ctx = document.getElementById('chartPaths');
        ctx = ctx.getContext('2d');

        chartPaths = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: iterations +1}, (_, i) => i),  // Etichette per l'asse x
                datasets: g.datasets
            },
            options: {
                scales: {
                    x: {
                        min: 0,
                        max: iterations,
                        type: 'linear',
                        title: { display: true, text: 'X' },
                    },
                    y: {
                        min: 0,
                        max: iterations,
                        type: 'linear',
                        title: { display: true, text: 'Y' }
                    }
                },
                
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

    }

    let makechartBar = function(distribution, iterations){
        if(chartBar)
            chartBar.destroy();

        
        let barListEmpirical = []
        g.lines.forEach((line,i) => {
            let n = line.path.length;
            barListEmpirical.push(line.path[n-1]);
        });

        //converti la distribuzione in modo tale che la somma sia uguale a iterations
        let barListTheorical = scaleDistribution(distribution, iterations);
       
        console.log(barListEmpirical);
        console.log(barListTheorical);

        const ctx = document.getElementById('chartBar').getContext('2d');
        chartBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: distribution.length}, (_, i) => i+1),  // Etichette per l'asse x
                datasets: [{
                    label: 'Empirical distribution',
                    data: barListEmpirical, // Dati per il primo set di barre
                    backgroundColor: 'rgba(75, 192, 192, 0.7)', // Colore delle barre
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    barThickness: 0.4 * 100, // Impostare larghezza della barra
                    offset: true
                }, {
                    label: 'Theoretical distribution',
                    data: barListTheorical, // Dati per il secondo set di barre
                    backgroundColor: 'rgba(153, 102, 255, 0.7)', // Colore delle barre
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    barThickness: 0.4 * 100, // Impostare larghezza della barra
                    offset: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: false, // Non sovrapporre le barre
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top', // Posizione della legenda
                    }
                }
            }
        });
    }

    //makeChartPaths();
    //makechartBar();
}


function getGraph(dist, iter){

    let MyGraph = new Object();
    const offset = 1;

    MyGraph.lines = [...Array(dist.length)].map(() => getLine()); //lista di objects Line

    MyGraph.samples = [];

    MyGraph.setLines = function(){
        let s;
        for(let i=0; i<iter; i++){
            s = sample(dist);
            this.samples.push(s);
            console.log("Campionato: " + s);
            addStepToLine(s, this.lines, offset);
            //this.setMean(offset, s, i+1); //calcola la media per il campionamento della linea 's'

        }
        console.log(this.lines);
    }

    let addStepToLine = function(index, lines, step){
        for(let i=0; i<dist.length; i++){
            console.log("\tLine: "+i);
            if(i == index)
                lines[i].addStep(step);
            else
                lines[i].addStep(0)
        }
    }

    const colors = generateColors(dist.length);

    MyGraph.datasets = [];

    MyGraph.setDatasetLines = function(){
        this.lines.forEach((line, index) => {
            line.setDataset(colors[index ], index);
            this.datasets.push(line.dataset);
        });
    }

    return MyGraph;
}

function getLine(){

    let Line = Object();

    Line.path = [0];

    Line.mean = [0];

    Line.variance = [];

    Line.addStep = function(step){
        let new_step = this.path[this.path.length-1] + step
        this.path.push(new_step);
        //console.log("ADDED STEP: " + new_step);
        this.updateMean(new_step);
        this.updateVariance(new_step);
    }

    //sfrutta Wilford's algorithm per carlcolare la nuova media per la index linea 
    Line.updateMean = function(x){ 
        const u_n_minus_one = this.mean[this.mean.length-1];
        const n = this.mean.length;
        let new_mean = u_n_minus_one + (x - u_n_minus_one)/n;
        this.mean.push(new_mean);
        console.log("\t\tUpdated mean: " + new_mean);
    }

    let M2 = 0;
    Line.updateVariance = function(newValue) {
        const count = this.mean.length // Indice corrispondente all'ultimo elemento inserito in mean
        let variance;
        if (count == 1)
            this.variance.push(0);
        else{
            const delta = newValue - this.mean[count-2]; // Differenza rispetto alla media precedente
            M2 += delta * (newValue - this.mean[count-1]); // Aggiorna M2 con la nuova media
        
            // Calcolo della varianza campionaria se ci sono almeno 2 valori
            variance = M2 / (count - 1);
            this.variance.push(variance);
        }
        console.log("\t\tUpdated variance "+ variance);
    }

    Line.dataset = {}

    Line.setDataset = function(color, index){
        this.dataset = {
            label: `Line ${index + 1} (Mean ${this.mean[this.mean.length-1].toFixed(3)}, Variance ${this.variance[this.variance.length-1].toFixed(3)}) `,
            data: this.path,
            borderColor: color,
            fill: false,
            tension: 0.3,  // Linea spezzata (senza curve)
            pointRadius: 1,
            pointBackgroundColor: color,
            showLegend: false, // Mostra solo la leggenda per questa linea
        }
    }

    return Line;
}



function sample(dist) {
    console.log("Distr: "+dist);
    return chance.weighted([...Array(dist.length)].map((_, i) => i), dist);  // Indici e probabilità
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

function scaleDistribution(probabilities, n) {

    // Scala la distribuzione in modo che la somma sia pari a n
    const scaledDistribution = probabilities.map(prob => prob * n);

    // Restituisce la distribuzione scalata
    return scaledDistribution;
}


function generateNormalizedDistribution(n) {
    // Genera una lista di n numeri casuali
    let distribution = [];
    let sum = 0;
    
    // Generiamo i numeri casuali
    for (let i = 0; i < n; i++) {
        let randomValue = Math.random();  // Genera un numero casuale tra 0 e 1
        distribution.push(randomValue);
        sum += randomValue;
    }

    // Normalizziamo la somma affinché la somma faccia 1
    return distribution.map(value => (value / sum).toFixed(3)); // Arrotodiamo a 3 decimali
}