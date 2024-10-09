const canvas = document.getElementById('hackerCanvas');
const ctx = canvas.getContext('2d');

// Variabili di esempio
const n = 20; // numero di server (asse x)
const m = 50;  // numero di hacker (linee da disegnare)

// Generiamo un dataset di tentativi di hacking casuali (1 = successo, 0 = fallimento)
const generateRandomData = (m, n) => {
    let data = [];
    for (let i = 0; i < m; i++) {
        let hackerAttempts = [];
        for (let j = 0; j < n; j++) {
            hackerAttempts.push(Math.round(Math.random()));
        }
        data.push(hackerAttempts);
    }
    return data;
};

const successiInsuccessi = generateRandomData(m, n);

// Calcola gli spazi tra i server e gli hacker per evitare sovrapposizioni
const spacingX = canvas.width / (n + 1);
const spacingY = canvas.height / (m + 1);

function drawGraph() {
    // Per ogni hacker
    for (let i = 0; i < m; i++) {
        ctx.beginPath();
        let currentX = 0; // punto di partenza sulla X
        let currentY = (i + 1) * spacingY; // posizione iniziale sulla Y, variata per ogni hacker

        ctx.moveTo(currentX, currentY); // Inizia la linea per l'hacker i

        for (let j = 0; j < n; j++) {
            currentX += spacingX; // Sposta la linea verso destra, indipendentemente

            if (successiInsuccessi[i][j] === 1) {
                // Successo: linea verso l'alto
                ctx.lineTo(currentX, currentY - spacingY / 4); // spostamento verticale verso l'alto
                ctx.lineTo(currentX, currentY); // torna alla posizione originale
            } 
            // Insuccesso: solo spostamento orizzontale
            else {
                ctx.lineTo(currentX, currentY); 
            }
        }

        // Colore diverso per ogni hacker, gradiente HSL
        ctx.strokeStyle = `hsl(${(i / m) * 360}, 100%, 50%)`;
        ctx.stroke();
    }
}

drawGraph();
