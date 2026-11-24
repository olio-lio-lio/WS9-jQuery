
let tempChart = null; // Global chart reference
let chartData = {}; // Store data and labels for reuse
let city = "Helsinki";
let forecast = [];

const language = document.documentElement.lang === "en" ? "en" : "fi";

async function getForecast(city, apiKey) {
  const locations = await axios.get(
    "https://api.openweathermap.org/geo/1.0/direct",
    {
      params: { q: city, limit: 1, appid: apiKey }
    }
  );

  const place = locations.data[0];
  if (!place) return [];

  const response = await axios.get(
    "https://api.openweathermap.org/data/2.5/forecast",
    {
      params: {
        lat: place.lat,
        lon: place.lon,
        units: "metric",
        appid: apiKey
      }
    }
  );

  return response.data.list;
}

async function haeSaa() {

  city = document.getElementById("kaupunki").value.trim();
  const apiKey = document.getElementById("apiKey").value.trim();

  if (!city || !apiKey) {
  alert("Please enter both a city and an API key.");
  return;
}
   
  try {

    forecast = await getForecast(city, apiKey);
const data = forecast;
   if (data.length === 0) {
   alert("City not found. Please check the city name.");
   return;
}


    // Get the temperature and time recorded every three hours.
      const labels = data.map((item) => {
      const aika = new Date(item.dt_txt);
      return `${aika.getDate()}.${aika.getHours()}:00`;
    });

    const temperatures = data.map((item) => item.main.temp);
    const lowest = Math.min(...temperatures);
    const highest = Math.max(...temperatures);

document.getElementById("forecastSummary").textContent =
  `${city} · ${lowest.toFixed(1)} to ${highest.toFixed(1)} °C`;
    chartData = { labels, temperatures }; // Store the values for reuse.
    
    piirraKaavio(labels, temperatures, city, "line");
  } catch (error) {
    console.error("Error fetching data:", error);
    console.log("OpenWeather response:", error.response?.data);
    alert(
      language === "en"
        ? "Could not fetch weather data. Check the city name or API key."
        : "Säädatan hakeminen epäonnistui. Tarkista kaupungin nimi tai API-avain."
    );
  }
}

 

// Load the weather for Helsinki when the page opens.
function piirraKaavio(labels, data, city, type) {
  const ctx = document.getElementById("tempChart").getContext("2d");

  // Destroy the previous chart before creating a new one.
  if (tempChart) {
  tempChart.destroy();
}

  // Create a new chart.
    tempChart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: `${language === "en" ? "Temperature" : "Lämpötila"} (${city}) °C`,
          data: data,
          borderWidth: 2,
          borderColor: "rgb(75, 192, 192)",
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

function paivitaKaavio() {
  // Get the selected chart type.
  let type = document.getElementById("chartType").value;
  console.log(type);
  // Redraw the chart with the selected type and previously fetched data.
  piirraKaavio(chartData.labels, chartData.temperatures, city, type);
}


$("#haeSaaPainike").on("click", function () {
      $("#saaYllatys").stop(true, true).hide()
      .fadeIn(400).delay(3000).fadeOut(800);
    haeSaa();
  });

