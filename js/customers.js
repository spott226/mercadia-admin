const API_URL =
  "https://mercadia-back-production.up.railway.app/api";

const token =
  localStorage.getItem("token");

if(!token){

  window.location = "login.html";

}


/* =========================
GLOBAL DATA
========================= */

let customersData = [];


/* =========================
INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadCustomers();

    setupSearch();

  }
);


/* =========================
LOAD CUSTOMERS ERP
========================= */

async function loadCustomers(){

  try{

    const res = await fetch(
      `${API_URL}/customers`,
      {
        headers:{
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const data =
      await res.json();

    customersData =
      data.customers || [];

    renderKPIs(
      data.kpis || {}
    );

    renderCustomers(
      customersData
    );

  }catch(err){

    console.error(
      "Error loading customers",
      err
    );

  }

}


/* =========================
RENDER KPIS
========================= */

function renderKPIs(kpis){

  document.getElementById(
    "total-customers"
  ).innerText =
    kpis.totalCustomers || 0;

  document.getElementById(
    "total-revenue"
  ).innerText =
    `$${Number(
      kpis.totalRevenue || 0
    ).toFixed(2)}`;

  document.getElementById(
    "frequent-customers"
  ).innerText =
    kpis.frequentCustomers || 0;

}


/* =========================
RENDER CUSTOMERS
========================= */

function renderCustomers(customers){

  const table =
    document.getElementById(
      "customers-table"
    );

  table.innerHTML = "";

  if(customers.length === 0){

    table.innerHTML = `
    <tr>
      <td colspan="8" class="empty">
        No hay clientes
      </td>
    </tr>
    `;

    return;

  }

  customers.forEach(customer=>{

    const frequent =
      Number(
        customer.total_orders
      ) >= 2;

    const badge =
      frequent
      ? `
        <span class="badge badge-frequent">
          Frecuente
        </span>
      `
      : `
        <span class="badge badge-normal">
          Nuevo
        </span>
      `;

    const ordersHTML =
      (customer.orders || [])
      .map(order => `
        <div class="order-item">

          <strong>
            Pedido #${order.id}
          </strong>

          <br>

          Estado:
          ${order.status}

          <br>

          Total:
          $${Number(
            order.total || 0
          ).toFixed(2)}

        </div>
      `)
      .join("");

    const createdAt =
      customer.created_at
      ? new Date(
          customer.created_at
        ).toLocaleDateString()
      : "-";

    table.innerHTML += `
    <tr>

      <td>
        ${customer.name || "-"}
      </td>

      <td>
        ${customer.phone || "-"}
      </td>

      <td>
        ${customer.address || "-"}
      </td>

      <td>
        ${customer.total_orders || 0}
      </td>

      <td>
        $${Number(
          customer.total_spent || 0
        ).toFixed(2)}
      </td>

      <td>
        ${badge}
      </td>

      <td>

        <div class="orders-box">

          ${
            ordersHTML ||
            "Sin pedidos"
          }

        </div>

      </td>

      <td>
        ${createdAt}
      </td>

    </tr>
    `;

  });

}


/* =========================
SEARCH ERP
========================= */

function setupSearch(){

  const input =
    document.getElementById(
      "search-customer"
    );

  input.addEventListener(
    "keyup",
    applySearch
  );

}


/* =========================
APPLY SEARCH
========================= */

function applySearch(){

  const search =
    document
      .getElementById(
        "search-customer"
      )
      .value
      .toLowerCase();

  if(!search){

    renderCustomers(
      customersData
    );

    return;

  }

  const filtered =
    customersData.filter(customer =>

      (customer.name || "")
      .toLowerCase()
      .includes(search)

      ||

      (customer.phone || "")
      .toLowerCase()
      .includes(search)

    );

  renderCustomers(filtered);

}