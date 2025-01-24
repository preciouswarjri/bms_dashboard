// Declare WebSocket variable globally
let ws;

// Data storage for CSV export
const data = [];
let xAxisIndex = 1; // Variable to track x-axis as numbers (1, 2, 3, etc.)

// Function to handle connection
function connectWebSocket() {
    const websocketIp = document.getElementById('websocketIp').value;

    if (!websocketIp) {
        alert('Please enter a valid WebSocket IP address.');
        return;
    }

    // Create WebSocket connection
    ws = new WebSocket(websocketIp);

    // Initialize charts
    const voltageChart = new Chart(document.getElementById('voltageChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Voltage (V)',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, type: 'linear', min: 1 },  // Set x-axis to be numerical
                y: { display: true, beginAtZero: true },
            },
        },
    });

    const currentChart = new Chart(document.getElementById('currentChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Current (A)',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, type: 'linear', min: 1 },  // Set x-axis to be numerical
                y: { display: true, beginAtZero: true },
            },
        },
    });

    const temperatureChart = new Chart(document.getElementById('temperatureChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, type: 'linear', min: 1 },  // Set x-axis to be numerical
                y: { display: true, beginAtZero: true },
            },
        },
    });

    const socChart = new Chart(document.getElementById('socChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'SOC (%)',
                data: [],
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, type: 'linear', min: 1 },  // Set x-axis to be numerical
                y: { display: true, beginAtZero: true },
            },
        },
    });

    const relayChart = new Chart(document.getElementById('relayChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Relay Status',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true },
                y: {
                    display: true,
                    ticks: {
                        callback: function (value) {
                            return value === 1 ? '1' : value === 0 ? '0' : '';
                        },
                        beginAtZero: true,
                        max: 1,
                        stepSize: 1,
                    },
                },
            },
        },
    });

    // WebSocket event handlers
    ws.onmessage = function (event) {
        const sensorData = JSON.parse(event.data);

        // Update charts with the new data
        voltageChart.data.labels.push(xAxisIndex);
        voltageChart.data.datasets[0].data.push(sensorData.voltage);
        voltageChart.update();

        currentChart.data.labels.push(xAxisIndex);
        currentChart.data.datasets[0].data.push(sensorData.current);
        currentChart.update();

        temperatureChart.data.labels.push(xAxisIndex);
        temperatureChart.data.datasets[0].data.push(sensorData.temperature);
        temperatureChart.update();

        socChart.data.labels.push(xAxisIndex);
        socChart.data.datasets[0].data.push(sensorData.soc);
        socChart.update();

        relayChart.data.labels.push(xAxisIndex);
        relayChart.data.datasets[0].data.push(sensorData.relay ? 1 : 0);
        relayChart.update();

        // Store data for CSV
        data.push({
            time: xAxisIndex,
            voltage: sensorData.voltage,
            current: sensorData.current,
            temperature: sensorData.temperature,
            soc: sensorData.soc,
            relay: sensorData.relay ? 'ON' : 'OFF',
        });

        xAxisIndex++;  // Increment the x-axis index
    };

    ws.onopen = function () {
        console.log('Connected to WebSocket server');
        document.getElementById('connectionSection').style.display = 'none';
        document.querySelector('.chart-grid').style.display = 'grid';
        document.getElementById('downloadCSV').style.display = 'block';
    };

    ws.onclose = function () {
        console.log('Disconnected from WebSocket server');
    };
}

// Function to download CSV
function downloadCSV() {
    const csvRows = [];
    const headers = ['Time', 'Voltage', 'Current', 'Temperature', 'SOC', 'Relay'];
    csvRows.push(headers.join(','));

    data.forEach(row => {
        const values = [
            row.time,
            row.voltage,
            row.current,
            row.temperature,
            row.soc,
            row.relay,
        ];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sensor_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.getElementById('connectButton').addEventListener('click', connectWebSocket);
document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
