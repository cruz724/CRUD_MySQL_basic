const express = require("express");
const app = express();
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const path = require("path");
const methodOverride = require("method-override");
const { da } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

let port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

//---------To render ejs template--------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//-------------------MYSQL cnnection setup---------------------------
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "Shu88900bham@",
});

//--------------To Generate Fake Data---------------------------
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//---------home route to get count of user-------------------
app.get("/", (req, res) => {
  let q = `SELECT CounT(*) FROM user`;
  try {
    connection.query(q, (err, results) => {
      if (err) {
        throw err;
      }
      let count = results[0]["CounT(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("some err in DB");
  }
});

//----------------user route to print all user email and id -----------------
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, results) => {
      if (err) {
        throw err;
      }
      let data = results;
      res.render("users.ejs", { data });
    });
  } catch (err) {
    console.log(err);
    res.send("some err in DB");
  }
});

//-----------------------EDIT Route---------------------
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let data = result[0];
      console.log(data);
      res.render("edit.ejs", { data });
    });
  } catch (err) {
    console.log(err);
    res.send("some err in DB");
  }
});

//-------------update route in databse------------
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username: newusername, password: formpass } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let data = result[0];
      if (formpass != data.password) {
        res.send("wrong password");
      } else {
        let q2 = `UPDATE user SET username='${newusername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throwerr;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some err in DB");
  }
});

//-----------------------Delete Route---------------------
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


//------------ADD new user----------------------
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.listen(port, () => {
  console.log("listening to port 8080");
});

//-----------Generate fake data and insert into table----------------
// let q = "INSERT INTO user (id,username, email, password) VALUES ?";
// let data = [];

// for(let i=1; i<=100; i++){
//   data.push(getRandomUser());
// }

// try {
//   connection.query(q, [data], (err, results)=> {
//   if (err) {
//     throw err;
//   }
//   console.log(results);
//   });
// } catch (err) {
//   console.log(err);
// }

// connection.end();
