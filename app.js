import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import fs from 'fs';

// const express = require("express"); // import express from 'express';
// const exphbs = require("express-handlebars"); // import { engine } from 'express-handlebars';
// const fs = require("fs");
// import hbs from 'handlebars';

const __dirname = path.resolve();
const app = express();
const port = 3000;
let viewPaths = [];
// установка Handlebars в качестве движка представлений в Express
app.set("view engine", "hbs");

// настройка движка Handlebars для использования файлов layout (макет страницы)
app.engine(
  "hbs",
  exphbs.engine({
    layoutsDir: "src/pages", // относительный путь к катологу с layouts
    defaultLayout: "main", // имя файла layout по умолчанию
    extname: "hbs",
  })
);

// создание парсера для данных application/x-www-form-urlencoded
// нужен для отправки данных из формы
// extended: false => результат парсинга - набор пар ключ-значение;
// каждое значение может быть представлено в виде строки или массива
const urlencodedParser = express.urlencoded({ extended: false });

const jsonParser = express.json();

// app.use(express.urlencoded({ extended: false}))
// app.use(express.json())

const usersPath = "./src/users.json";
app.get("/", (_, res) => res.redirect("/login"));

// Работа с юзерами (API)
// Получение всех юзеров
app.get("/api/users", (_, res) => {
  const content = fs.readFileSync(usersPath, "utf-8");
  const users = JSON.parse(content); // [{"id":"1","name":"Tom","age":"24"},{...},{...}]
  res.send(users);
});

// получение одного пользователя по id
app.get("/api/users/:id", function (req, res) {
  const id = req.params.id; // получаем id
  const content = fs.readFileSync(usersPath, "utf8");
  const users = JSON.parse(content);
  let user = null;
  // находим в массиве пользователя по id
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == id) {
      user = users[i];
      break;
    }
  }
  if (!user) res.status(404).send();
  // отправляем пользователя
  res.send(user);
});

// получение отправленных данных
app.post("/api/users", jsonParser, function (req, res) {
  if (req.body.email === '' || req.body.password === '') res.redirect("../test");

  // заполняем карточку пользователя по пришедшим данным
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  let passed = false;
  console.log(`Полученные данные: ${userEmail} ${userPassword}`);

  // обращаемся к "бд" и получаем доступ к списку пользователей
  let data = fs.readFileSync(usersPath, "utf8");
  let users = JSON.parse(data);
  // console.log(`Из JSON: ${Object.values(users[0])}`);
  
  // toDO: обработать всевозможные случаи соответствия полученных данных
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === userEmail && users[i].password === userPassword) {
      passed = true;
      break;
    };
  }
  console.log("passed" + passed);
  if (passed) {
    console.log("Ожидается переход на /chats");
    res.redirect("../chats");
  } else {
    console.log("Данные были введены не верно!");
    res.redirect("../");
  }
  
  // // добавляем пользователя в массив (в список пользователей)
  // const id = Math.max(...users.map(user => user.id));
  // user.id = id + 1;
  // users.push(user);

  // // перезаписываем файл с новыми данными
  // data = JSON.stringify(users);
  // fs.writeFileSync("users.json", data);
});

// удаление пользователя по id
app.delete("/api/users/:id", function (req, res) {
  const id = req.params.id;
  let data = fs.readFileSync(usersPath, "utf8");
  let users = JSON.parse(data);
  let index = -1;
  // находим индекс пользователя в массиве
  for (var i = 0; i < users.length; i++) {
    if (users[i].id == id) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    // удаляем пользователя из массива по индексу
    const user = users.splice(index, 1)[0];
    data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);
    // отправляем удаленного пользователя
    res.send(user);
  } else {
    res.status(404).send("User isn't found by ID");
  }
});

// изменение пользователя
app.put("/api/users", jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const userId = req.body.id;
  const userName = req.body.name;
  const userAge = req.body.age;

  let data = fs.readFileSync(usersPath, "utf8");
  const users = JSON.parse(data);
  let user;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id == userId) {
      user = users[i];
      break;
    }
  }
  // изменяем данные у пользователя
  if (user) {
    user.age = userAge;
    user.name = userName;
    data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);
    res.send(user);
  } else {
    res.status(404).send(user);
  }
});

// как лучше назвать функцию??
createHandleRequest("login");

createHandleRequest("chats");

// // как лучше назвать функцию??
// createHandleRequest("login", {
//   title: "LogIn",
//   cssPath: "/src/pages/Login/login.scss", // как правильно задать путь к css??
// });

// createHandleRequest("chats", {
//   title: "Chats",
//   cssPath: "/src/pages/Chats/chats.scss", // как правильно задать путь к css??
// });

// как хранить переданные данные?? json??
// в каком месте нужно хранить данный вызов метода?? (логичнно: кат. Login)
app.post("/login", urlencodedParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body.account + req.body.password);
});

app.listen(port, () => console.log(`App listening to port ${port}`));

console.log(app.get("views"));

function createHandleRequest(namePage, ctx = {}) {
  // устанавливаем путь к представлению (view) для запроса на "namePage"
  const viewPath = namePage[0].toUpperCase() + namePage.slice(1);
  ctx.title = viewPath;
  ctx.cssPath = `src/pages/${viewPath}/${namePage}.scss`;

  viewPaths.push(`src/pages/${viewPath}`);
  app.set("views", viewPaths);

  // устанавливаем абсолютный путь к статике для запроса на "namePage"
  app.use(express.static(__dirname + `/src/pages/${namePage}`));

  app.get(`/${namePage}`, (_, res) => {
    res.render(namePage, ctx);
  });
}
