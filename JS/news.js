const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
		const text = document.getElementById('text');
		text.textContent = `${this.responseText}`;
	}
});
const query = 'tesla';
//xhr.open('GET', 'https://bing-news-search1.p.rapidapi.com/news?textFormat=Raw&safeSearch=Off');
xhr.open('GET', `https://bing-news-search1.p.rapidapi.com/news/search?q=%${query}%3E&safeSearch=Off&textFormat=Raw&freshness=Day`);

xhr.setRequestHeader('X-BingApis-SDK', 'true');
xhr.setRequestHeader('X-RapidAPI-Key', 'b3a6381559mshf35fb4490e6d9a4p1fc424jsn94928ddf29c6');
xhr.setRequestHeader('X-RapidAPI-Host', 'bing-news-search1.p.rapidapi.com');

xhr.send(data);