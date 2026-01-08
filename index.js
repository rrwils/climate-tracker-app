require("dotenv").config();
const config = require('./config');
const { Pool } = require("pg");
// const mysql = require('mysql');
const express = require('express');
const cors = require("cors");
const app = express();
const port = 3000;
const fs = require('fs');

// give access to the public directory
app.use(express.static('public'))

// make a connection object
// const con = mysql.createConnection(config.sql);
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => {
    console.log(
      `Connected to database ${process.env.DB_NAME} on host ${process.env.DB_HOST}`
    );
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

//setting view engine to ejs
app.set("view engine", "ejs");


console.log("DB_USER:", process.env.DB_USER);


// route for home page
app.get("/", function (req, res) {
  const statement = "SELECT country FROM emissions GROUP BY country"

  pool.query(statement)
  .then(result => {
    res.render("index", {
      emissions: result.rows
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("Database error");
  });

});

// route for emissions page
app.get("/emissions", function (req, res) {
  const statement = "SELECT country FROM emissions GROUP BY country"

  pool.query(statement)
  .then(result => {
    res.render("emissions", {
      emissions: result.rows
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("Database error");
  });

});

// route for emissions api
app.get('/api/emissions/:country', cors(), (req, res) => {

    const statement = `
      SELECT country,
            EXTRACT(YEAR FROM year) AS year,
            co2 AS annualco2
      FROM emissions
      WHERE country = $1
    `;

    pool.query(statement, [req.params.country])
      .then(result => res.json(result.rows))
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      });

});

// route for per capita emissions api
app.get('/api/per-capita-emissions/:country', cors(), (req, res) => {
  const statement = "SELECT country, EXTRACT(YEAR FROM year) AS year, co2_per_capita AS percapitaco2 FROM emissions WHERE country = $1";

  
  pool.query(statement, [req.params.country])
    .then(result => res.json(result.rows))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });

});

// route for global share emissions api
app.get('/api/global-share-emissions/:country', cors(), (req, res) => {
  const statement = "SELECT country, EXTRACT(YEAR FROM year) AS year, global_share AS globalshareco2 FROM emissions WHERE country = $1";

  pool.query(statement, [req.params.country])
    .then(result => res.json(result.rows))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });

});

// route for coal oil gas api
app.get('/api/fuel-emissions/:country', cors(), (req, res) => {

  const statement = `
    SELECT country,
           EXTRACT(YEAR FROM year) AS year,
           coal, gas, oil
    FROM emissions
    WHERE country = $1
  `;

  pool.query(statement, [req.params.country])
    .then(result => res.json(result.rows))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });

});

// route for emissions detail, accepts country
app.get("/emission/:country", function (req, res) {
  const statement = `
    SELECT country,
           population,
           gdp,
           EXTRACT(YEAR FROM year) AS year,
           co2 AS annualco2,
           co2_per_capita AS percapitaco2,
           global_share AS globalshareco2
    FROM emissions
    WHERE country = $1
  `;

  pool.query(statement, [req.params.country])
    .then(result => {
      const row = result.rows[0];

      // format numbers in JS
      row.population = Number(row.population).toLocaleString();
      row.gdp = Number(row.gdp).toLocaleString();

      res.render("emissions-detail", {
        emission: row
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Database error");
    });


});

// route for sectoral home page
app.get("/sector", function (req, res) {
  const statement = "SELECT country FROM sectorals GROUP BY country"

  pool.query(statement)
  .then(result => {
    res.render("sector", {
      sectorals: result.rows
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("Database error");
  });

});


// route for sectoral api
app.get('/api/sectoral-emission/:country', cors(), (req, res) => {
  const statement = "SELECT * FROM sectorals WHERE country = $1";

  pool.query(statement, [req.params.country])
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    });

});

// route for sectoral detail, accepts country
app.get("/emission-bysector/:country", function (req, res) {
  const statement = "SELECT * FROM sectorals WHERE country = $1"

  pool.query(statement, [req.params.country])
    .then(result => {
      res.render("sector-detail", {
        sectoral: result.rows[0]
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Database error");
    });

});


// route for action page
app.get("/action", function (req, res) {
  const statement = "SELECT * FROM pledges ORDER BY country ASC";

  pool.query(statement)
  .then(result => {
    res.render("action", {
      pledges: result.rows
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("Database error");
  });

});

// route for pledge detail, accepts country
app.get("/pledge/:country", function (req, res) {
  const statement = "SELECT * FROM pledges WHERE country = $1";

  pool.query(statement, [req.params.country])
    .then(result => {
      res.render("pledge-detail", {
        pledge: result.rows[0]
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Database error");
    });

});

// route for calculator page
app.get("/calculator", function (req, res) {
    const statement = "SELECT * FROM recommendations ORDER BY RANDOM() LIMIT 1";

    pool.query(statement)
    .then(result => {
      res.render("calculator", {
        recommendation: result.rows[0]
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Database error");
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
  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected to database",config.sql.database,"on host",config.sql.host);
  // });
});
