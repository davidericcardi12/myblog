"use strict"

window.onload = function (){

    let chartFunction;

    // Define the interval for the function
    let startX = -50;       // Start of the interval (modifiable)
    let endX = 50;//2 * Math.PI; // End of the interval (modifiable)

    


    // Define the available functions
    // Define available functions and their exact integrals

    const functions = {
        x2: x => x ** 2,
        sin: x => Math.sin(x),
        cos: x => Math.cos(x),
        exp: x => Math.exp(x),
        log: x => (x > 0 ? Math.log(x) : NaN) // Handle log(x) for x <= 0
    };

    let functionString = "x2";
    let selectedFunction = functions[functionString];

    // Generate data points for the function
    let generateData = function(startX, endX, f){

        const dataPoints = [];
        const step = 0.1; // Step size for precision

        for (let x = startX; x <= endX; x += step) {
            const y = f(x);
            dataPoints.push({ x: x, y: y });
        }
        return dataPoints;
    }

    // Create the chart
    let updateChart = function(dataPoints, startX, endX){
        if(chartFunction)
            chartFunction.destroy();
        const ctx = document.getElementById('functionChart').getContext('2d');
        chartFunction = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'f(x)',
                        data: dataPoints,
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: true, // Enable fill for the area under the curve
                        backgroundColor: 'rgba(0, 128, 0, 0.2)', // Fill color for the area
                        tension: 0.4,
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'x',
                        },
                        min: startX, // Dynamically set the x-axis start
                        max: endX,   // Dynamically set the x-axis end
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'f(x)',
                        },
                    },
                },
            },
        });
    }

    let compute = function(startX, endX, selectedFunction, functionString){
        let data = generateData(startX, endX, selectedFunction);
        updateChart(data, startX, endX);
        document.getElementById("riemannIntegral").textContent = "Riemann Integral: " + riemannIntegral(selectedFunction, startX, endX, 1000);
        document.getElementById("lebesgueIntegral").textContent = "Lebesgue Integral: " + lebesgueIntegral(selectedFunction, startX, endX, 1000);
        document.getElementById("exactIntegral").textContent = "Exact Integral: " + exactIntegral(functionString, startX, endX);
    }
    compute(startX, endX,selectedFunction, functionString);

     document.getElementById('functionSelect').addEventListener('change', event => {
        functionString = event.target.value;
        selectedFunction = functions[event.target.value];
    });

    document.querySelector('.btn-compute').addEventListener("click", function(){
        startX = parseInt(document.getElementById("inp-txt_start").value);
        endX = parseInt(document.getElementById("inp-txt_end").value);
        if(checkValue(startX, endX, functionString))
            compute(startX, endX, selectedFunction, functionString);
    });

}

function checkValue(startX, endX, functionString){
    if(functionString == "log" && startX<0){
        alert("START INTERVAL MUST BE >= 0 ");
        return false;
    }
    return true;
}

function riemannIntegral(func, start, end, numRectangles) {
    const dx = (end - start) / numRectangles;
    let sum = 0;

    for (let i = 0; i < numRectangles; i++) {
        const x = start + i * dx; // left endpoint
        sum += func(x) * dx; // Area of each rectangle
    }

    return sum;
}

function lebesgueIntegral(func, a, b, numIntervals) {
    const step = (b - a) / numIntervals; // Step size
    const functionValues = [];
    let integral = 0;

    // Step 1: Collect function values at discrete points
    for (let i = 0; i < numIntervals; i++) {
        const x = a + i * step;
        functionValues.push(Math.abs(func(x))); // Use absolute values to mimic "heights"
    }

    // Step 2: Sort values to simulate Lebesgue levels
    functionValues.sort((a, b) => a - b);

    // Step 3: Calculate integral using Lebesgue summation
    for (let i = 0; i < functionValues.length; i++) {
        const height = functionValues[i];
        integral += height * step; // Add area based on height * step size
    }

    return integral;
}

function exactIntegral(func, a, b) {
    switch (func) {
        case 'x2': // Integral of x^2
            return (b ** 3) / 3 - (a ** 3) / 3;
        case 'cos': // Integral of cos(x)
            return Math.sin(b) - Math.sin(a);
        case 'sin': // Integral of sin(x)
            return -Math.cos(b) + Math.cos(a);
        case 'exp': // Integral of e^x
            return Math.exp(b) - Math.exp(a);
        case 'log': // Integral of log(x)
            if (a > 0 && b > 0) {
                return b * Math.log(b) - b - (a * Math.log(a) - a);
            } else {
                throw new Error("log(x) is undefined for x <= 0");
            }
        default:
            throw new Error("Unknown function");
    }
}