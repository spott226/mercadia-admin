const API = "mercadia-back-production.up.railway.app";

async function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const res = await fetch(API + "/admin/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
});

const data = await res.json();

if(data.token){

localStorage.setItem("token",data.token);
localStorage.setItem("store_id",data.store_id);

window.location = "dashboard.html";

}else{

alert("Credenciales incorrectas");

}

}catch(err){

console.error(err);
alert("Error conectando con el servidor");

}

}

function logout(){

localStorage.removeItem("token");
localStorage.removeItem("store_id");

window.location = "login.html";

}

// protección básica de páginas
function protect(){

const token = localStorage.getItem("token");

if(!token){

window.location = "login.html";

}

}
