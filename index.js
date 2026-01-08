require("dotenv").config();
const config = require('./config');
const mysql = require('mysql');
const express = require('express');
const cors = require("cors");
const app = express();
const port = 3000;
const fs = require('fs');

// give access to the public directory
app.use(express.static('public'))

// make a connection object
const con = mysql.createConnection(config.sql);

//setting view engine to ejs
app.set("view engine", "ejs");


// route for home page
app.get("/", function (req, res) {
  const statement = "SELECT country FROM emissions GROUP BY country"

  con.query(statement, (err, result) => {
    if (err) throw err;
    res.render("index", {
        emissions: result
    });
  });
});

// route for emissions page
app.get("/emissions", function (req, res) {
  const statement = "SELECT country FROM emissions GROUP BY country"

  con.query(statement, (err, result) => {
    if (err) throw err;
    res.render("emissions", {
        emissions: result
    });
  });
});

// route for emissions api
app.get('/api/emissions/:country', cors(), (req, res) => {
    const statement = "SELECT country, YEAR(year) AS year, co2 AS annualco2 FROM emissions WHERE country = ?"
    con.query(statement, req.params.country, (err, result) => {
        if (err) throw err;
        res.json(result)
    });
});

// route for per capita emissions api
app.get('/api/per-capita-emissions/:country', cors(), (req, res) => {
  const statement = "SELECT country, YEAR(year) AS year, co2_per_capita AS percapitaco2 FROM emissions WHERE country = ?"
  con.query(statement, req.params.country, (err, result) => {
      if (err) throw err;
      res.json(result)
  });
});

// route for global share emissions api
app.get('/api/global-share-emissions/:country', cors(), (req, res) => {
  const statement = "SELECT country, YEAR(year) AS year, global_share AS globalshareco2 FROM emissions WHERE country = ?"
  con.query(statement, req.params.country, (err, result) => {
      if (err) throw err;
      res.json(result)
  });
});

// route for coal oil gas api
app.get('/api/fuel-emissions/:country', cors(), (req, res) => {
  const statement = "SELECT country, YEAR(year) AS year, coal, gas, oil FROM emissions WHERE country = ?"
  con.query(statement, req.params.country, (err, result) => {
      if (err) throw err;
      res.json(result)
  });
});

// route for emissions detail, accepts country
app.get("/emission/:country", function (req, res) {
  const statement = "SELECT country, FORMAT(population, '###,###,###.##', 'en-us') AS population, FORMAT(gdp, '###,###,###.##', 'en-us') AS gdp, YEAR(year) AS year, co2 AS annualco2, co2_per_capita AS percapitaco2, global_share AS globalshareco2 FROM emissions WHERE country = ?"

  con.query(statement, req.params.country, (err, result) => {
    if (err) throw err;
    res.render("emissions-detail", {
        emission: result[0]
    });
  });
});

// route for sectoral home page
app.get("/sector", function (req, res) {
  const statement = "SELECT country FROM sectorals GROUP BY country"

  con.query(statement, (err, result) => {
    if (err) throw err;
    res.render("sector", {
        sectorals: result
    });
  });
});


// route for sectoral api
app.get('/api/sectoral-emission/:country', cors(), (req, res) => {
  const statement = "SELECT * FROM sectorals WHERE country = ?"
  con.query(statement, req.params.country, (err, result) => {
      if (err) throw err;
      res.json(result)
  });
});

// route for sectoral detail, accepts country
app.get("/emission-bysector/:country", function (req, res) {
  const statement = "SELECT * FROM sectorals WHERE country = ?"

  con.query(statement, req.params.country, (err, result) => {
    if (err) throw err;
    res.render("sector-detail", {
        sectoral: result[0]
    });
  });
});


// route for action page
app.get("/action", function (req, res) {
  const statement = "SELECT * FROM pledges ORDER BY country ASC";

  con.query(statement, (err, result) => {
    if (err) throw err;
    res.render("action", {
        pledges: result
    });
  });
});

// route for pledge detail, accepts country
app.get("/pledge/:country", function (req, res) {
  const statement = "SELECT * FROM pledges WHERE country = ?"

  con.query(statement, req.params.country, (err, result) => {
    if (err) throw err;
    res.render("pledge-detail", {
        pledge: result[0]
    });
  });
});

// route for calculator page
app.get("/calculator", function (req, res) {
    const statement = "SELECT * FROM recommendations ORDER BY RAND() LIMIT 1";

    con.query(statement, (err, result) => {
      if (err) throw err;
      res.render("calculator", {
        recommendation: result[0]
      });
    });
  });


//route for co2 json object

const filePath = './data/co2.json'

const jsonData = fs.readFileSync(filePath, 'utf8');

  app.get('/api/co2', cors(), (req, res) => {
    const data = JSON.parse(jsonData)
        res.send(data)
      });


// route for temp json object

const jsonData2 = fs.readFileSync('./data/global-temp.json', 'utf-8');

app.get('/api/globaltemp', cors(), (req, res) => {
  const data = JSON.parse(jsonData2)
      res.send(data)
    });


app.listen(3000, function () {
  console.log("Server is running on port 3000 ");
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database",config.sql.database,"on host",config.sql.host);
  });
});
