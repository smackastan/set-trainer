// Set card game logic
const ATTRIBUTES = {
    number: [1, 2, 3],
    color: ['red', 'purple', 'green'],
    shape: ['oval', 'diamond', 'wave'],
    pattern: ['filled', 'striped', 'empty']
};

const SHORTHAND = {
    number: { '1': 1, '2': 2, '3': 3 },
    color: { 'r': 'red', 'p': 'purple', 'g': 'green' },
    shape: { 'o': 'oval', 'd': 'diamond', 'w': 'wave' },
    pattern: { 'f': 'filled', 's': 'striped', 'e': 'empty' }
};

const COLOR_MAP = {
    red: '#e53e3e',
    purple: '#805ad5',
    green: '#38a169'
};

let currentCards = [];
let correctCard = null;
let stats = { correct: 0, incorrect: 0 };

// Challenge mode variables
let challengeMode = false;
let challengeStartTime = null;
let challengeCorrectCount = 0;
let challengeTarget = 10; // Target number of correct answers
let bestTime = localStorage.getItem('bestTime') ? parseFloat(localStorage.getItem('bestTime')) : null;
let bestTime5 = localStorage.getItem('bestTime5') ? parseFloat(localStorage.getItem('bestTime5')) : null;

// Generate a random card
function generateRandomCard() {
    return {
        number: ATTRIBUTES.number[Math.floor(Math.random() * 3)],
        color: ATTRIBUTES.color[Math.floor(Math.random() * 3)],
        shape: ATTRIBUTES.shape[Math.floor(Math.random() * 3)],
        pattern: ATTRIBUTES.pattern[Math.floor(Math.random() * 3)]
    };
}

// Calculate the third card that completes the set
function calculateCompletingCard(card1, card2) {
    const card3 = {};
    
    for (let attr in card1) {
        const val1 = card1[attr];
        const val2 = card2[attr];
        
        if (val1 === val2) {
            // If same, third must be same
            card3[attr] = val1;
        } else {
            // If different, third must be the remaining one
            const options = ATTRIBUTES[attr];
            card3[attr] = options.find(opt => opt !== val1 && opt !== val2);
        }
    }
    
    return card3;
}

// Validate if three cards form a valid set
function isValidSet(card1, card2, card3) {
    for (let attr in card1) {
        const vals = [card1[attr], card2[attr], card3[attr]];
        const uniqueVals = new Set(vals);
        
        // Each attribute must be all same or all different
        if (uniqueVals.size === 2) {
            return false;
        }
    }
    return true;
}

// Draw a shape on SVG
function createShape(shape, color, pattern, index, total) {
    const svgNS = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNS, 'g');
    
    const yOffset = index * 35;
    const colorHex = COLOR_MAP[color];
    
    let shapeElement;
    
    if (shape === 'oval') {
        shapeElement = document.createElementNS(svgNS, 'ellipse');
        shapeElement.setAttribute('cx', '80');
        shapeElement.setAttribute('cy', 15 + yOffset);
        shapeElement.setAttribute('rx', '35');
        shapeElement.setAttribute('ry', '12');
    } else if (shape === 'diamond') {
        shapeElement = document.createElementNS(svgNS, 'polygon');
        const points = `80,${3 + yOffset} 115,${15 + yOffset} 80,${27 + yOffset} 45,${15 + yOffset}`;
        shapeElement.setAttribute('points', points);
    } else if (shape === 'wave') {
        shapeElement = document.createElementNS(svgNS, 'path');
        // Scale and position the tilde/wave shape from the SVG
        const scale = 5.8; // Scale up the 12x8 viewbox
        const centerX = 80;
        const centerY = 15 + yOffset;
        const offsetX = centerX - (12 * scale / 2);
        const offsetY = centerY - (8 * scale / 2);
        
        // Transform the original path coordinates
        const path = `M${2*scale + offsetX},${6.3*scale + offsetY}C${1.4*scale + offsetX},${6.3*scale + offsetY},${0.9*scale + offsetX},${6*scale + offsetY},${0.5*scale + offsetX},${5.5*scale + offsetY}C${0*scale + offsetX},${4.7*scale + offsetY},${0.2*scale + offsetX},${3.6*scale + offsetY},${1*scale + offsetX},${3*scale + offsetY}c${1.9*scale},${-1.3*scale},${4*scale},${-1.7*scale},${6*scale},${-0.6*scale}c${0.7*scale},${0.4*scale},${1.3*scale},${0.2*scale},${1.9*scale},${-0.3*scale}c${0.7*scale},${-0.6*scale},${1.8*scale},${-0.5*scale},${2.5*scale},${0.2*scale}c${0.6*scale},${0.7*scale},${0.5*scale},${1.8*scale},${-0.2*scale},${2.5*scale}C${9.4*scale + offsetX},${6.3*scale + offsetY},${7.3*scale + offsetX},${6.6*scale + offsetY},${5.3*scale + offsetX},${5.5*scale + offsetY}C${4.5*scale + offsetX},${5.1*scale + offsetY},${3.7*scale + offsetX},${5.4*scale + offsetY},${3*scale + offsetX},${6*scale + offsetY}C${2.7*scale + offsetX},${6.2*scale + offsetY},${2.3*scale + offsetX},${6.3*scale + offsetY},${2*scale + offsetX},${6.3*scale + offsetY}z`;
        shapeElement.setAttribute('d', path);
    }
    
    shapeElement.setAttribute('stroke', colorHex);
    shapeElement.setAttribute('stroke-width', '2');
    
    if (pattern === 'filled') {
        shapeElement.setAttribute('fill', colorHex);
    } else if (pattern === 'empty') {
        shapeElement.setAttribute('fill', 'none');
    } else if (pattern === 'striped') {
        // Create pattern for stripes
        const patternId = `stripe-${color}-${Math.random().toString(36).substr(2, 9)}`;
        const defs = document.createElementNS(svgNS, 'defs');
        const patternEl = document.createElementNS(svgNS, 'pattern');
        patternEl.setAttribute('id', patternId);
        patternEl.setAttribute('patternUnits', 'userSpaceOnUse');
        patternEl.setAttribute('width', '4');
        patternEl.setAttribute('height', '4');
        
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '0');
        line.setAttribute('x2', '0');
        line.setAttribute('y2', '4');
        line.setAttribute('stroke', colorHex);
        line.setAttribute('stroke-width', '2');
        
        patternEl.appendChild(line);
        defs.appendChild(patternEl);
        group.appendChild(defs);
        
        shapeElement.setAttribute('fill', `url(#${patternId})`);
    }
    
    group.appendChild(shapeElement);
    return group;
}

// Draw a card
function drawCard(card, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 120');
    svg.setAttribute('width', '160');
    svg.setAttribute('height', '120');
    
    for (let i = 0; i < card.number; i++) {
        const shape = createShape(card.shape, card.color, card.pattern, i, card.number);
        svg.appendChild(shape);
    }
    
    element.appendChild(svg);
}

// Get card description
function getCardDescription(card) {
    return `${card.number} ${card.pattern} ${card.color} ${card.shape}${card.number > 1 ? 's' : ''}`;
}

// Parse user input
function parseUserInput(input) {
    // Remove spaces and convert to lowercase
    input = input.toLowerCase().replace(/\s/g, '');
    
    // Split by comma if present, otherwise split into individual characters
    const parts = input.includes(',') ? input.split(',') : input.split('');
    
    const card = {};
    
    for (let part of parts) {
        // Skip empty parts
        if (!part) continue;
        
        // Check each attribute type
        if (SHORTHAND.number[part]) {
            card.number = SHORTHAND.number[part];
        } else if (SHORTHAND.color[part]) {
            card.color = SHORTHAND.color[part];
        } else if (SHORTHAND.shape[part]) {
            card.shape = SHORTHAND.shape[part];
        } else if (SHORTHAND.pattern[part]) {
            card.pattern = SHORTHAND.pattern[part];
        }
    }
    
    // Check if all attributes are present
    if (card.number && card.color && card.shape && card.pattern) {
        return card;
    }
    
    return null;
}

// Compare two cards
function cardsEqual(card1, card2) {
    return card1.number === card2.number &&
           card1.color === card2.color &&
           card1.shape === card2.shape &&
           card1.pattern === card2.pattern;
}

// Initialize new round
function newRound() {
    // Generate two random cards
    currentCards = [generateRandomCard(), generateRandomCard()];
    
    // Calculate the completing card
    correctCard = calculateCompletingCard(currentCards[0], currentCards[1]);
    
    // Draw cards
    drawCard(currentCards[0], 'card1');
    drawCard(currentCards[1], 'card2');
    
    // Clear feedback and solution
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('solution-area').style.display = 'none';
    document.getElementById('answer').value = '';
}

// Check answer
function checkAnswer() {
    const input = document.getElementById('answer').value;
    const userCard = parseUserInput(input);
    
    if (!userCard) {
        document.getElementById('feedback').textContent = 'Invalid input! Please use the format: 1,f,r,w';
        document.getElementById('feedback').className = 'feedback incorrect';
        return;
    }
    
    const feedbackEl = document.getElementById('feedback');
    const solutionArea = document.getElementById('solution-area');
    
    if (cardsEqual(userCard, correctCard)) {
        feedbackEl.textContent = '✓ Correct! Well done!';
        feedbackEl.className = 'feedback correct';
        stats.correct++;
        
        // Update stats
        document.getElementById('correct-count').textContent = stats.correct;
        document.getElementById('incorrect-count').textContent = stats.incorrect;
        
        // Handle challenge mode
        if (challengeMode) {
            challengeCorrectCount++;
            document.getElementById('challenge-progress').textContent = challengeCorrectCount;
            
            if (challengeCorrectCount >= challengeTarget) {
                const endTime = Date.now();
                const totalTime = ((endTime - challengeStartTime) / 1000).toFixed(2);
                
                let message = `🎉 Challenge Complete! Time: ${totalTime}s`;
                
                // Check and save best time based on challenge type
                const bestTimeKey = challengeTarget === 5 ? 'bestTime5' : 'bestTime';
                const currentBest = challengeTarget === 5 ? bestTime5 : bestTime;
                
                if (!currentBest || totalTime < currentBest) {
                    if (challengeTarget === 5) {
                        bestTime5 = totalTime;
                        localStorage.setItem('bestTime5', bestTime5);
                        document.getElementById('best-time-5').textContent = bestTime5 + 's';
                    } else {
                        bestTime = totalTime;
                        localStorage.setItem('bestTime', bestTime);
                        document.getElementById('best-time').textContent = bestTime + 's';
                    }
                    message += ` - NEW RECORD! 🏆`;
                } else {
                    message += ` (Best: ${currentBest}s)`;
                }
                
                feedbackEl.textContent = message;
                challengeMode = false;
                document.getElementById('challenge-info').style.display = 'none';
                document.getElementById('start-challenge-btn').style.display = 'inline-block';
                document.getElementById('start-challenge-5-btn').style.display = 'inline-block';
                
                setTimeout(() => {
                    newRound();
                }, 3000);
                return;
            }
        }
        
        // Generate new cards after a short delay
        setTimeout(() => {
            newRound();
        }, challengeMode ? 800 : 1500);
    } else {
        feedbackEl.textContent = '✗ Incorrect. Here\'s the correct answer:';
        feedbackEl.className = 'feedback incorrect';
        stats.incorrect++;
        
        // Handle challenge mode - end it on incorrect answer
        if (challengeMode) {
            feedbackEl.textContent = '✗ Challenge Failed! Starting over...';
            challengeMode = false;
            document.getElementById('challenge-info').style.display = 'none';
            document.getElementById('start-challenge-btn').style.display = 'inline-block';
            document.getElementById('start-challenge-5-btn').style.display = 'inline-block';
        }
        
        // Show solution
        solutionArea.style.display = 'block';
        drawCard(correctCard, 'solution-card');
        document.getElementById('solution-desc').textContent = getCardDescription(correctCard);
        
        // Update stats
        document.getElementById('correct-count').textContent = stats.correct;
        document.getElementById('incorrect-count').textContent = stats.incorrect;
    }
}

// Start challenge mode
function startChallenge(target = 10) {
    challengeMode = true;
    challengeStartTime = Date.now();
    challengeCorrectCount = 0;
    challengeTarget = target;
    
    document.getElementById('challenge-info').style.display = 'block';
    document.getElementById('challenge-progress').textContent = '0';
    document.getElementById('challenge-target').textContent = target;
    document.getElementById('start-challenge-btn').style.display = 'none';
    document.getElementById('start-challenge-5-btn').style.display = 'none';
    
    newRound();
    
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = `⏱️ Challenge Started! Complete ${target} cards as fast as you can!`;
    feedbackEl.className = 'feedback';
    feedbackEl.style.color = '#667eea';
    
    setTimeout(() => {
        feedbackEl.textContent = '';
        feedbackEl.style.color = '';
    }, 2000);
}

// Event listeners
document.getElementById('submit-btn').addEventListener('click', checkAnswer);
document.getElementById('new-cards-btn').addEventListener('click', newRound);
document.getElementById('start-challenge-btn').addEventListener('click', () => startChallenge(10));
document.getElementById('start-challenge-5-btn').addEventListener('click', () => startChallenge(5));
document.getElementById('answer').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Initialize
newRound();

// Display best times if they exist
if (bestTime) {
    document.getElementById('best-time').textContent = bestTime + 's';
}
if (bestTime5) {
    document.getElementById('best-time-5').textContent = bestTime5 + 's';
}
