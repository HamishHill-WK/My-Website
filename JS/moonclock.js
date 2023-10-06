function request() {
    let date = new Date();
    let dateToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    let time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`; //59.07 at 15:32
    fetch(`https://svs.gsfc.nasa.gov/api/dialamoon/${dateToday}T${time}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const moonImage = document.getElementById('moonimage');
            moonImage.src = data.image.url;
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
request();