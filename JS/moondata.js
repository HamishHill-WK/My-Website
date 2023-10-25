//this script uses data from NASA's moon api and then loads it to the web page.
//NASA api is available here: https://svs.gsfc.nasa.gov/5048 
function request(date)  { //this function is used to make a request to the nasa api
    const dateToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;  //0must be added to single digit days or months for the api request to be valid
    const time = `${String(date.getHours()).padStart(2, '0') }:${String(date.getMinutes()).padStart(2, '0')}`; //0 must be added to single digit for the api request to be valid
    return fetch(`https://svs.gsfc.nasa.gov/api/dialamoon/${dateToday}T${time}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function whichPhase(illumination, prevIllum) { //this function returns the name of the current moon phase using illumination. NASA's api only returns the illumination percent and not the name of the phase.
    if (illumination < 1) {
        return "New Moon";
    }
    if (illumination > 99) {
        return "Full Moon";
    }

    const waxing = illumination > prevIllum;

    if (waxing) {
        if (illumination > 1 && illumination < 49) {
            return "Waxing Crescent"
        }

        if (illumination > 51 && illumination < 99) {
            return "Waxing Gibbous"
        }

        if (illumination > 49 && illumination < 51) {
            return "First Quarter"
        }
    }

    if (!waxing) {
        if (illumination > 1 && illumination < 49) {
            return "Waning Crescent"
        }

        if (illumination > 51 && illumination < 99) {
            return "Waning Gibbous"
        }

        if (illumination > 49 && illumination < 51) {
            return "Third Quarter"
        }
    }
}

function init() {
    let date = new Date();

    const currentDataPromise = request(date);

    date.setHours(date.getHours() - 1); //to determine whether the moon is waxing or waning, data is collected from the previous hour.
    const prevDataPromise = request(date);

    const moonImage = document.getElementById('moonimage');
    const currentIllum = document.getElementById('current-illumination');
    const currentPhase = document.getElementById('current-phase');
    const currentAge = document.getElementById('current-age');
    const currentDistance = document.getElementById('current-distance');

    Promise.all([currentDataPromise, prevDataPromise])  //this is used to wait for both api requests to complete
        .then(data => {
            const currentData = data[0];
            const prevData = data[1];
            moonImage.src = currentData.image.url;
            currentIllum.textContent = `Illumination: ${currentData.phase}%`;
            currentPhase.textContent = "Current Phase: " + whichPhase(currentData.phase, prevData.phase);
            currentAge.textContent = `Age: ${currentData.age} days`
            currentDistance.textContent = `Distance from Earth: ${currentData.distance} km`
        })
        .catch(error => {
            console.error('Error', error);
        });
}

function toggleContent(contentID, titleID) {    //this function is used to hide or show the different sections on each phase of the moon.
    const content = document.getElementById(contentID);
    const title = document.getElementById(titleID);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
    if (content.style.display === 'none') {
        title.classList.remove('open'); // Remove the class to rotate the arrow back to horizontal
    } else if (content.style.display === 'block') {
        title.classList.add('open'); // Add the class to rotate the arrow down
    }
}

init();