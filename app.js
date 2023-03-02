const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const TWO_HOURS = 1000 * 60 * 60 * 2;
const {
  PORT = 3000,
  SESS_NAME = "sid",
  SES_LIFETIME = TWO_HOURS,
  NODE_ENV = "developement",
  SESS_SECRET = "qwerrtyasdfg",
} = process.env;

const IN_PROUD = NODE_ENV === "production";

const users = [
  { id: 1, name: "alex", email: "alex@abc.com", password: "secret" },
  { id: 2, name: "flex", email: "flex@abc.com", password: "secret" },
  { id: 3, name: "plex", email: "hlex@abc.com", password: "secret" },
];
const app = express();

// ----------------------------------------------middlewares -----------------------------------------
app.use(
  session({
    name: SESS_NAME,
    secret: SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: SES_LIFETIME,
      sameSite: true,
      secure: IN_PROUD,
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/home");
  } else {
    next();
  }
};
// ----------------------------------------------- ROUTES ----------------------------------------------
app.get("/", (req, res) => {
  res.send(
    `
    <h1>welcome!</h1>
    ${
      req.session.userId
        ? `<a href="/home">home</a>
      <form method="post" action="/logout">
        <button>logout</button>
      </form>`
        : `
      <a href='/login'>Login</a>
      <a href="/register">register</a>`
    }`
  );
});
app.get("/home", redirectLogin, (req, res) => {
  const user_data_login = users.find((ele) => ele.id === req.session.userId);
  res.send(`
    <h1>home</h1>
    <a href='/'>main</a>
    <ul>
        <li>name:${user_data_login.name}</li>
        <li>email:${user_data_login.email}</li>
    </ul>
   `);
});
app.get("/login", redirectHome, (req, res) => {
  res.send(`
    <h1>login page</h1>
    <form method="post" action='/login'>
       
        email: <input  type="email" name="email" placeholder="enter email" required>
         name : <input type="password" name="password" placeholder="enter password" required>
        <input type="submit">
         </br>
        <a href="/register">register</a>
    </form>
    `);
});

// ------------------------------post api----------------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const user_validate = users.find(
      (ele) => ele.email == email && ele.password == password
    );
    if (user_validate) {
      req.session.userId = user_validate.id;
      return res.redirect("/home");
    }
  }
  res.redirect("/login");
});
app.get("/register", redirectHome, (req, res) => {
  res.send(`<h1>register page</h1>
    <form method="post" action='/register'>
        name : <input type="text" name="name" placeholder="enter name" required>
        email: <input  type="email" name="email" placeholder="enter email" required>
        password: <input  type="password" name="password" placeholder="enter password" required></input>
        <input type="submit">
        </br>
         <a href="/login">login</a>
    </form>`);
});
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  if (name && email && password) {
    const if_user_exists = users.some((ele) => ele.email == email);
    if (!if_user_exists) {
      const new_user = {
        id: users.length + 1,
        name,
        email,
        password,
      };
      users.push(new_user);
      res.redirect("/login");
    }
  }
});

app.post("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/home");
    }
    res.clearCookie(SESS_NAME);
    res.redirect("/login");
  });
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));

console.log(users);
