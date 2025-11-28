// Utility functions
function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    return { width: rect.width, height: rect.height };
}

// 1. Prediction Visualization - Predator tracking prey
function initPredictionCanvas() {
    const canvas = document.getElementById('predictionCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let prey = { x: width * 0.7, y: height * 0.5, vx: -1, vy: 0.5 };
    let predator = { x: width * 0.2, y: height * 0.5 };
    let predictionPath = [];

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update prey position
        prey.x += prey.vx;
        prey.y += prey.vy;

        // Bounce prey off walls
        if (prey.x < 30 || prey.x > width - 30) prey.vx *= -1;
        if (prey.y < 30 || prey.y > height - 30) prey.vy *= -1;

        // Predict prey position
        const predictSteps = 60;
        predictionPath = [];
        let px = prey.x, py = prey.y;
        let pvx = prey.vx, pvy = prey.vy;

        for (let i = 0; i < predictSteps; i++) {
            px += pvx;
            py += pvy;
            if (px < 30 || px > width - 30) pvx *= -1;
            if (py < 30 || py > height - 30) pvy *= -1;
            predictionPath.push({ x: px, y: py });
        }

        // Move predator towards predicted position
        const target = predictionPath[Math.min(20, predictionPath.length - 1)];
        const dx = target.x - predator.x;
        const dy = target.y - predator.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
            predator.x += (dx / dist) * 1.5;
            predator.y += (dy / dist) * 1.5;
        }

        // Draw prediction path
        ctx.strokeStyle = 'rgba(66, 153, 225, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prey.x, prey.y);
        predictionPath.forEach((p, i) => {
            ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Draw prey
        ctx.fillStyle = '#48bb78';
        ctx.beginPath();
        ctx.arc(prey.x, prey.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw predator
        ctx.fillStyle = '#f56565';
        ctx.beginPath();
        ctx.arc(predator.x, predator.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw line from predator to target
        ctx.strokeStyle = 'rgba(245, 101, 101, 0.3)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(predator.x, predator.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;
    });
}

// 2. Intelligence Explosion - Exponential growth
function initExplosionCanvas() {
    const canvas = document.getElementById('explosionCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        time += 0.02;

        // Draw axes
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, height - 50);
        ctx.lineTo(width - 20, height - 50);
        ctx.moveTo(50, height - 50);
        ctx.lineTo(50, 20);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#4a5568';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time', width / 2, height - 15);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Intelligence', 0, 0);
        ctx.restore();

        // Draw exponential curve
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 50; x < width - 20; x += 2) {
            const t = (x - 50) / (width - 70);
            const y = height - 50 - (Math.exp(t * 4 * (time % 1)) - 1) * (height - 100) / (Math.exp(4) - 1);

            if (x === 50) {
                ctx.moveTo(x, Math.max(20, y));
            } else {
                ctx.lineTo(x, Math.max(20, y));
            }
        }
        ctx.stroke();

        // Draw particles representing individuals
        const numParticles = Math.floor(10 + Math.exp(3 * (time % 1)));
        ctx.fillStyle = '#764ba2';

        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const radius = 30 + (time % 1) * 50;
            const x = width - 100 + Math.cos(angle) * radius;
            const y = 100 + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;
    });
}

// 3. Symbiogenesis - Entities merging
function initSymbiogenesisCanvas() {
    const canvas = document.getElementById('symbiogenesisCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let entities = [];
    let nextId = 0;

    class Entity {
        constructor(x, y, size = 1, color = null) {
            this.id = nextId++;
            this.x = x;
            this.y = y;
            this.size = size;
            this.radius = 15 * Math.sqrt(size);
            this.color = color || `hsl(${Math.random() * 360}, 70%, 60%)`;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.components = [];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x - this.radius < 0 || this.x + this.radius > width) this.vx *= -1;
            if (this.y - this.radius < 0 || this.y + this.radius > height) this.vy *= -1;

            this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
        }

        draw() {
            // Draw outer circle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw components inside
            if (this.components.length > 0) {
                this.components.forEach((comp, i) => {
                    const angle = (i / this.components.length) * Math.PI * 2;
                    const r = this.radius * 0.5;
                    const cx = this.x + Math.cos(angle) * r * 0.5;
                    const cy = this.y + Math.sin(angle) * r * 0.5;

                    ctx.fillStyle = comp.color;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            // Draw size indicator
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.size, this.x, this.y);
        }
    }

    // Initialize with some entities
    for (let i = 0; i < 8; i++) {
        entities.push(new Entity(
            Math.random() * (width - 60) + 30,
            Math.random() * (height - 60) + 30
        ));
    }

    function checkMergers() {
        for (let i = entities.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                const e1 = entities[i];
                const e2 = entities[j];
                const dx = e1.x - e2.x;
                const dy = e1.y - e2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < e1.radius + e2.radius) {
                    // Merge!
                    const newSize = e1.size + e2.size;
                    const newEntity = new Entity(
                        (e1.x + e2.x) / 2,
                        (e1.y + e2.y) / 2,
                        newSize,
                        `hsl(${(Math.random() * 360)}, 70%, 60%)`
                    );
                    newEntity.components = [
                        { color: e1.color },
                        { color: e2.color },
                        ...e1.components,
                        ...e2.components
                    ];

                    entities.splice(i, 1);
                    entities.splice(j, 1);
                    entities.push(newEntity);
                    return;
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        entities.forEach(e => {
            e.update();
            e.draw();
        });

        requestAnimationFrame(animate);
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (entities.length < 15) {
            entities.push(new Entity(x, y));
        }

        checkMergers();
    });

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;
    });
}

// 4. Parallelization Visualization
function initParallelCanvas() {
    const canvas = document.getElementById('parallelCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let time = 0;
    const numTasks = 8;

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.02;

        const leftX = width * 0.25;
        const rightX = width * 0.75;
        const topY = height * 0.2;
        const spacing = 25;

        // Sequential Processing (Left)
        ctx.fillStyle = '#4a5568';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sequential', leftX, 30);

        const sequentialProgress = (time % (numTasks * 2)) / 2;
        const currentTask = Math.floor(sequentialProgress);
        const taskProgress = sequentialProgress - currentTask;

        for (let i = 0; i < numTasks; i++) {
            const y = topY + i * spacing;

            // Background
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(leftX - 60, y, 120, 20);

            // Progress
            if (i < currentTask) {
                ctx.fillStyle = '#48bb78';
                ctx.fillRect(leftX - 60, y, 120, 20);
            } else if (i === currentTask) {
                ctx.fillStyle = '#4299e1';
                ctx.fillRect(leftX - 60, y, 120 * taskProgress, 20);
            }

            // Border
            ctx.strokeStyle = '#cbd5e0';
            ctx.strokeRect(leftX - 60, y, 120, 20);
        }

        // Parallel Processing (Right)
        ctx.fillStyle = '#4a5568';
        ctx.fillText('Parallel', rightX, 30);

        const parallelProgress = (time % 2) / 2;

        for (let i = 0; i < numTasks; i++) {
            const y = topY + i * spacing;

            // Background
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(rightX - 60, y, 120, 20);

            // Progress (all tasks progress simultaneously)
            ctx.fillStyle = parallelProgress >= 1 ? '#48bb78' : '#4299e1';
            ctx.fillRect(rightX - 60, y, 120 * parallelProgress, 20);

            // Border
            ctx.strokeStyle = '#cbd5e0';
            ctx.strokeRect(rightX - 60, y, 120, 20);
        }

        // Time comparison
        const seqTime = Math.max(0, (time % (numTasks * 2)));
        const parTime = Math.max(0, (time % 2));

        ctx.fillStyle = '#4a5568';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Time: ${seqTime.toFixed(1)}s`, leftX, height - 30);
        ctx.fillText(`Time: ${parTime.toFixed(1)}s`, rightX, height - 30);

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;
    });
}

// 5. Computogenesis - From feedback loops to universal computation
function initComputogenesisCanvas() {
    const canvas = document.getElementById('computogenesisCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let time = 0;

    function drawFeedbackLoop(x, y, radius, phase, label) {
        const points = 30;
        const angleStep = (Math.PI * 2) / points;

        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
            const angle = i * angleStep;
            const r = radius + Math.sin(angle * 3 + phase) * 5;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw arrow
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + radius + 10, y - 5);
        ctx.lineTo(x + radius + 10, y + 5);
        ctx.fill();

        // Label
        ctx.fillStyle = '#4a5568';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + radius + 20);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.05;

        const progress = (Math.sin(time) + 1) / 2;

        // Stage 1: Simple feedback loops
        if (width > 500) {
            drawFeedbackLoop(width * 0.15, height * 0.3, 30, time, 'Thermostat');
            drawFeedbackLoop(width * 0.35, height * 0.3, 30, time + 1, 'Catalyst');

            // Stage 2: Combined loops
            drawFeedbackLoop(width * 0.25, height * 0.6, 45, time, 'Combined');

            // Arrows
            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(width * 0.15, height * 0.35);
            ctx.lineTo(width * 0.22, height * 0.55);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(width * 0.35, height * 0.35);
            ctx.lineTo(width * 0.28, height * 0.55);
            ctx.stroke();

            ctx.setLineDash([]);

            // Stage 3: Universal Turing Machine
            const tmX = width * 0.7;
            const tmY = height * 0.5;

            // Tape
            const tapeWidth = 200;
            const cellWidth = 30;
            const numCells = Math.floor(tapeWidth / cellWidth);

            for (let i = 0; i < numCells; i++) {
                const x = tmX - tapeWidth / 2 + i * cellWidth;
                ctx.strokeStyle = '#cbd5e0';
                ctx.fillStyle = i === Math.floor(progress * numCells) ? '#4299e1' : '#ffffff';
                ctx.fillRect(x, tmY - 15, cellWidth, 30);
                ctx.strokeRect(x, tmY - 15, cellWidth, 30);

                // Random symbols
                ctx.fillStyle = '#4a5568';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(['0', '1', 'A', 'B'][i % 4], x + cellWidth / 2, tmY + 5);
            }

            // Head
            ctx.fillStyle = '#f56565';
            ctx.beginPath();
            const headX = tmX - tapeWidth / 2 + Math.floor(progress * numCells) * cellWidth + cellWidth / 2;
            ctx.moveTo(headX, tmY - 25);
            ctx.lineTo(headX - 10, tmY - 35);
            ctx.lineTo(headX + 10, tmY - 35);
            ctx.fill();

            ctx.fillStyle = '#4a5568';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Universal Turing Machine', tmX, tmY + 50);

            // Arrow from combined to TM
            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(width * 0.35, height * 0.6);
            ctx.lineTo(width * 0.55, height * 0.5);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;
    });
}

// 6. Future - Human-AI co-evolution
function initFutureCanvas() {
    const canvas = document.getElementById('futureCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let time = 0;

    class Node {
        constructor(x, y, type, label) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.label = label;
            this.connections = [];
        }

        draw() {
            const colors = {
                human: '#48bb78',
                ai: '#4299e1',
                machine: '#9f7aea',
                nature: '#38b2ac'
            };

            ctx.fillStyle = colors[this.type] || '#718096';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.label, this.x, this.y);
        }
    }

    const nodes = [
        new Node(width * 0.3, height * 0.3, 'human', 'Human'),
        new Node(width * 0.7, height * 0.3, 'ai', 'AI'),
        new Node(width * 0.5, height * 0.6, 'machine', 'Tech'),
        new Node(width * 0.2, height * 0.7, 'nature', 'Bio'),
        new Node(width * 0.8, height * 0.7, 'machine', 'Data')
    ];

    // Define connections
    nodes[0].connections = [1, 2, 3];
    nodes[1].connections = [0, 2, 4];
    nodes[2].connections = [0, 1, 3, 4];
    nodes[3].connections = [0, 2];
    nodes[4].connections = [1, 2];

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.05;

        // Draw connections
        nodes.forEach((node, i) => {
            node.connections.forEach(targetIdx => {
                const target = nodes[targetIdx];

                const pulsePhase = (time + i * 0.5) % (Math.PI * 2);
                const opacity = (Math.sin(pulsePhase) + 1) / 2 * 0.5 + 0.3;

                ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();

                // Draw data packets
                const progress = (pulsePhase / (Math.PI * 2));
                const px = node.x + (target.x - node.x) * progress;
                const py = node.y + (target.y - node.y) * progress;

                ctx.fillStyle = '#667eea';
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Draw nodes
        nodes.forEach(node => node.draw());

        // Title
        ctx.fillStyle = '#4a5568';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Symbiogenetic Network', width / 2, 30);

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;

        // Reposition nodes
        nodes[0].x = width * 0.3; nodes[0].y = height * 0.3;
        nodes[1].x = width * 0.7; nodes[1].y = height * 0.3;
        nodes[2].x = width * 0.5; nodes[2].y = height * 0.6;
        nodes[3].x = width * 0.2; nodes[3].y = height * 0.7;
        nodes[4].x = width * 0.8; nodes[4].y = height * 0.7;
    });
}

// 7. Metabolic Scaling - Power law
function initMetabolicCanvas() {
    const canvas = document.getElementById('metabolicCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let { width, height } = resizeCanvas(canvas);

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);
        time += 0.02;

        const margin = 60;
        const graphWidth = width - margin * 2;
        const graphHeight = height - margin * 2;

        // Draw axes
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(margin, margin);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#2d3748';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Organism Mass', width / 2, height - 15);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Metabolic Rate', 0, 0);
        ctx.restore();

        // Draw linear reference line
        ctx.strokeStyle = 'rgba(203, 213, 224, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(margin, height - margin);
        ctx.lineTo(width - margin, margin);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#a0aec0';
        ctx.font = '11px sans-serif';
        ctx.fillText('Linear (1:1)', width - 80, margin + 20);

        // Draw 3/4 power law curve
        ctx.strokeStyle = '#ed8936';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = margin; x <= width - margin; x += 2) {
            const t = (x - margin) / graphWidth;
            const mass = Math.pow(t, 1);
            const metabolicRate = Math.pow(mass, 0.75);
            const y = height - margin - metabolicRate * graphHeight;

            if (x === margin) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        ctx.fillStyle = '#ed8936';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('3/4 Power Law', width / 2, margin + 40);

        // Draw animated organisms
        const organisms = [
            { name: 'Bacteria', mass: 0.1, emoji: '•' },
            { name: 'Insect', mass: 0.25, emoji: '🐜' },
            { name: 'Mouse', mass: 0.4, emoji: '🐁' },
            { name: 'Human', mass: 0.65, emoji: '🧍' },
            { name: 'Elephant', mass: 0.9, emoji: '🐘' }
        ];

        const visibleIndex = Math.floor((time % (organisms.length * 1.5)) / 1.5);

        organisms.slice(0, visibleIndex + 1).forEach((org, i) => {
            const x = margin + org.mass * graphWidth;
            const metabolicRate = Math.pow(org.mass, 0.75);
            const y = height - margin - metabolicRate * graphHeight;

            const scale = 1 + Math.sin(time * 3 + i) * 0.1;

            ctx.fillStyle = '#2d3748';
            ctx.font = `${20 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(org.emoji, x, y);

            ctx.fillStyle = '#4a5568';
            ctx.font = '10px sans-serif';
            ctx.fillText(org.name, x, y + 25);
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        const size = resizeCanvas(canvas);
        width = size.width;
        height = size.height;
    });
}

// Initialize all visualizations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPredictionCanvas();
    initExplosionCanvas();
    initSymbiogenesisCanvas();
    initParallelCanvas();
    initComputogenesisCanvas();
    initFutureCanvas();
    initMetabolicCanvas();
});
