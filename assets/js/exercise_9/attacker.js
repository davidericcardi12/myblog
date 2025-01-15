"use strict"

window.onload = function (){

    const chance = new Chance();

    //let distribution = [0.8, 0.1, 0.05, 0.05];
    //const interations = 100;

    let updateInterface = function(fields, new_fields, distribution){
        
        let li = document.querySelectorAll(".input-list-el");
            li.forEach((item, index) => {
                let inp_el = item.querySelector("#input-list-el-id");
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
        const ul = document.getElementById("input-list");
        let inputElement;
        let li;	
        for(let i=0; i<fields; i++){
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
                //console.log("value: " +value);
            });
            let iterations = parseInt(document.getElementById("inp-txt_samples").value);
            let sampleSize = parseInt(document.getElementById("inp-txt_sampleSize").value);
            //console.log("ITERATIONS: "+iterations);
            init(distribution, iterations, sampleSize);
        });
        INTERFACE_EXISTS = 1;
    }

    let g;
    let init = function(distribution, iterations, sampleSize){
        g = getGraph(distribution, iterations, sampleSize);
        g.setLines();
        g.setDatasetLines();
        makechartBar(distribution, iterations);
        console.log(g.datasets);
        console.log(g.sampleMean);
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


    let makechartBar = function(distribution, iterations){
        if(chartBar)
            chartBar.destroy();

        //const sampleMean = g.sampleMean.map(val => parseFloat(val.toFixed(2)));; // Distribuzione delle medie arrotondate a due cifre decimali
        const sampleVariance = g.sampleVariance.map(val => parseFloat(val.toFixed(2)));;
        console.log(sampleVariance);

        let frequency = {}
        sampleVariance.forEach(mean => {
            frequency[mean] = (frequency[mean] || 0) + 1;
        });
        console.log(frequency);
        // Ordinare il dizionario per chiave
        const pairsList = Object.entries(frequency)
            .map(([key, value]) => [parseFloat(key), value])  // Converte la chiave in float
            .sort((a, b) => a[0] - b[0]);  // Ordina la lista per chiave (a[0] è la chiave)
        console.log(pairsList);
        let sortedKeys = Object.keys(frequency).map(num => parseFloat(num)).sort();
        console.log(sortedKeys);
        // Estrai etichette e valori per il grafico
        const labels = pairsList.map(pair => pair[0]);;
        console.log(labels);
        const data = pairsList.map(pair => pair[1]);; // Frequenze
        console.log(data);

        let empiricalMean = g.getMeanOfSampleMean();
        let theoriticalMean = g.getTheoriticalMean();
        console.log("mean of the means: "+empiricalMean);
        console.log("theoritical mean "+theoriticalMean);
        let empiricalVariance = g.getMeanOfSampleVariance();
        let theoreticalVariance = g.getTheoriticalVariance();
        console.log("");
        console.log("mean of the variances "+empiricalVariance);
        console.log("theoretical variance "+ theoreticalVariance);

        const ctx = document.getElementById('chartBar').getContext('2d');
        chartBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, // Intervalli (buckets)
                datasets: [{
                    label: 'Frequenza',
                    data: data, // Frequenze associate agli intervalli
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true, // Abilita il titolo
                        text: 'Sampling Variance Distribution', // Testo del titolo
                        font: {
                            size: 18 // Dimensione del font
                        },
                        padding: {
                            top: 30,
                            bottom: 10
                        }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        // aggiungi media e varianza sotto il grafico
        let eMean = document.getElementById("eMean");
        eMean.innerHTML = "Empirical Mean: " + empiricalMean.toFixed(3);
        let tMean = document.getElementById("tMean");
        tMean.innerHTML = "Theoretical Mean: " + theoriticalMean.toFixed(3);
        let eVariance = document.getElementById("eVariance");
        eVariance.innerHTML = "Empirical variance: " + empiricalVariance.toFixed(3);
        let tVariance = document.getElementById("tVariance");
        tVariance.innerHTML = "Theoretical variance: " + theoreticalVariance.toFixed(3);

        document.getElementById("mv").style.display="block";

    }

    //makeChartPaths();
    //makechartBar();
}


function getGraph(dist, iter, sampleSize){

    let MyGraph = new Object();
    const offset = 1;

    MyGraph.lines = [...Array(dist.length)].map(() => getLine()); //lista di objects Line

    MyGraph.samples = [];

    MyGraph.sampleMean = []; // (media campionaria) grande quanto iter 

    MyGraph.sampleVariance = []; //(varianza campionaria) grande quanto iter

    MyGraph.setLines = function(){
        let s;
        for(let i=0; i<iter; i++){
            s = sample(dist, sampleSize);
            this.samples.push(s);
            //console.log("Campionato: " + s);
            let empiricalMean = putSampleMean(s);
            putSampleVariance(s, empiricalMean);
            addStepToLine(s, this.lines, offset);
            //this.setMean(offset, s, i+1); //calcola la media per il campionamento della linea 's'
        }
        //console.log(this.lines);
    }

    let addStepToLine = function(sample, lines, step){
        for(let k=0; k<sample.length; k++){
            let index = sample[k];
            for(let i=0; i<dist.length; i++){
                //console.log("\tLine: "+i);
                if(i == index)
                    lines[i].addStep(step);
                else
                    lines[i].addStep(0)
            }
        }
    }

    let putSampleMean = function(sample){
        let sum=0;
        for(let i=0; i<sample.length; i++){
            sum += sample[i];
        }
        let mean = sum/sample.length;
        MyGraph.sampleMean.push(mean);
        return mean;
    }

    MyGraph.getMeanOfSampleMean = function(){
        let sampleMean = this.sampleMean;
        let sum=0;
        for(let i=0; i<sampleMean.length; i++){
            sum += sampleMean[i];
        }
        return sum/sampleMean.length;
    }

    MyGraph.getTheoriticalMean = function(){
        const distribution = dist;
        let mean=0;
        for(let i=0; i<distribution.length; i++){
            mean += distribution[i] * i;
        }
        return mean;
    }

    let putSampleVariance = function(sample, empiricalMean){
        const empiricalVariance = sample.reduce((sum, value) => {
            return sum + Math.pow(value - empiricalMean, 2);
          }, 0) / sample.length;
        MyGraph.sampleVariance.push(empiricalVariance);
    }

    MyGraph.getMeanOfSampleVariance = function(){
        let sampleVariance = this.sampleVariance;
        let sum=0;
        for(let i=0; i<sampleVariance.length; i++){
            sum += sampleVariance[i];
        }
        return sum/sampleVariance.length;
    }

    MyGraph.getTheoriticalVariance = function(){
        const theoreticalMean = this.getTheoriticalMean();
        const distribution = dist;
        // Calcola la varianza teorica
        const theoreticalVariance = distribution.reduce((sum, probability, index) => {
            return sum + probability * Math.pow(index - theoreticalMean, 2);
        }, 0);
        return theoreticalVariance;
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

    Line.mean = [0]; // [i] = mean totale alla iterazione i_esima

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
        //console.log("\t\tUpdated mean: " + new_mean);
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
        //console.log("\t\tUpdated variance "+ variance);
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



function sample(dist, size) {
    let extractions = []
    //console.log("Distr: "+dist);
    for(let i=0; i<size; i++){
        let ex = chance.weighted([...Array(dist.length)].map((_, i) => i), dist);  // Indici e probabilità
        extractions.push(ex);
    }
    return extractions;
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