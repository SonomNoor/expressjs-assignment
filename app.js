
const express = require('express')
const request = require('request');
const rateLimit = require("express-rate-limit");
const pug = require('pug')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000


app.set("view engine", "pug");

app.set("views", path.join(__dirname, "views"));



app.use(express.static(path.join(__dirname, 'static')));

const Limiter = rateLimit({
    windowMs: 1 * 30 * 1000, // 30 sec
    max: 1,
    message: "please try again after 30 second",
});

app.get('/', (req, res) => {
    res.render("index");
});
app.get('/all', (req, res) => {
    res.render("alert");
});
//Dynamic Route

app.get('/all/:country/:city', Limiter, function(req, res) {

    let country = req.params.country;
    let cities = req.params.city;
    var currentweather;
    fs.readFile("./data.json", "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        try {
            currentweather = JSON.parse(jsonString);
            let condition = false;
            for (let i = 0; i < currentweather.length; i++) {
                let tempreture = currentweather[i];
                if (tempreture.city == cities) {
                    condition = true;
                    res.render("index", { //city:req.params.city,
                        country: tempreture.country,
                        city: tempreture.city,
                        mintempin_c: tempreture.min_c,
                        maxtempin_c: tempreture.max_c,
                        avaragetempin_c: tempreture.avg_c,
                        mintempin_f: tempreture.min_f,
                        maxtempin_f: tempreture.max_f,
                        avaragetempin_f: tempreture.avg_f
                    });
                }
                if (condition == true) {
                    break;
                }
            }
            if (condition == false) {
                console.log("not fetch");
                let options = {
                    method: 'GET',
                    url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
                    qs: { q: cities, days: '3' },
                    headers: {
                      'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
                      'x-rapidapi-key': '49a1f88d56msh7faa3d85a4f8b8ap11abb4jsn8cb5504fe053',
                      useQueryString: true
                    }
                  };
                request(options, function(error, response, body) {
                    if (error) {

                    } else if (response.statusCode == 400) {
                        res.render('alert');
                    } else {

                        let data = JSON.parse(body);
                        var searchcountry = req.params.country;
                        var tergetcountry = data.location.country;
                        if (searchcountry.toLowerCase() == tergetcountry.toLowerCase()) {

                            let min_temp_c = 0;
                            let max_temp_c = 0;
                            let avg_temp_c = 0;
                            let min_temp_f = 0;
                            let max_temp_f = 0;
                            let avg_temp_f = 0;
                            for (let i = 0; i < 3; i++) {
                                min_temp_c += data.forecast.forecastday[i].day.mintemp_c;
                                max_temp_c += data.forecast.forecastday[i].day.maxtemp_c;
                                avg_temp_c += data.forecast.forecastday[i].day.avgtemp_c;
                                min_temp_f += data.forecast.forecastday[i].day.mintemp_f;
                                max_temp_f += data.forecast.forecastday[i].day.maxtemp_f;
                                avg_temp_f += data.forecast.forecastday[i].day.avgtemp_f;
                            }
                            console.log(data.location.city);
                            const weatherdata = {
                                "country": data.location.country,
                                "city": data.location.name,
                                "mintempin_c": (min_temp_c / 3).toPrecision(2),
                                "maxtempin_c": (max_temp_c / 3).toPrecision(2),
                                "avaragetempin_c": (avg_temp_c / 3).toPrecision(2),
                                "mintempin_f": (min_temp_f / 3).toPrecision(2),
                                "maxtempin_f": (max_temp_f / 3).toPrecision(2),
                                "avaragetempin_f": (avg_temp_f / 3).toPrecision(2)
                            };
                            currentweather.push(weatherdata);
                            // console.log("Read Object is", currentweather);
                            const json = JSON.stringify(currentweather, null, 2);
                            fs.writeFile('./data.json', json, err => {
                                if (err) {
                                    console.log('file stored', err)
                                } else {
                                    console.log('done')
                                }
                            });
                            res.render("index", {
                                city: data.location.name,
                                country: data.location.country,
                                mintempin_c: (min_temp_c / 3).toPrecision(3),
                                maxtempin_c: (max_temp_c / 3).toPrecision(3),
                                avaragetempin_c: (avg_temp_c / 3).toPrecision(3),
                                mintempin_f: (min_temp_f / 3).toPrecision(3),
                                maxtempin_f: (max_temp_f / 3).toPrecision(3),
                                avaragetempin_f: (avg_temp_f / 3).toPrecision(3)
                            });
                        } else {
                            res.render('alert');
                        }
                    };
                })

            }

        } catch (err) {
            console.log("Error parsing JSON string:", err);
        }
    });
});



app.get("/all/:country", (req, res) => {


    let country = req.params.country;
    var currentweather;
    fs.readFile("./data.json", "utf8", (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        try {
            currentweather = JSON.parse(jsonString);
            let condition = false;
            for (let i = 0; i < currentweather.length; i++) {
                let tempreture = currentweather[i];
                if (tempreture.country == country) {
                    condition = true;
                    res.render("index", { //city:req.params.city,
                        country: tempreture.country,
                        city: tempreture.city,
                        mintempin_c: tempreture.min_c,
                        maxtempin_c: tempreture.max_c,
                        avaragetempin_c: tempreture.avg_c,
                        mintempin_f: tempreture.min_f,
                        maxtempin_f: tempreture.max_f,
                        avaragetempin_f: tempreture.avg_f
                    });
                }
                if (condition == true) {
                    break;
                }
            }
            if (condition == false) {
                console.log("not fetch");
                let options = {
                    method: 'GET',
                    url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
                    qs: { q: country, days: '3' },
                    headers: {
                        'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
                        'x-rapidapi-key': 'ceff00788dmshc572d2e939e2aa1p16f562jsn6a57c668e74a',
                        useQueryString: true
                    }
                };
                request(options, function(error, response, body) {
                    if (error) {

                    } else if (response.statusCode == 400) {
                        res.render('alert');
                    } else {

                        let data = JSON.parse(body);
                        var searchcountry = req.params.country;
                        var tergetcountry = data.location.country;
                        if (searchcountry.toLowerCase() == tergetcountry.toLowerCase()) {

                            let min_temp_c = 0;
                            let max_temp_c = 0;
                            let avg_temp_c = 0;
                            let min_temp_f = 0;
                            let max_temp_f = 0;
                            let avg_temp_f = 0;
                            for (let i = 0; i < 3; i++) {
                                min_temp_c += data.forecast.forecastday[i].day.mintemp_c;
                                max_temp_c += data.forecast.forecastday[i].day.maxtemp_c;
                                avg_temp_c += data.forecast.forecastday[i].day.avgtemp_c;
                                min_temp_f += data.forecast.forecastday[i].day.mintemp_f;
                                max_temp_f += data.forecast.forecastday[i].day.maxtemp_f;
                                avg_temp_f += data.forecast.forecastday[i].day.avgtemp_f;
                            }
                            console.log(data.location.city);
                            const weatherdata = {
                                "country": data.location.country,
                                "city": data.location.name,
                                "mintempin_c": (min_temp_c / 3).toPrecision(2),
                                "maxtempin_c": (max_temp_c / 3).toPrecision(2),
                                "avaragetempin_c": (avg_temp_c / 3).toPrecision(2),
                                "mintempin_f": (min_temp_f / 3).toPrecision(2),
                                "maxtempin_f": (max_temp_f / 3).toPrecision(2),
                                "avaragetempin_f": (avg_temp_f / 3).toPrecision(2)
                            };
                            currentweather.push(weatherdata);
                            // console.log("Read Object is", currentweather);
                            const json = JSON.stringify(currentweather, null, 2);
                            fs.writeFile('./data.json', json, err => {
                                if (err) {
                                    console.log('file stored', err)
                                } else {
                                    console.log('done')
                                }
                            });
                            res.render("index", {
                                city: data.location.name,
                                country: data.location.country,
                                mintempin_c: (min_temp_c / 3).toPrecision(3),
                                maxtempin_c: (max_temp_c / 3).toPrecision(2),
                                avaragetempin_c: (avg_temp_c / 3).toPrecision(3),
                                mintempin_f: (min_temp_f / 3).toPrecision(3),
                                maxtempin_f: (max_temp_f / 3).toPrecision(3),
                                avaragetempin_f: (avg_temp_f / 3).toPrecision(3)
                            });
                        } else {
                            res.render('alert');
                        }
                    };
                })

            }

        } catch (err) {
            console.log("Error parsing JSON string:", err);
        }
    });
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

