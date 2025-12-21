// declare a JSON data structure to hold our configuration details
let config = {}
// lets add an element just for SQL connection details
config.sql = {}

// the port number used by MAMP/WAMP for connections
config.sql.port = 3306
// we have to tell the mysql library
config.sql.socketPath = "/Applications/MAMP/tmp/mysql/mysql.sock"
// if it[s local (MAMP/WAMP) this should be 'localhost'
config.sql.host = "localhost"
// your ID for doc.gold.ac.uk OR 'root' for MAMP/WAMP
config.sql.user = "root"
// your DATABASE password OR '' for MAMP/WAMP (i.e. empty, no password, nada, unless you changed it!)
config.sql.password = "root"
// the name of the DATABASE
config.sql.database = "rwils001_co2"

// let the rest of the code see this data
module.exports = config;
