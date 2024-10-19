// Initial values
let r = 5;
let x1 = 0.5;
let n = 0;
let intervalId = null;

// Get the HTML elements
const rRange = document.getElementById('rRange');
const rValue = document.getElementById('rValue');
const x1Range = document.getElementById('x1Range');
const x1Value = document.getElementById('x1Value');
const ctx = document.getElementById('chartCanvas').getContext('2d');
const box = document.getElementById('box');
const resetButton = document.getElementById('resetButton');

// Set up Matter.js physics engine
const { Engine, Render, Runner, Bodies, World, Body } = Matter;

let engine = Engine.create();
let world = engine.world;

let render = Render.create({
  element: box,
  engine: engine,
  options: {
    width: 300,
    height: 300,
    background: '#1a202c',
    wireframes: false
  }
});

Render.run(render);
let runner = Runner.create();
Runner.run(runner, engine);

// Create boundaries (box walls)
const boundaries = [
  Bodies.rectangle(150, 0, 300, 10, { isStatic: true }), // top
  Bodies.rectangle(150, 300, 300, 10, { isStatic: true }), // bottom
  Bodies.rectangle(0, 150, 10, 300, { isStatic: true }), // left
  Bodies.rectangle(300, 150, 10, 300, { isStatic: true }) // right
];

World.add(world, boundaries);

// Function to calculate the logistic map sequence
function calculateSequence(r, x1, iterations) {
  let x = x1;
  const sequence = [{ iteration: 0, value: x }];
  for (let i = 1; i <= iterations; i++) {
    x = r * x * (1 - x);
    sequence.push({ iteration: i, value: x });
  }
  return sequence;
}

// Function to update the chart
function updateChart(r, x1, highlightIndex) {
  const data = calculateSequence(r, x1, 100);

  const chartData = {
    labels: data.map(d => d.iteration),
    datasets: [{
      label: 'Logistic Map',
      data: data.map(d => d.value),
      borderColor: 'rgb(0, 255, 0)',
      fill: false,
      pointRadius: data.map((d, i) => (i === highlightIndex ? 6 : 2)),
      pointBackgroundColor: data.map((d, i) => (i === highlightIndex ? 'yellow' : 'rgb(0, 255, 0)')),
      borderWidth: 1
    }]
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Iteration'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        },
        min: 0,
        max: 1
      }
    }
  };

  if (window.myChart) {
    window.myChart.data = chartData;
    window.myChart.update();
  } else {
    window.myChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
  }
}

// Function to add circles to the box
function addCircles(count) {
  // Clear previous bodies from the world
  World.clear(world, false);

  // Re-add boundaries to the world
  World.add(world, boundaries);

  // Add circles to the world
  for (let i = 0; i < count; i++) {
    const radius = 20; // Small circle size
    const circle = Bodies.circle(Math.random() * 260 + 20, 10, radius, {
      restitution: 0.8,
      render: {
        fillStyle: 'transparent',  // Transparent fill for the circle
        sprite: {
          texture: 'image.png',
          xScale: radius / 160,  // Scale the image relative to the circle size
          yScale: radius / 160   // Adjust the image to fit inside the circle
        }
      }
    });
    World.add(world, circle);
  }
}

// Event listeners for the sliders
rRange.addEventListener('input', (e) => {
  r = Number(e.target.value);
  rValue.textContent = r.toFixed(2);
  updateChart(r, x1, n);
});

x1Range.addEventListener('input', (e) => {
  x1 = Number(e.target.value);
  x1Value.textContent = x1.toFixed(2);
  updateChart(r, x1, n);
});

// Function to start the simulation
function startSimulation() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  n = 1;
  intervalId = setInterval(() => {
    const data = calculateSequence(r, x1, n);
    const latestXn = data[data.length - 1].value;
    const count = Math.floor(latestXn * 50);  // Multiply Xn by 50
    addCircles(count);  // Add circles to the box
    updateChart(r, x1, n);  // Highlight the current n point in yellow

    n++;
  }, 1000);  // 1초에 2회씩 증가
}

// Reset button click event
resetButton.addEventListener('click', () => {
  startSimulation();
});

// Initial chart rendering
updateChart(r, x1, n);
