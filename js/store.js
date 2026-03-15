const API = "http://localhost:3000/api";

async function getStore() {

const store_id = localStorage.getItem("store_id");

const res = await fetch(API + "/store/" + store_id);

const store = await res.json();

document.getElementById("store-name").innerText = store.name;

}