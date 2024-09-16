let timeLeft = 60;
const timeElement = document.getElementById("time");
const circleElement = document.getElementById("circle");

function startTimer() {
  const countdown = setInterval(() => {
    timeLeft--;
    timeElement.textContent = timeLeft;

    // Update the circular progress (adjusting the background)
    let percentage = (timeLeft / 60) * 360;
    circleElement.style.background = `conic-gradient(#17a2b8 ${percentage}deg, #e0e0e0 ${percentage}deg)`;

    if (timeLeft <= 0) {
      timeLeft = 60; // Reset the timer
    }
  }, 1000); // 1000ms = 1 second
}

window.onload = function () {
  startTimer();
};

// Functionality of toggle button
const toggleButton = document.getElementById("toggleButton");

toggleButton.addEventListener("click", function () {
  this.classList.toggle("active");
});

//Fetching the data from the api

document.addEventListener("DOMContentLoaded", () => {
  const loaderElement = document.getElementById("loader");
  const bestPriceDetails = document.getElementById("bestDetails");
  // Fetch data from the API
  fetch("/api/getTop10")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Print the fetched data to the console
      const results = data.data;
      loaderElement.classList.add("hide-loader");
      bestPriceDetails.classList.remove("hide-loader");
      createTable(results);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

function createTable(records) {
  // Select the container where the table will be inserted
  const tableContainer = document.getElementById("data-table");

  // Create table and table header elements
  const table = document.createElement("table");
  table.classList.add("crypto-table");

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Define table headers
  const headers = [
    "#",
    "Platform",
    "Name",
    "Last Traded Price",
    "Buy / Sell Price",
    "Difference",
    "Volume",
    "Base Unit",
  ];

  // Create header row
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Create table rows for each record
  records.forEach((record, index) => {
    const row = document.createElement("tr");

    // Create cells for each field
    const serialCell = document.createElement("td");
    serialCell.textContent = index + 1; // Serial number

    const platformCell = document.createElement("td");
    platformCell.innerHTML = `<div class="platform-cell">
          <img class="platform-icon" src="https://wazirx.com/static/media/wazirx-logo-rounded.9bff9f42.png" />
          WazirX
      </div>`;

    const nameCell = document.createElement("td");
    nameCell.textContent = record.name;

    const lastPriceCell = document.createElement("td");
    lastPriceCell.textContent = `₹ ${record.last}`;

    const priceCell = document.createElement("td");
    priceCell.textContent = `₹ ${record.buy} / ₹ ${record.sell}`;

    const diffPercentage = calculatePercentageDifference(
      record.buy,
      record.sell
    );
    const diffPercentageCell = document.createElement("td");
    diffPercentageCell.textContent = `${diffPercentage.toFixed(2)} %`;
    diffPercentageCell.classList.add(
      diffPercentage < 0 ? "negative" : "positive"
    );

    const volumeCell = document.createElement("td");
    volumeCell.textContent = record.volume;

    const baseUnitCell = document.createElement("td");
    baseUnitCell.textContent = record.base_unit;

    // Append cells to the row
    row.appendChild(serialCell);
    row.appendChild(platformCell);
    row.appendChild(nameCell);
    row.appendChild(lastPriceCell);
    row.appendChild(priceCell);
    row.appendChild(diffPercentageCell);
    row.appendChild(volumeCell);
    row.appendChild(baseUnitCell);

    tbody.appendChild(row);
  });

  // Append thead and tbody to the table
  table.appendChild(thead);
  table.appendChild(tbody);

  // Clear existing content and append the new table
  tableContainer.innerHTML = ""; // Clear any existing content
  tableContainer.appendChild(table);
}

function calculatePercentageDifference(buyingPrice, sellingPrice) {
  if (buyingPrice === 0) {
    return 0; // Avoid division by zero
  }
  return ((sellingPrice - buyingPrice) / buyingPrice) * 100;
}
