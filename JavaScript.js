function startTime() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('clock').innerHTML =  h + ":" + m + ":" + s;
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};
  return i;
}

// Kun käyttäjä klikkaa painiketta, vaihda piilottamisen ja näyttämisen välillä pudotusvalikon sisällössä
function myFunction() {
  const dropdown = document.getElementById("myDropdown");
  dropdown.classList.toggle("show");

  // Lisätään seuraavat rivit
  if (dropdown.classList.contains("show")) {
    // Ei tehdä mitään, kun dropdown avautuu
  }
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

// Käsitellään aseman valinta ja päivitetään valittu asema
function updateSelectedStation(stationShortCode) {
  const selectedStation = stationInfo.find(station => station.stationShortCode === stationShortCode);

  if (selectedStation) {
    // Päivitetään lomake valitun aseman tiedoilla
    document.getElementById("myInput").value = stationShortCode;
    document.getElementById("dropdown-button").textContent = selectedStation.stationName;

    // Päivitetään junatiedot ja summary
    fetchAndDisplayTrains(stationShortCode)
      .then((data) => {
        updateTrainList(data); // Lisätään tämä rivi
        updateSummary(selectedStation, data);
      })
      .catch((error) => {
        console.error('Virhe junatietoja haettaessa:', error);
      });

    document.getElementById("myDropdown").classList.remove("show");
  }
}

// Päivitetään junatiedot näytöllä
function updateTrainList(data) {
  // Tämä funktio päivittää junatiedot näytölle
}

// Päivitetään junatiedot ja summary sekä tyhjennetään lomake
function fetchAndDisplayTrains(stationShortCode) {
  const apiUrl = `https://rata.digitraffic.fi/api/v1/live-trains/station/${stationShortCode}?departing_trains=20&include_nonstopping=false`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Virhe junatietoja haettaessa');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Virhe junatietoja haettaessa:', error);
    });
}

// Päivitetään junatiedot ja summary sekä tyhjennetään lomake
function selectStation(stationShortCode) {
  const selectedStation = stationInfo.find(station => station.stationShortCode === stationShortCode);

  if (selectedStation) {
    // Päivitetään lomake valitun aseman tiedoilla
    document.getElementById("myInput").value = stationShortCode;
    document.getElementById("dropdown-button").textContent = selectedStation.stationName;

    // Päivitetään junatiedot ja summary sekä tyhjennetään lomake
    fetchAndDisplayTrains(stationShortCode)
      .then((data) => {
        updateTrainList(data);
        updateSummary(selectedStation, data);

        // Tyhjennetään lomake
        document.getElementById("myInput").value = ''; // Tyhjennetään input-kenttä
      })
      .catch((error) => {
        console.error('Virhe junatietoja haettaessa:', error);
      });

    document.getElementById("myDropdown").classList.remove("show");
  }
}

// Päivitetään summary-osio valitun aseman junatiedoilla
function updateSummary(selectedStation, data) {
  // Muodostetaan asematiedot objektiin lyhenteiden perusteella
  const stationData = {};
  stationInfo.forEach((station) => {
    stationData[station.stationShortCode] = station.stationName;
  });

  // Tyhjennetään summary
  const summary = document.getElementById('summary');
  summary.innerHTML = '';

  // Luodaan div-elementti, johon lisätään junatiedot summaryyn
  const summaryContainer = document.createElement('div');

  // Lisätään junatiedot div-elementtiin
  data.forEach((train, index) => {
    if (index < 10) {
      const summaryItem = document.createElement('p');
      summaryItem.classList.add('summary-info');

      const lineIdentifier = train.commuterLineID || train.trainType;

      // Tarkistetaan, että aikataulutiedot ovat olemassa ja lähtöaika on määritelty
      const firstTimeTableRow = train.timeTableRows.find(row => row.stationShortCode === selectedStation.stationShortCode && row.type === 'DEPARTURE');
      console.log(firstTimeTableRow)
      const actualTime = firstTimeTableRow.actualTime;
      const scheduledTime = firstTimeTableRow.scheduledTime;

      const departureTime = actualTime || scheduledTime;
      const formattedDepartureTime = departureTime ? new Date(departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ei tiedossa';

      const lastDestinationCode = train.timeTableRows[train.timeTableRows.length - 1].stationShortCode;
      const lastDestinationName = stationData[lastDestinationCode];

      // Lisätään raiteen numero, jos se on saatavilla, ja se on numero
      const commercialTrack = firstTimeTableRow?.commercialTrack;
      const trackInfo = commercialTrack !== undefined && commercialTrack !== null && !isNaN(commercialTrack) ? `, <strong>Raide:</strong> ${commercialTrack}` : '';

      summaryItem.innerHTML = `${lineIdentifier}, <strong>Lähtöaika:</strong> ${formattedDepartureTime}${trackInfo}, <strong>Määränpää:</strong> ${lastDestinationName}`;

      summaryContainer.appendChild(summaryItem);
    }
  });

  // Lisätään div-elementti summaryyn
  summary.appendChild(summaryContainer);
}

// Tehdään tästä globaali muuttuja
let stationInfo;

document.addEventListener('DOMContentLoaded', () => {
  const stationDropdown = document.getElementById('myDropdown');
  const dropdownButton = document.getElementById("dropdown-button");

  // Haetaan asematiedot
  const stationInfoUrl = 'https://rata.digitraffic.fi/api/v1/metadata/stations';
  fetch(stationInfoUrl)
    .then((response) => response.json())
    .then((data) => {
      stationInfo = data; // Tallennetaan asematiedot globaaliin muuttujaan

      // Lisätään asemat pudotusvalikkoon
      stationInfo.forEach((station) => {
        const option = document.createElement('a');
        option.textContent = station.stationName;
        option.addEventListener('click', () => selectStation(station.stationShortCode));
        stationDropdown.appendChild(option);
      });
    })
    .catch((error) => {
      console.error('Virhe:', error);
    });
});