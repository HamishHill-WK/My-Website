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
function toggleContent(contentID, titleID) {
    const content = document.getElementById(contentID);
    const title = document.getElementById(titleID);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
    if (content.style.display === 'none') {
        title.classList.remove('open'); // Remove the class to rotate the arrow up
    } else if (content.style.display === 'block') {
        title.classList.add('open'); // Add the class to rotate the arrow down
    }
}

request();