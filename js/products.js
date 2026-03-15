import { apiRequest } from "./api.js";

const API_URL = "https://mercadia-back-production.up.railway.app";

const token = localStorage.getItem("token");
const store_id = localStorage.getItem("store_id");

if (!token || !store_id) {
window.location = "login.html";
}

let editingProduct = null;



/* =========================
CARGAR PRODUCTOS
========================= */

async function loadProducts(){

try{

const data = await apiRequest(`/products/${store_id}`);

const table = document.getElementById("products-table");

table.innerHTML = "";

data.forEach(p=>{

const imageHTML = p.image
? `<img src="${API_URL}/uploads/${p.image}" width="60">`
: "";

const featuredBadge = p.featured
? `<span style="color:green;font-weight:bold;">⭐</span>`
: "";

table.innerHTML += `
<tr>

<td>${p.name || ""}</td>

<td>${p.description || ""}</td>

<td>${p.price || ""}</td>

<td>${imageHTML}</td>

<td>${p.category || ""}</td>

<td>${featuredBadge}</td>

<td>

<button onclick='editProduct(
${p.id},
${JSON.stringify(p.name || "")},
${JSON.stringify(p.description || "")},
${p.price || 0},
${JSON.stringify(p.category || "")},
${p.featured ? true : false}
)'>
Editar
</button>

<button onclick="deleteProduct(${p.id})">
Eliminar
</button>

</td>

</tr>
`;

});

}catch(err){

console.error("Error cargando productos",err);

}

}



/* =========================
CREAR / ACTUALIZAR PRODUCTO
========================= */

async function createProduct(){

const name = document.getElementById("name").value;
const description = document.getElementById("description").value;
const price = document.getElementById("price").value;
const category = document.getElementById("category").value;
const featured = document.getElementById("featured").checked;

if(!name || !price){
alert("Nombre y precio son obligatorios");
return;
}

const formData = new FormData();

formData.append("name",name);
formData.append("description",description);
formData.append("price",price);
formData.append("category",category);
formData.append("featured",featured);

const image = document.getElementById("image").files[0];

if(image){
formData.append("image",image);
}

let url = `/products`;
let method = "POST";

if(editingProduct){
url = `/products/${editingProduct}`;
method = "PUT";
}

await fetch(`${API_URL}/api${url}`,{
method:method,
headers:{
Authorization:`Bearer ${token}`
},
body:formData
});

editingProduct = null;

document.getElementById("product-form").reset();

document.getElementById("save-btn").innerText="Agregar";

loadProducts();

}



/* =========================
EDITAR PRODUCTO
========================= */

function editProduct(id,name,description,price,category,featured){

editingProduct = id;

document.getElementById("name").value=name;
document.getElementById("description").value=description;
document.getElementById("price").value=price;
document.getElementById("category").value=category;
document.getElementById("featured").checked=featured;

document.getElementById("save-btn").innerText="Guardar cambios";

}



/* =========================
ELIMINAR PRODUCTO
========================= */

async function deleteProduct(id){

const ok = confirm("¿Eliminar producto?");

if(!ok) return;

await apiRequest(`/products/${id}`,"DELETE");

loadProducts();

}



loadProducts();

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.createProduct = createProduct;