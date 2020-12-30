/*
	파일명: openweatherAPIuse.js
	설명: opeaweathermap.org 날씨API 가공하여 처리하는 스크립트
	작성일: 2020-12-27
	작성자: 백희승
*/

// 타 js파일과 jQuery 충돌 방지를 위해 글로벌 객체 $(jQuery)에서 지역 객체 $w 선언한다..
// 참고 : https://yubylab.tistory.com/entry/%EB%8B%A4%EB%A5%B8-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A1%9C%EB%B6%80%ED%84%B0-jQuery-%EB%B3%B4%ED%98%B8%ED%95%98%EA%B8%B0
// fetch 사용 = get request
jQuery(document).ready(function($) {
	const cityName = "Seoul";
	const cityId = "1835848";	// 서울 코드
	const myAPIKey = "553443488ecc7e0c8a291ed1bfe91121";	// API Key
	let weatherURL, lat, long;	// API 요청주소, 위도, 경도
	
	
	// Geolocation API 비동기 요청으로 현재 위치를 대략적인 위도,경도로 가져오기	
	const getPosition = function(){
		return new Promise( (resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			}
		});
	}
	
	// 가져온 위도, 경도로 API 요청 주소 만들기
	function makeURL(position){
		lat = position.coords.latitude;
		long = position.coords.longitude;
		weatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&appid="+ myAPIKey + "&units=metric";
		return weatherURL;
	}
	
	// 만들어진 API 요청주소로 날씨 JSON 요청
	function getData(_targetURL){
		return new Promise( (resolve, reject) => {
			$.ajax({
				url : _targetURL, 
				type : "GET",
				dataType : "json",
				success : (data) => {	// 수신 성공 시 resolve
					resolve(data);
				},
				error : (xhr) => {		// 수신 실패 시 reject + throw Error
					console.log("STATUS CODE : " + xhr.status + " ERROR");
					reject(new Error("Weather API Request is failed"));
				}
			});
		});
	}
	
	function makeItMove(id){ 
		let iconName = "";
		if(id >= 800){
			switch(id) {
			case 801:
			case 802:
				iconName = "PARTLY_CLOUDY_DAY";
				break;
			case 803:
			case 804:
				iconName = "CLOUDY";
				break;
			default:
				iconName = "CLEAR_DAY";
			}
		}else{
			let division = String(id).substring(0, 1);
			switch(division){
			case "2":
				iconName = "WIND";
				break;
			case "3":
			case "6":
				iconName = "SNOW";
				break;
			case "5":
				iconName = "RAIN";
				break;
			default:
				iconName = "FOG";
			}
		}
		return iconName;
	}
	
	// 받아온 JSON 가공
	function processUI(data){
		let {id, description} = data.weather[0];
		let {temp, feels_like} = data.main;
		//let speed = data.wind.speed;
		let country = data.sys.country;
		let city = data.name;
		
		let skycon = new Skycons({color:"black"});
		
		let UI = "<b>" + description + "</b>"
				+ "<p> 기온 : " + temp + "°C</p>"
				+ "<p> 체감 : " + feels_like + "°C</p>"
				//+ "<p> 습도 : " + humidity + "%</p>"
				//+ "<p> 풍속 : " + speed + " m/s </p>"
				+ "<p> " + country + ", " + city + " 기준</p>";
		
		//$('.weather-desc').append(UI);
		
		let title = "<h5>" + city + ", " + country + "</h5>";
		$(".weather-title").append(title);
		
		skycon.set(document.querySelector("#weather-icon"), Skycons[makeItMove(id)]);
		skycon.play();
	}

	// 실행 부분
	getPosition()
	.then( (position) => {
		return position;
	})
	.then( makeURL )
	.then( getData )
	.catch( () => {
		console.log("실패 시 UI에 재요청하는 버튼 만들기");
	})
	.then( processUI );
	
	
	
	
});	// 함수 종료

