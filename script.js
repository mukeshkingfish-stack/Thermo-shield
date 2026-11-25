
// ==========================================
// THERMOSHIELD - MAIN JAVASCRIPT
// ==========================================

// 1. SAMPLE HOTSPOT DATA

let hotspots = [
    {
        id: "TS-001",
        name: "Forest Fire",
        location: "Tamil Nadu",
        lat: 11.0168,
        lng: 76.9558,
        status: "CRITICAL",
        frp: 85,
        risk: 95,
        persistence: 6,
        distance: 120,
        confidence: 96
    },
    {
        id: "TS-002",
        name: "Industrial Heat",
        location: "Chennai",
        lat: 13.0827,
        lng: 80.2707,
        status: "SUPPRESSED",
        frp: 15,
        risk: 20,
        persistence: 2,
        distance: 80,
        confidence: 80
    },
    {
        id: "TS-003",
        name: "Forest Anomaly",
        location: "Kerala",
        lat: 10.8505,
        lng: 76.2711,
        status: "REVIEW",
        frp: 45,
        risk: 65,
        persistence: 4,
        distance: 900,
        confidence: 85
    },
    {
        id: "TS-004",
        name: "Thermal Hotspot",
        location: "Karnataka",
        lat: 12.9716,
        lng: 77.5946,
        status: "CRITICAL",
        frp: 75,
        risk: 90,
        persistence: 7,
        distance: 1500,
        confidence: 95
    },
    {
        id: "TS-005",
        name: "Agricultural Burning",
        location: "Andhra Pradesh",
        lat: 16.5062,
        lng: 80.6480,
        status: "SUPPRESSED",
        frp: 10,
        risk: 15,
        persistence: 1,
        distance: 400,
        confidence: 70
    },
    {
        id: "TS-006",
        name: "Forest Thermal Event",
        location: "Odisha",
        lat: 20.2961,
        lng: 85.8245,
        status: "REVIEW",
        frp: 38,
        risk: 55,
        persistence: 3,
        distance: 2000,
        confidence: 82
    },
    {
        id: "TS-007",
        name: "High Temperature Zone",
        location: "Maharashtra",
        lat: 19.0760,
        lng: 72.8777,
        status: "CRITICAL",
        frp: 90,
        risk: 98,
        persistence: 7,
        distance: 3000,
        confidence: 98
    },
    {
        id: "TS-008",
        name: "Industrial Heat Zone",
        location: "Gujarat",
        lat: 23.0225,
        lng: 72.5714,
        status: "SUPPRESSED",
        frp: 12,
        risk: 18,
        persistence: 1,
        distance: 100,
        confidence: 75
    }
];

let selectedHotspot = null;
let auditLogs = [];
let map;
let markers = [];
let thermalChart;


// 2. PAGE NAVIGATION

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(pageName).classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(button => {
        if (button.dataset.page === pageName) {
            button.classList.add("active");
        }
    });

    document.getElementById("mobileMenu").style.display = "none";

    if (pageName === "triage" && map) {
        setTimeout(() => map.invalidateSize(), 200);
    }
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

function toggleMenu() {

    const menu = document.getElementById("mobileMenu");

    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}


// 3. DASHBOARD STATISTICS

function updateStatistics() {

    const total = hotspots.length;

    const suppressedCount = hotspots.filter(
        item => item.status === "SUPPRESSED"
    ).length;

    const criticalCount = hotspots.filter(
        item => item.status === "CRITICAL"
    ).length;

    const suppressionRate = total
        ? Math.round((suppressedCount / total) * 100)
        : 0;

    document.getElementById("totalDetections").textContent = total;

    document.getElementById("suppressed").textContent =
        suppressionRate + "%";

    document.getElementById("critical").textContent = criticalCount;

    document.getElementById("savings").textContent =
        "₹" + (suppressedCount * 0.5).toFixed(1) + " Cr";
}


// 4. HOTSPOT TABLE

function renderTable() {

    const tbody = document.getElementById("hotspotTable");

    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    const filter = document.getElementById("statusFilter").value;

    tbody.innerHTML = "";

    const filtered = hotspots.filter(item => {

        const matchesSearch =
            item.name.toLowerCase().includes(search) ||
            item.location.toLowerCase().includes(search) ||
            item.id.toLowerCase().includes(search);

        const matchesStatus =
            filter === "ALL" || item.status === filter;

        return matchesSearch && matchesStatus;
    });

    filtered.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}<br><small>${item.id}</small></td>
            <td>${item.location}</td>
            <td>
                <span class="status ${item.status}">
                    ${item.status}
                </span>
            </td>
            <td>${item.frp}</td>
            <td>${item.risk}%</td>
        `;

        row.addEventListener("click", () => {
            selectHotspot(item.id);
        });

        tbody.appendChild(row);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">No hotspots found.</td>
            </tr>
        `;
    }
}


// 5. HOTSPOT INSPECTOR

function selectHotspot(id) {

    selectedHotspot = hotspots.find(item => item.id === id);

    if (!selectedHotspot) return;

    const item = selectedHotspot;

    document.getElementById("inspectorContent").innerHTML = `

        <h2>${item.name}</h2>

        <p><strong>ID:</strong> ${item.id}</p>

        <p><strong>Location:</strong> ${item.location}</p>

        <p>
            <strong>Status:</strong>
            <span class="status ${item.status}">
                ${item.status}
            </span>
        </p>

        <div class="inspector-details">

            <p><strong>FRP:</strong> ${item.frp} MW</p>

            <p><strong>Risk Score:</strong> ${item.risk}%</p>

            <p><strong>Persistence:</strong>
                ${item.persistence} / 7 days
            </p>

            <p><strong>Industrial Distance:</strong>
                ${item.distance} metres
            </p>

            <p><strong>Confidence:</strong>
                ${item.confidence}%
            </p>

            <p><strong>Latitude:</strong> ${item.lat}</p>

            <p><strong>Longitude:</strong> ${item.lng}</p>

        </div>
    `;

    map.setView([item.lat, item.lng], 8);
}


// 6. MAP INITIALIZATION

function initializeMap() {

    if (!window.L) {
        document.getElementById("map").textContent =
            "Map library could not load. Check your internet connection.";
        return;
    }

    map = L.map("map").setView([20.5937, 78.9629], 5);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    updateMapMarkers();
}

function updateMapMarkers() {

    if (!map) return;

    markers.forEach(marker => map.removeLayer(marker));

    markers = [];

    hotspots.forEach(item => {

        let color = "#06b6d4";

        if (item.status === "CRITICAL") {
            color = "#f43f5e";
        }

        if (item.status === "REVIEW") {
            color = "#fbbf24";
        }

        const marker = L.circleMarker(
            [item.lat, item.lng],
            {
                radius: 9,
                color: color,
                fillColor: color,
                fillOpacity: 0.8,
                weight: 2
            }
        ).addTo(map);

        marker.bindPopup(`
            <b>${item.name}</b><br>
            ID: ${item.id}<br>
            Location: ${item.location}<br>
            Status: ${item.status}<br>
            Risk: ${item.risk}%
        `);

        marker.on("click", () => {
            selectHotspot(item.id);
        });

        markers.push(marker);
    });
}

function resetMap() {

    if (map) {
        map.setView([20.5937, 78.9629], 5);
    }
}


// 7. THERMAL CHART

function initializeChart() {

    const canvas = document.getElementById("thermalChart");

    if (!window.Chart) {
        canvas.parentElement.innerHTML =
            "Chart library could not load. Check your internet connection.";
        return;
    }

    thermalChart = new Chart(canvas, {

        type: "bar",

        data: {
            labels: ["Tamil Nadu", "Chennai", "Kerala",
                     "Karnataka", "Andhra Pradesh", "Odisha"],

            datasets: [{
                label: "Thermal Energy (FRP MW)",

                data: [85, 15, 45, 75, 10, 38],

                backgroundColor: [
                    "#f43f5e",
                    "#06b6d4",
                    "#fbbf24",
                    "#f43f5e",
                    "#06b6d4",
                    "#fbbf24"
                ],

                borderRadius: 5
            }]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: "#cbd5e1"
                    }
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: "#94a3b8"
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        color: "#94a3b8"
                    }
                }
            }
        }
    });
}


// 8. AUDIT LOG

function addAudit(id, action, details) {

    const time = new Date().toLocaleString();

    auditLogs.unshift({
        time,
        id,
        action,
        details
    });

    renderAudit();
}

function renderAudit() {

    const tbody = document.getElementById("auditTable");

    tbody.innerHTML = "";

    auditLogs.forEach(log => {

        const row = document.createElement("tr");

        [
            log.time,
            log.id,
            log.action,
            log.details
        ].forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function clearAudit() {

    if (confirm("Are you sure you want to clear the audit log?")) {

        auditLogs = [];

        renderAudit();
    }
}


// 9. ALERT DISPATCH

function dispatchAlert() {

    if (!selectedHotspot) {
        alert("Please select a hotspot first.");
        return;
    }

    if (selectedHotspot.status === "SUPPRESSED") {
        alert("Suppressed hotspot cannot be dispatched.");
        return;
    }

    selectedHotspot.status = "CRITICAL";

    addAudit(
        selectedHotspot.id,
        "DISPATCH",
        "Demo dispatch action recorded"
    );

    refreshDashboard();

    alert("Demo dispatch action recorded successfully.");
}

function reviewAlert() {

    if (!selectedHotspot) {
        alert("Please select a hotspot first.");
        return;
    }

    selectedHotspot.status = "REVIEW";

    addAudit(
        selectedHotspot.id,
        "REVIEW",
        "Hotspot marked for manual review"
    );

    refreshDashboard();

    selectHotspot(selectedHotspot.id);
}

function suppressAlert() {

    if (!selectedHotspot) {
        alert("Please select a hotspot first.");
        return;
    }

    selectedHotspot.status = "SUPPRESSED";

    addAudit(
        selectedHotspot.id,
        "SUPPRESSED",
        "Hotspot marked as suppressed"
    );

    refreshDashboard();

    selectHotspot(selectedHotspot.id);
}


// 10. TRIAGE ENGINE

function runEngine() {

    const frp = Number(document.getElementById("frp").value);

    const persistence =
        Number(document.getElementById("persistence").value);

    const distance =
        Number(document.getElementById("distance").value);

    const confidence =
        Number(document.getElementById("confidence").value);

    if (
        !Number.isFinite(frp) ||
        !Number.isFinite(persistence) ||
        !Number.isFinite(distance) ||
        !Number.isFinite(confidence) ||
        frp < 0 ||
        persistence < 0 ||
        persistence > 7 ||
        distance < 0 ||
        confidence < 0 ||
        confidence > 100
    ) {
        alert("Please enter valid values.");
        return;
    }

    let risk = 0;

    // FRP contribution
    risk += Math.min(frp, 100) * 0.4;

    // Persistence contribution
    risk += persistence * 5;

    // Distance contribution
    if (distance > 500) {
        risk += 15;
    } else {
        risk -= 10;
    }

    // Confidence contribution
    risk += confidence * 0.2;

    risk = Math.max(0, Math.min(100, Math.round(risk)));

    let status;

    if (risk >= 70) {
        status = "CRITICAL";
    } else if (risk >= 40) {
        status = "REVIEW";
    } else {
        status = "SUPPRESSED";
    }

    document.getElementById("engineResult").innerHTML = `

        <h3>Classification Result</h3>

        <p><strong>Risk Score:</strong> ${risk}%</p>

        <p><strong>Status:</strong>
            <span class="status ${status}">${status}</span>
        </p>

        <p><strong>FRP:</strong> ${frp} MW</p>

        <p><strong>Persistence:</strong> ${persistence} days</p>

        <p><strong>Confidence:</strong> ${confidence}%</p>

        <p>Classification completed using the demo risk model.</p>
    `;

    addAudit(
        "SIMULATOR",
        "CLASSIFICATION",
        "Risk: " + risk + "% - " + status
    );
}


// 11. BATCH SIMULATION

function simulateBatch() {

    const count = 1000;

    const critical = Math.floor(Math.random() * 150) + 50;

    const suppressed = Math.floor(Math.random() * 400) + 200;

    const review = count - critical - suppressed;

    document.getElementById("totalDetections").textContent = count;

    document.getElementById("critical").textContent = critical;

    document.getElementById("suppressed").textContent =
        Math.round((suppressed / count) * 100) + "%";

    document.getElementById("savings").textContent =
        "₹" + (suppressed * 0.005).toFixed(2) + " Cr";

    addAudit(
        "BATCH-1000",
        "BATCH SIMULATION",
        `Critical: ${critical}, Review: ${review}, Suppressed: ${suppressed}`
    );

    alert(
        "Demo batch simulation completed!\n\n" +
        "Total Alerts: " + count +
        "\nCritical: " + critical +
        "\nReview: " + review +
        "\nSuppressed: " + suppressed
    );
}


// 12. DATA EXPORT - JSON

function exportData() {

    const data = {
        hotspots: hotspots,
        auditLogs: auditLogs
    };

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    downloadFile(blob, "thermoshield-data.json");
}


// 13. DATA EXPORT - CSV

function exportCSV() {

    const headers = [
        "ID",
        "Name",
        "Location",
        "Status",
        "FRP",
        "Risk"
    ];

    const rows = hotspots.map(item => [
        item.id,
        item.name,
        item.location,
        item.status,
        item.frp,
        item.risk
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(","))
        .join("\n");

    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    downloadFile(blob, "thermoshield-data.csv");
}


// 14. IMPORT JSON DATA

function importData(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const data = JSON.parse(e.target.result);

            if (!Array.isArray(data.hotspots)) {
                throw new Error("Invalid hotspot data");
            }

            const valid = data.hotspots.every(item =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.location === "string" &&
                ["CRITICAL", "REVIEW", "SUPPRESSED"].includes(item.status) &&
                Number.isFinite(item.lat) &&
                Number.isFinite(item.lng) &&
                Number.isFinite(item.frp) &&
                Number.isFinite(item.risk)
            );

            if (!valid) {
                throw new Error("Invalid hotspot records");
            }

            hotspots = data.hotspots;

            if (Array.isArray(data.auditLogs)) {
                auditLogs = data.auditLogs;
            }

            refreshDashboard();

            alert("Data imported successfully!");

        } catch (error) {

            alert("Invalid JSON file: " + error.message);
        }

        event.target.value = "";
    };

    reader.readAsText(file);
}


// 15. DOWNLOAD HELPER

function downloadFile(blob, filename) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);
}


// 16. REFRESH DASHBOARD

function refreshDashboard() {

    updateStatistics();

    renderTable();

    updateMapMarkers();

}


// 17. INITIALIZE WEBSITE

document.addEventListener("DOMContentLoaded", function() {

    updateStatistics();

    renderTable();

    initializeMap();

    initializeChart();

    addAudit(
        "SYSTEM",
        "START",
        "ThermoShield demo dashboard initialized"
    );

});
