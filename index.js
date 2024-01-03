

//http, fs are core modules inside nodejs. We don't need to install any packages to use them
const http = require("http");
const fs = require("fs");
var requests = require("requests");

//get all the data in the backend
const homeFile = fs.readFileSync("home.html", "utf-8");

//we are passing the temporary values here which we have accessed from the array
//at lines 48-49-50
//replacing temporary values with original values

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min); //inside object main, we accessed min temperature
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name); //was directly a part of the array
  temperature = temperature.replace("{%country%}", orgVal.sys.country); //inside object system, we accesses country
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main); //inside object system, we accesses country
  return temperature;
};

//instead of routing, we use requests of npm
//need to install it as it is not a core module and then require it
//copied code from requests
//event module used here

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    //whatever data that the user requests is fetched from the link here
    requests(
      "https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=647db17c0535eefdadd25a8659b40531"
    )
      //that data is then accessed and given out in chunks
      //the "data event" of the event emitter is used here (from node streams)
      .on("data", (chunk) => {
        //convert json data to object data
        const objdata = JSON.parse(chunk);

        //pass object data to array data
        //data received will be an array of an object
        const arrData = [objdata];
        // console.log(arrData[0].main.temp);
        // we place this in place of html placeholder using map method

        //this prints the temperatore which was present within main. Now we need
        //to put this in place of temperature by using a placeholder
        //we do this by the map method

        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join(""); //join to convert array data to string
        //to view the website now, we pass the real time data to it in the form of string
        res.write(realTimeData);
        console.log(realTimeData);
      })

      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        //when there is no more data to be read, we give response end method
        res.end();
      });
  } else{
    res.end("File not found");
  }
});

server.listen(8000, "127.0.0.1");
