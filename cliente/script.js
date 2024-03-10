// Elementos del DOM
const labelWelcome = document.querySelector(".welcome");
const labelcuenta = document.querySelector(".names");
const labelerror = document.querySelector(".alert-warning");
const labelID = document.querySelector(".idnumber");
const labeladdres = document.querySelector(".address");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnlogout = document.querySelector(".btn-danger");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Constantes para las URL del servidor
const SERVER_URL = "http://localhost:3000/login?";

// Event listener para el botón de inicio de sesión
btnLogin.addEventListener("click", async function validarDatos(e) {
  // Evitar que el formulario se envíe
  e.preventDefault();
  // Obtener los valores ingresados en los campos de usuario y PIN
  const username = inputLoginUsername.value;
  const pin = inputLoginPin.value;
  // Construir la URL para iniciar sesión
  const url = `${SERVER_URL}username=${username}&pin=${pin}`;

  const loginData = await fetch(url)
    .then((response) => response.json())
    .then((data) => data);

  const { account, message, token: tokenunit } = loginData;
  localStorage.setItem("clave", tokenunit);

  // Si no hay mensaje de error, mostrar la aplicación y los datos de la cuenta
  if (!message) {
    console.log("Login correcto");
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Bienvenido, ${account.owner}`;
    labelcuenta.textContent = `Número de cuenta: ${account.numberAccount}`;
    labeladdres.textContent = `Dirección: ${account.address} `;
    labelID.textContent = `DNI: ${account.nationalIdNumber}`;
    labelWelcome.style.opacity = 1;
    labelcuenta.style.opacity = 1;
    labeladdres.style.opacity = 1;
    labelID.style.opacity = 1;
    labelerror.style.opacity = 0;
    inputLoginUsername.style.opacity = 0; // Ocultar el campo de usuario
    inputLoginPin.style.opacity = 0; // Ocultar el campo de PIN
    inputLoginPin.blur();
    btnLogin.style.opacity = 0;
    btnlogout.style.opacity = 1;

    updateUI(account.movements); // Actualizar la interfaz con los movimientos de la cuenta
  } else {
    console.log("Usuario o contraseña incorrectos");
    labelerror.style.opacity = 1;
  }
});

function updateUI(movements) {
  displayMovements(movements);
  displayBalance(movements);
  displaySummary(movements);
}

function displayMovements(movements) {
  containerMovements.innerHTML = "";
  movements.forEach(function (mov, i) {
    const type = mov.amount > 0 ? "deposit" : "withdrawal";
    const html = `
        <div class="movements__row">
        <div class="movements__date"> ${mov.date}</div>
        <div class="movements__type movements__type--${type} €">${
          i + 1
        } ${type}</div>          
          <div class="movements__value">${mov.amount} €</div>
        </div>
      `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

const displayBalance = function (movements) {
  const balance = movements.reduce((acc, mov) => acc + mov.amount, 0);
  labelBalance.textContent = `${balance.toFixed(2)}€`;
};

const displaySummary = function (movements) {
  const sumIn = movements
    .filter((mov) => mov.amount > 0)
    .reduce((acc, mov) => acc + mov.amount, 0);
  labelSumIn.textContent = `${sumIn.toFixed(2)}€`;

  const sumOut = movements
    .filter((mov) => mov.amount < 0)
    .reduce((acc, mov) => acc + mov.amount, 0);
  labelSumOut.textContent = `${Math.abs(sumOut).toFixed(2)}€`;
};

// Depositos y retiros
// Event listener para el botón de préstamo
btnLoan.addEventListener("click", async function requestLoan(e) {
  e.preventDefault(); // Evitar que el formulario se envíe
  let token = localStorage.getItem("clave"); // Obtener el token de localStorage
  const url = `http://localhost:3000/movements?token=${token}`; // Construir la URL para la solicitud de préstamo
  const data = {
    amount: inputLoanAmount.value, // Obtener el monto del préstamo del input
    date: new Date(), // Obtener la fecha y hora actual para el préstamo
  };

  try {
    // Realizar la solicitud de préstamo al servidor
    const dataRecieved = await fetch(url, {
      method: "POST", // Método POST
      body: JSON.stringify(data), // Convertir los datos a formato JSON
      headers: {
        "Content-Type": "application/json", // Especificar el tipo de contenido JSON
      },
    }).then((response) => response.json()); // Convertir la respuesta a JSON

    console.log(dataRecieved); // Mostrar la respuesta del servidor en la consola

    // Actualizar el saldo mostrado en la interfaz con el nuevo saldo después del préstamo
    const newBalance =
      parseFloat(labelBalance.textContent) + parseFloat(dataRecieved.amount);
    labelBalance.textContent = `${newBalance.toFixed(2)}€`;

    // Realizar una consulta al servidor para actualizar la interfaz con los movimientos más recientes
    ServerQuery();
  } catch (error) {
    // Manejar cualquier error que ocurra durante la solicitud de préstamo
    console.error("Error al solicitar el préstamo:", error.message);
  }
});

// Función asincrónica para realizar una consulta al servidor y actualizar la interfaz de usuario
async function ServerQuery() {
  const username = inputLoginUsername.value; // Obtener el nombre de usuario ingresado
  const pin = inputLoginPin.value; // Obtener el PIN ingresado
  const URL_ALL = `${SERVER_URL}username=${username}&pin=${pin}`; // Construir la URL para la consulta al servidor

  try {
    // Realizar la consulta al servidor para obtener los datos de la cuenta del usuario
    const loginData = await fetch(URL_ALL).then((response) => response.json());
    const { account } = loginData; // Extraer los datos de la cuenta del objeto de respuesta
    updateUI(account.movements); // Actualizar la interfaz de usuario con los movimientos de la cuenta
  } catch (error) {
    // Manejar cualquier error que ocurra durante la consulta al servidor
    console.error("Error al realizar la consulta al servidor:", error.message);
  }
}

// Event listener para el botón de transferencia
btnTransfer.addEventListener("click", async function transferir(e) {
  e.preventDefault(); // Evitar que el formulario se envíe

  const token = localStorage.getItem("clave"); // Obtener el token de localStorage
  const destinationAccount = inputTransferTo.value; // Obtener la cuenta de destino del input
  const amount = inputTransferAmount.value; // Obtener la cantidad a transferir del input

  // Construir la URL para la solicitud de transferencia
  const url = `http://localhost:3000/transfer?token=${token}`;

  // Datos a enviar en la solicitud de transferencia
  const data = {
    destinationAccount,
    amount,
  };

  try {
    // Realizar la solicitud de transferencia al servidor
    const response = await fetch(url, {
      method: "POST", // Método POST
      body: JSON.stringify(data), // Convertir los datos a formato JSON
      headers: {
        "Content-Type": "application/json", // Especificar el tipo de contenido JSON
      },
    });

    // Verificar si la solicitud fue exitosa
    if (response.ok) {
      // Si la transferencia fue exitosa, actualizar la interfaz y mostrar un mensaje
      inputTransferTo.value = "";
      inputTransferAmount.value = "";
      ServerQuery(); // Actualizar los movimientos y el saldo mostrado en la interfaz
      console.log("Transferencia exitosa");
    } else {
      // Si hubo un error en la transferencia, mostrar un mensaje de error
      const responseData = await response.json();
      console.error("Error en la transferencia:", responseData.message);
    }
  } catch (error) {
    // Manejar cualquier error que ocurra durante la solicitud de transferencia
    console.error("Error en la transferencia:", error.message);
  }
});

// Event listener para el botón "Salir"
btnlogout.addEventListener("click", () => {
  logoutUser();
});

// Función para cerrar la sesión del usuario
function logoutUser() {
  localStorage.removeItem("clave");
  window.location.href = "login.html"; // Reemplaza "login.html" con la ruta de tu página de inicio de sesión

  console.log("Sesión cerrada");
}

// Variables para el contador de inactividad
let inactivityTimer;
const INACTIVITY_TIMEOUT = 60000; // 1 minuto en milisegundos

// Función para iniciar el contador de inactividad
function startInactivityTimer() {
  inactivityTimer = setTimeout(() => {
    logoutUser();
  }, INACTIVITY_TIMEOUT);
}

// Función para reiniciar el contador de inactividad
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  startInactivityTimer();
}

// Event listener para reiniciar el contador de inactividad al hacer clic en cualquier parte de la página
document.addEventListener("click", resetInactivityTimer);
// Event listener para reiniciar el contador de inactividad al presionar cualquier tecla
document.addEventListener("keypress", resetInactivityTimer);

// Iniciar el contador de inactividad al cargar la página
startInactivityTimer();
