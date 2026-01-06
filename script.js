const form = document.getElementById("etfForm");
const ergebnis = document.getElementById("ergebnis");

const startkapitalInput = document.getElementById("startkapital");
const sparrateInput = document.getElementById("sparrate");
const laufzeitInput = document.getElementById("laufzeit");
const renditeInput = document.getElementById("rendite");
const terInput = document.getElementById("ter");
const inflationInput = document.getElementById("inflation");

let chart = null;
let letzteBerechnung = null;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let start = Number(startkapitalInput.value);
  let sparrate = Number(sparrateInput.value);
  let jahre = Number(laufzeitInput.value);
  let rendite = Number(renditeInput.value) / 100;
  let ter = Number(terInput.value) / 100;
  let inflation = Number(inflationInput.value) / 100;

  let nettoRendite = rendite - ter;
  let monatsRendite = nettoRendite / 12;

  let kapital = start;
  let eingezahlt = start;

  let labels = [];
  let nominal = [];
  let real = [];

  for (let jahr = 1; jahr <= jahre; jahr++) {
    for (let monat = 1; monat <= 12; monat++) {
      kapital += sparrate;
      eingezahlt += sparrate;
      kapital *= (1 + monatsRendite);
    }

    let realwert = kapital / Math.pow(1 + inflation, jahr);

    labels.push("Jahr " + jahr);
    nominal.push(kapital.toFixed(2));
    real.push(realwert.toFixed(2));

  }

  ergebnis.innerHTML =
    "<p>💰 Endkapital nominal: <strong>" + kapital.toFixed(2) + " €</strong></p>" +
    "<p>📉 Inflationsbereinigt: <strong>" + real[real.length - 1] + " €</strong></p>" +
    "<p>📥 Eingezahlt: " + eingezahlt.toFixed(2) + " €</p>";

  letzteBerechnung = {
    kapital: kapital,
    realwert: real[real.length - 1],
    eingezahlt: eingezahlt
  };

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        { label: "Nominal", data: nominal, borderWidth: 2 },
        { label: "Inflationsbereinigt", data: real, borderWidth: 2 }
      ]
    }
  });
});

/* Presets */
function preset(type) {
  if (type === "anfänger") {
    sparrateInput.value = 150;
    renditeInput.value = 6;
    laufzeitInput.value = 30;
  }
  if (type === "durchschnitt") {
    sparrateInput.value = 300;
    renditeInput.value = 7;
    laufzeitInput.value = 35;
  }
  if (type === "fire") {
    sparrateInput.value = 800;
    renditeInput.value = 7;
    laufzeitInput.value = 25;
  }
}

/* PDF Export */
function exportPDF() {
  if (!letzteBerechnung) {
    alert("Bitte zuerst eine Berechnung durchführen.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 15;

  pdf.setFontSize(16);
  pdf.text("ETF-Sparplan – Ergebnisübersicht", 10, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.text("Eingabedaten:", 10, y);
  y += 8;

  pdf.text(`Startkapital: ${startkapitalInput.value} €`, 10, y); y += 6;
  pdf.text(`Monatliche Sparrate: ${sparrateInput.value} €`, 10, y); y += 6;
  pdf.text(`Laufzeit: ${laufzeitInput.value} Jahre`, 10, y); y += 6;
  pdf.text(`Rendite: ${renditeInput.value} % p.a.`, 10, y); y += 6;
  pdf.text(`TER: ${terInput.value} % p.a.`, 10, y); y += 6;
  pdf.text(`Inflation: ${inflationInput.value} % p.a.`, 10, y); y += 10;

  pdf.text("Ergebnisse:", 10, y);
  y += 8;

  pdf.text(`Endkapital nominal: ${letzteBerechnung.kapital.toFixed(2)} €`, 10, y); y += 6;
  pdf.text(`Inflationsbereinigt: ${letzteBerechnung.realwert} €`, 10, y); y += 6;
  pdf.text(`Eingezahlt: ${letzteBerechnung.eingezahlt.toFixed(2)} €`, 10, y); y += 10;

  // 🔹 Chart als Bild
  const chartCanvas = document.getElementById("chart");
  const chartImage = chartCanvas.toDataURL("image/png", 1.0);

  pdf.addPage();
  pdf.setFontSize(14);
  pdf.text("Depotentwicklung", 10, 15);
  pdf.addImage(chartImage, "PNG", 10, 25, 190, 90);

  pdf.save("ETF-Rechner-Ergebnis.pdf");
}



