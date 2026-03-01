import mysql from "mysql";
const connected = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_laotoyota"
});
// const connected = mysql.createConnection({
//   host: "46.137.225.18",
//   port: 3306,
//   user: "mysql",
//   password: "Laotoyota123454321",
//   database: "db_laotoyota"
// });

connected.connect((err) => {
  if (err) {
    console.error('❌ Failed Connect Database:', err.message);
  } else {
    console.log('✅ Connected Database!');
  }
});
export default connected;