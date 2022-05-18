  // подключение к MQTT-брокеру

  client = new Paho.MQTT.Client("m24.cloudmqtt.com", 30369,"teplica-site");
  
  // назначение обработчиков для принятия сообщений и обрыва связи
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // параметры для связи с брокером
  var options = {
    useSSL: true,
    userName: "jriiypoc",
    password: "MGZl8VTTlcuc",
    onSuccess:onConnect,
    onFailure:doFail
  }
  
  var btn = document.querySelector('#btn');
  var mqttMess = document.querySelector('#mqttMess');
  var getTemp = document.querySelector('#getTemp');
  var getTempContinious = document.querySelector('#getTempContinious');
  
  // connect по клику
  btn.addEventListener("click", () => {
    mqttMess.innerHTML="MQTT-сообщения: "; client.connect(options)  } );
  
  // получить температуру один раз 
  getTemp.addEventListener("click", () => Send('/temp/get','temp request'));

  // или с интервалом 2 секунды
  var Continious = true
  var R
  function Run() {
  R = setInterval("Send('/temp/get','temp continious request')", 2000)
  }

  getTempContinious.addEventListener("click", () => {
    if (Continious==true) Run()
    else clearInterval(R)
    Continious = !Continious;
  }  )

  // открыть и закрыть форточку. Серву можно крутить от 0.05 до 0.95 с точностью до сотых.
  var doorState = "0.05";
  door.addEventListener("click", () => {
  doorState = doorState == "0.05" ? "0.95" : "0.05";  // тернарный оператор вместо if-else
    Send('/door/turn',doorState)
  }    );

// включить питание реле с кулером 
 var pushRelay = document.querySelector('#pushRelay');
  pushRelay.addEventListener("click", () => Send('/relay/turn','relay turn request'));

// получить влажность в процентах
 var getHumidity = document.querySelector('#getHumidity');
  getHumidity.addEventListener("click", () => Send('/humidity/get','humidity request'));

  // когда связь установлена, подписываемся на темы и посылаем тестовое сообщение.
  function onConnect() {
    client.subscribe("/teplica");
    client.subscribe("/door");
    client.subscribe("/temp");
    client.subscribe("/relay");
    client.subscribe("/humidity");
    Send("/teplica", "Клиент (сайт) подключился к брокеру MQTT-сообщений");
  }

  // обработчики ошибок подключения
  function doFail(e){
    console.log(e);
  }
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:"+responseObject.errorMessage);
    }
  }

  // Получение сообщения (обратите внимание как разделены тема и само сообщения.)
  function onMessageArrived(message) {
    /// общий вывод в журнал
    mqttMess.innerHTML += `\<br>`+message.destinationName + '  ' + message.payloadString;
    switch (message.destinationName) {
      case "/temp":
        /// пришла температура
        console.log('пришла темп')
        break;
      case "/door":
        /// пришел сервопривод
        break;
      case "/relay":
        /// пришло реле
        break;
      case "/humidity":
        /// пришла влажность в процентах
        break;
    }
  }

 // Определение функции отправки сообщений в строковом формате. К нам вернутся только по теме, на которую подписаны.
function Send(topic,body) {
    message = new Paho.MQTT.Message(body);
    message.destinationName = topic;
    client.send(message);
}