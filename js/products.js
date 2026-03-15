import { apiRequest } from "./api.js";

const token = localStorage.getItem("token");
const store_id = localStorage.getItem("store_id");

if (!token) {
window.location = "login.html";
}

let editingProduct = null;



async function loadProducts(){

try{

const data = await apiRequest(`/products/${store_id}`);

const table = document.getElementById("products-table");

table.innerHTML = "";

data.forEach(p=>{

const imageHTML = p.image
? `<img src="http://localhost:3000/uploads/${p.image}" width="60">`
: "";

table.innerHTML += `
<tr>

<td>${p.name || ""}</td>

<td>${p.description || ""}</td>

<td>${p.price || ""}</td>

<td>${imageHTML}</td>

<td>${p.category || ""}</td>

<td>

<button onclick='editProduct(
${p.id},
${JSON.stringify(p.name || "")},
${JSON.stringify(p.description || "")},
${p.price || 0},
${JSON.stringify(p.category || "")}
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



async function createProduct(){

const name = document.getElementById("name").value;
const description = document.getElementById("description").value;
const price = document.getElementById("price").value;
const category = document.getElementById("category").value;

if(!name || !price){
alert("Nombre y precio son obligatorios");
return;
}

const formData = new FormData();

formData.append("name",name);
formData.append("description",description);
formData.append("price",price);
formData.append("category",category);

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

await fetch(`http://localhost:3000/api${url}`,{
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



function editProduct(id,name,description,price,category){

editingProduct = id;

document.getElementById("name").value=name;
document.getElementById("description").value=description;
document.getElementById("price").value=price;
document.getElementById("category").value=category;

document.getElementById("save-btn").innerText="Guardar cambios";

}



async function deleteProduct(id){

const ok = confirm("¿Eliminar producto?");

if(!ok) return;

await apiRequest(`/products/${id}`,"DELETE");

loadProducts();

}



loadProducts();
