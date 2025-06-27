const express = require("express");

const { faker } = require("@faker-js/faker");

const mysql = require("mysql2");

const path = require("path");

const methodOverride = require("method-override");

const { v4 : uuid } = require("uuid");

const app = express();

const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended : true }));

const connecton = mysql.createConnection({
  host : "localhost",
  user : "root",
  database : "MockDBManager",
  password : "3256"
});

let getRandomUser = () =>  {
  return [
    faker.string.uuid(),
    faker.internet.username(), 
    faker.internet.email(),
    faker.internet.password()
  ];
};

// let data = [];
// for(let i=1;i<=100;i++){
//   data.push(getRandomUser());
// }

// let insertQuery = `INSERT INTO user (id, username, email, password) VALUES ?`; 
// try{
//   connecton.query(insertQuery, [data], (err, result) => {
//     if(err) throw err;
//     console.log(result);
//   });
// }catch(err){
//   console.log("Something went wrong!!");
// }

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
  let query = `SELECT * FROM user`;

  try{
    connecton.query(query, (err, result) =>{
      let usersCount = result.length;
      res.render("index.ejs", { usersCount });
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});

app.get("/users", (req, res) => {
  let query = `SELECT * FROM user`;

  try{
    connecton.query(query, (err, result) => {
      if(err) throw err;
      let users = result;
      res.render("seeUsers", { users });
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});

app.get("/users/:id/edit", (req, res) => {
  let { id } = req.params;
  let query = `SELECT * FROM user WHERE id="${id}"`;
  
  try{
    connecton.query(query, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("editUsername.ejs", { user });
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});

app.patch("/users/:id", (req, res) => {
  let { id } = req.params;
  let { username : formUsername, password : formPass } = req.body;
  let query = `SELECT * FROM user WHERE id="${id}"`;

  try{
    connecton.query(query, (err, result) => {
      if(err) throw err;
      let user = result[0];

      if(formPass != user.password){
        res.send("Entered password is wrong!! Please enter correct password!!");
      }else{
        let query2 = `UPDATE user SET username="${formUsername}" WHERE id="${id}"`;
        connecton.query(query2, (err, result) => {
          res.redirect("/users");
        });
      }
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});

app.get("/user/new", (req, res) => {
  res.render("addUser.ejs");
});

app.post("/user/new", (req, res) => {
  let id = uuid();
  let { username, email, password } = req.body;
  let query = `INSERT INTO user (id, username, email, password) VALUES ("${id}", "${username}", "${email}", "${password}")`;

  try{
    connecton.query(query, (err, result) => {
      res.redirect("/");
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  query = `SELECT * FROM user WHERE id="${id}"`;

  try{
    connecton.query(query, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("deleteUser.ejs", { user });
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password : formPass } = req.body;
  let query = `SELECT * FROM user WHERE id="${id}"`;

  try{
    connecton.query(query, (err, result) => {
      let user = result[0];
      if(formPass != user.password){
        res.send("Wrong password!! Please enter correct password!!");
      }else{
        let query2 = `DELETE FROM user WHERE id="${id}"`;
        connecton.query(query2, (err, result) => {
          res.redirect("/");
        });
      }
    });
  }catch(err){
    res.send("Something went wrong!!");
  }
});