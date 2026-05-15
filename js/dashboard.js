import { getProducts } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {

  const store = localStorage.getItem("store_id");

  if (!store) {

    window.location = "login.html";

    return;

  }

  try {

    // =========================
    // TOTAL PRODUCTOS
    // =========================

    const products =
      await getProducts(store);

    const totalProducts =
      products?.length || 0;

    const totalProductsElement =
      document.getElementById("total-products");

    if(totalProductsElement){

      totalProductsElement.innerText =
        totalProducts;

    }


    // =========================
    // STOCK BAJO
    // =========================

    let lowStock = 0;

    products.forEach(product => {

      const variants =
        product.variants || [];

      variants.forEach(v => {

        if(Number(v.stock) <= 5){

          lowStock++;

        }

      });

    });

    const lowStockElement =
      document.getElementById("low-stock");

    if(lowStockElement){

      lowStockElement.innerText =
        lowStock;

    }


    // =========================
    // PLACEHOLDERS ERP
    // =========================

    // pedidos pendientes
    const ordersElement =
      document.getElementById("total-orders");

    if(ordersElement){

      ordersElement.innerText = "0";

    }

    // ventas del mes
    const salesElement =
      document.getElementById("month-sales");

    if(salesElement){

      salesElement.innerText = "$0";

    }

  } catch(err){

    console.error("Dashboard error:", err);

  }

});