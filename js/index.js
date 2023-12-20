//#fff Most variables

let countryCode = "";
let cityNames = "";
let weatherInfo = "";
let unitOfMeasurement = "";

const countryInput = document.getElementById("countryInput");
const countryList = document.getElementById("countryList");

const cityInput = document.getElementById("cityInput");
const cityList = document.getElementById("cityList");

//#000 End

//#fff Code for local storage

let localStorageCountry = "";
let localStorageCity = "";
let localStorageUnit = "";

if (localStorage.getItem("localStorageCountry")) {
  localStorageCountry = localStorage.getItem("localStorageCountry");
  countryInput.value = localStorageCountry;
}

if (localStorage.getItem("localStorageCity")) {
  localStorageCity = localStorage.getItem("localStorageCity");
  cityInput.value = localStorageCity;
  getCityInfo();
}

if (localStorage.getItem("localStorageUnit")) {
  localStorageUnit = localStorage.getItem("localStorageUnit");
  document.getElementById(localStorageUnit).checked = true;
}

getWeatherInfo();

const theme = localStorage.getItem("theme");
if (theme) {
  if (theme === "dark") {
    document.documentElement.style.setProperty("--primary-color", "white");
    document.documentElement.style.setProperty("--secondary-color", "black");
  } else {
    document.documentElement.style.setProperty("--primary-color", "black");
    document.documentElement.style.setProperty("--secondary-color", "white");
  }
}

//#000 End

//#fff Funtion for rounding decimal number

function roundToDecimalPlaces(number, decimalPlaces) {
  const factor = 10 ** decimalPlaces;
  return Math.round(number * factor) / factor;
}

//#000 End

//#fff Function for formatting unix time

function convertUnixTimestampTo12HourClock(unixTimestamp) {
  const milliseconds = unixTimestamp * 1000;
  const dateObject = new Date(milliseconds);

  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const seconds = dateObject.getSeconds();

  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${padZero(formattedHours)}:${padZero(minutes)} ${ampm}`;
}

function padZero(number) {
  return number < 10 ? "0" + number : number;
}

//#000 End

// #fff Function for displaying list below text box

function displayTextList(textBox, listDiv, dataArray) {
  textBox.addEventListener("input", () => {
    const searchTerm = textBox.value.toLowerCase();
    if (dataArray) {
      const filteredArray = dataArray
        .filter((data) => data.toLowerCase().startsWith(searchTerm))
        .slice(0, 4);
      listDiv.innerHTML = "";
      if (filteredArray.length > 0) {
        listDiv.style.display = "block";
        filteredArray.forEach((data) => {
          const listItem = document.createElement("div");
          listItem.textContent = data;
          listItem.classList.add("listItem");
          listItem.addEventListener("click", () => {
            textBox.value = data;
            listDiv.style.display = "none";
          });
          listDiv.appendChild(listItem);
        });
        listDiv
          .getElementsByClassName("listItem")[0]
          .classList.add("highlightedListItem");
        if (textBox.value.length === 0) {
          listDiv.innerHTML = "";
          listDiv.style.display = "none";
        }
      } else {
        listDiv.style.display = "none";
      }
      document.addEventListener("click", (event) => {
        if (event.target !== textBox && event.target !== listDiv) {
          listDiv.style.display = "none";
        }
      });
    } else {
      listDiv.innerHTML = "";
    }
  });
  let i = 0;
  textBox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (listDiv.getElementsByClassName("listItem").length > i + 1) {
        listDiv
          .getElementsByClassName("listItem")
          [i].classList.remove("highlightedListItem");
        i++;
        listDiv
          .getElementsByClassName("listItem")
          [i].classList.add("highlightedListItem");
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (i !== 0) {
        listDiv
          .getElementsByClassName("listItem")
          [i].classList.remove("highlightedListItem");
        i--;
        listDiv
          .getElementsByClassName("listItem")
          [i].classList.add("highlightedListItem");
      }
    }
    if (event.key === "Enter") {
      event.preventDefault();
      textBox.value = listDiv.getElementsByClassName("listItem")[i].textContent;
      listDiv.style.display = "none";
      i = 0;
    }
    if (event.key === "Escape") {
      textBox.blur();
      listDiv.style.display = "none";
      i = 0;
    }
  });
  textBox.addEventListener("focusout", () => {
    i = 0;
  });
}

//#000 End

//#fff Code for displaying country list

import countryInfo from "./countryInfo.js";

const countryNames = countryInfo.map((country) => country.name);

displayTextList(countryInput, countryList, countryNames);

//#000 End

//##fff Code for extracting city info and country code

function getCityInfo() {
  setTimeout(() => {
    if (countryInfo.find((item) => item.name === countryInput.value)) {
      const countryName = countryInput.value;
      localStorage.setItem("localStorageCountry", countryName);
      countryCode = countryInfo.find((item) => item.name === countryName).code;
      const apiUrl = "https://countriesnow.space/api/v0.1/countries/cities";
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: countryName }),
      })
        .then((response) => response.json())
        .then((data) => {
          cityNames = data.data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      cityNames = "";
    }
  }, 100);
}

countryInput.addEventListener("focusout", () => {
  getCityInfo();
  cityNames = "";
});

//#000 End

//#fff Code for displaying city list

cityInput.addEventListener("focusin", () => {
  setTimeout(() => {
    displayTextList(cityInput, cityList, cityNames);
  }, 2000);
});

//#000 End

//#fff Code for extracting weather info

function getWeatherInfo() {
  const metricRadios = document.getElementsByName("weatherUnit");

  const isAnyRadioSelected = [...metricRadios].some((radio) => radio.checked);

  if (!isAnyRadioSelected || !countryInput.value || !cityInput.value) {
    document.getElementById("toggleLocationForm").checked = true;
    setTimeout(() => {
      document.getElementById("locationForm").style.display = "flex";
    }, 90);
    return;
  } else {
    localStorage.setItem("localStorageCity", cityInput.value);
    for (const radio of metricRadios) {
      if (radio.checked) {
        const unit = radio.value;
        unitOfMeasurement = unit;
        localStorage.setItem("localStorageUnit", unitOfMeasurement);
      }
    }
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput.value},${countryCode}&appid=f8a66323cbe54ebbeff8181bf5113da2&units=${unitOfMeasurement}`;
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        weatherInfo = data;
        displayWeather(weatherInfo);
        document.getElementById("toggleLocationForm").checked = false;
        setTimeout(() => {
          document.getElementById("locationForm").style.display = "none";
        }, 90);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }
}

document
  .getElementById("getWeatherInfo")
  .addEventListener("click", getWeatherInfo);

//#000 End

//#fff Code for displaying the weather info

function displayWeather(weatherInfo) {
  const weatherName = weatherInfo.weather[0].main;
  const weatherIcon = `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`;
  const lastUpdated = `Last updated ${convertUnixTimestampTo12HourClock(
    weatherInfo.dt
  )}`;
  const tempUnit = unitOfMeasurement === "metric" ? "°C" : "°F";
  const temp = `${roundToDecimalPlaces(weatherInfo.main.temp, 1)}${tempUnit}`;
  const humidity = weatherInfo.main.humidity;
  const windSpeedUnit = unitOfMeasurement === "metric" ? "m/s" : "mi/s";
  const windSpeed = `${
    Math.round(weatherInfo.wind.speed * 2) / 2
  }${windSpeedUnit}`;
  const feelsLike = `Feels like ${roundToDecimalPlaces(
    weatherInfo.main.feels_like,
    1
  )}${tempUnit}`;
  document.querySelector(".weatherInfo").innerHTML = `
  <span class="outputLocation">
    ${cityInput.value} <span class="outputCountryCode">${countryCode}</span>
  </span>
  <span class="outputTemp">${temp}</span>
  <span class="outputWeather">
    <img src=${weatherIcon} alt="weatherImg" />
    <span>${weatherName}</span>
  </span>
  <span class="outputFeelsLikeTemp">${feelsLike}</span>
  <div class="humidityWindSpeedContainer">
    <div class="humidityBox">
      <i class="fa-solid fa-water"></i>
      <div>
        <span class="outputHumidity">${humidity}%</span>
        <span>Humidity</span>
      </div>
    </div>
    <div class="windSpeedBox">
      <i class="fa-solid fa-wind"></i>
      <div>
        <span class="outputWindSpeed">${windSpeed}</span>
        <span>Wind speed</span>
      </div>
    </div>
  </div>
  <span class="outputLastUpdated">${lastUpdated}</span>`;
}

function checkChecked() {
  if (document.getElementById("toggleLocationForm").checked === true) {
    setTimeout(() => {
      document.getElementById("locationForm").style.display = "none";
    }, 90);
  } else {
    setTimeout(() => {
      document.getElementById("locationForm").style.display = "flex";
    }, 90);
  }
}

document
  .querySelector(".toggleLocationForm")
  .addEventListener("click", checkChecked);

//#000 End

//#fff Function to fetch user's location

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      // Get latitude and longitude
      const { latitude, longitude } = position.coords;

      // Call the IP geolocation service
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=f8a66323cbe54ebbeff8181bf5113da2`
      )
        .then((response) => response.json())
        .then((data) => {
          countryCode = data.sys.country.toLowerCase();
          const countryName = countryInfo.find(
            (item) => item.code === countryCode
          ).name;
          countryInput.value = countryName;
          localStorage.setItem("localStorageCountry", countryName);
          getCityInfo();
          cityInput.value = data.name;
          localStorage.setItem("localStorageCity", cityInput.value);
        })
        .catch((error) => {
          console.error("Error fetching location:", error);
          console.log("Unknown City", "Unknown Country");
        });
    }, handleLocationError);
  } else {
    console.error("Geolocation is not supported by this browser.");
    getUserLocation();
  }
}

// Function to handle errors during geolocation retrieval
function handleLocationError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}

document.getElementById("locationBtn").addEventListener("click", (event) => {
  event.preventDefault();
  getUserLocation();
});

//#000 End

//#fff Code for changing the theme

function changeTheme() {
  const primaryColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--primary-color");
  if (primaryColor === "white") {
    document.documentElement.style.setProperty("--primary-color", "black");
    document.documentElement.style.setProperty("--secondary-color", "white");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.style.setProperty("--primary-color", "white");
    document.documentElement.style.setProperty("--secondary-color", "black");
    localStorage.setItem("theme", "dark");
  }
}

document.getElementById("changeTheme").addEventListener("click", changeTheme);

//#000 End
