// отправка формы
document.forms["userForm"].addEventListener("submit", (e) => {
  e.preventDefault();
  const form = document.forms["userForm"];
  const acc = form.elements["account"].value;
  const pass = form.elements["password"].value;
  checkUser(acc, pass);
});

// Проверка наличия пользователя и соответствия пароля
async function checkUser(acc, pass) {
  const response = await fetch("api/users", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      email: acc,
      password: pass,
    }),
  });
  console.log(response);
  if (response.ok === true) fetch("../chats");
  console.log("конец");
    const user = await response.json();
  // }
}
