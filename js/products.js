import { apiRequest } from "./api.js";

const API_URL = "https://mercadia-back-production.up.railway.app";

const token = localStorage.getItem("token");
const store_id = localStorage.getItem("store_id");

if (!token || !store_id) {
  window.location = "login.html";
}

let editingProduct = null;
let variants = [];

/* =========================
VARIANTES
========================= */

function addVariant(){

  const color = document.getElementById("variant-color").value;
  const sizesInput = document.getElementById("variant-size").value;
  const price = document.getElementById("variant-price").value;
  const imageInput = document.getElementById("variant-image");

  if(!color || !sizesInput || !price){
    alert("Completa todo");
    return;
  }

  if(!imageInput.files[0]){
    alert("Selecciona imagen");
    return;
  }

  const exists = variants.find(v => v.color === color);
  if(exists){
    alert("Color ya existe");
    return;
  }

  const sizes = sizesInput.split(",").map(s => s.trim());

  variants.push({
    color,
    sizes,
    price,
    image: imageInput.files[0]
  });

  renderVariants();

  document.getElementById("variant-color").value="";
  document.getElementById("variant-size").value="";
  document.getElementById("variant-price").value="";
  imageInput.value="";
}

function renderVariants(){

  const list = document.getElementById("variants-list");
  list.innerHTML = "";

  variants.forEach((v,i)=>{

    list.innerHTML += `
    <div>
      ${v.color} / ${v.sizes.join(",")} / $${v.price}
      <button onclick="removeVariant(${i})">x</button>
    </div>
    `;
  });

}

function removeVariant(index){
  variants.splice(index,1);
  renderVariants();
}

window.addVariant = addVariant;
window.removeVariant = removeVariant;

/* =========================
GUARDAR PRODUCTO
========================= */

async function createProduct(){

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  if(!name || !price){
    alert("Faltan datos");
    return;
  }

  const formData = new FormData();

  formData.append("name",name);
  formData.append("description",document.getElementById("description").value);
  formData.append("price",price);
  formData.append("category",document.getElementById("category").value);
  formData.append("featured",document.getElementById("featured").checked);

  /* 🔥 VARIANTES */

  let finalVariants = [];

  variants.forEach(v=>{
    v.sizes.forEach(size=>{
      finalVariants.push({
        color: v.color,
        size,
        price: v.price
      });
    });
  });

  // 🔥 SI NO HAY VARIANTES → enviar vacío (esto es clave)
  formData.append("variants", JSON.stringify(finalVariants));

  // 🔥 SOLO enviar imágenes si existen
  const withImage = variants.filter(v => v.image);

  withImage.forEach(v=>{
    formData.append("color_images", v.image);
  });

  if(withImage.length){
    formData.append(
      "image_colors",
      JSON.stringify(withImage.map(v => v.color))
    );
  }

  /* IMAGEN PRINCIPAL */

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

  const res = await fetch(`${API_URL}/api${url}`,{
    method,
    headers:{ Authorization:`Bearer ${token}` },
    body:formData
  });

  if(!res.ok){
    alert("Error");
    return;
  }

  editingProduct = null;
  variants = [];
  renderVariants();
  document.getElementById("product-form").reset();
  loadProducts();
}

/* =========================
EDITAR
========================= */

function editProduct(id,name,description,price,category,featured,productVariants){

  editingProduct = id;

  document.getElementById("name").value=name;
  document.getElementById("description").value=description;
  document.getElementById("price").value=price;
  document.getElementById("category").value=category;
  document.getElementById("featured").checked=featured;

  // 🔥 reconstruir SIN imagen
  const grouped = {};

  productVariants.forEach(v=>{
    if(!grouped[v.color]){
      grouped[v.color] = {
        color:v.color,
        sizes:[],
        price:v.price,
        image:null
      };
    }
    grouped[v.color].sizes.push(v.size);
  });

  variants = Object.values(grouped);

  renderVariants();
}

/* =========================
ELIMINAR
========================= */

async function deleteProduct(id){

  if(!confirm("Eliminar?")) return;

  await apiRequest(`/products/${id}`,"DELETE");
  loadProducts();
}

/* =========================
LOAD
========================= */

async function loadProducts(){

  const data = await apiRequest(`/products/${store_id}`);
  const table = document.getElementById("products-table");

  table.innerHTML = "";

  data.forEach(p=>{
    table.innerHTML += `
    <tr>
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.image ? `<img src="${p.image}" width="60">` : ""}</td>
      <td>
        <button onclick='editProduct(${p.id},"${p.name}","${p.description}",${p.price},"${p.category}",${p.featured},${JSON.stringify(p.variants)})'>Editar</button>
        <button onclick="deleteProduct(${p.id})">Eliminar</button>
      </td>
    </tr>
    `;
  });
}

window.createProduct = createProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

loadProducts();