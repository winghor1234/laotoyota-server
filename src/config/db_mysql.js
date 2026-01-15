import mysql from "mysql";
const connected = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_laotoyota"
});
// connected.query((err)=>{
//   if(err) console.log('Failed Connect Database');
//   console.log('Connected Database !');
// });

connected.connect((err) => {
  if (err) {
    console.error('❌ Failed Connect Database:', err.message);
  } else {
    console.log('✅ Connected Database!');
  }
});
export default connected;