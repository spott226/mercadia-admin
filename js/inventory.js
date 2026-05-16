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

let inventoryData = [];

let movementsData = [];


/* =========================
PAGINATION INVENTORY
========================= */

let inventoryPage = 1;

let inventoryLimit = 10;


/* =========================
INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadInventory();

    loadMovements();

    setupFilters();

  }
);


/* =========================
LOAD INVENTORY ERP
========================= */

async function loadInventory(){

  try{

    const res = await fetch(
      `${API_URL}/inventory`,
      {
        headers:{
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const data =
      await res.json();

    inventoryData =
      data.inventory || [];

    renderInventoryKPIs(
      data.kpis || {}
    );

    renderInventoryTable(
      inventoryData
    );

  }catch(err){

    console.error(
      "Error inventory",
      err
    );

  }

}


/* =========================
LOAD MOVEMENTS ERP
========================= */

async function loadMovements(){

  try{

    const res = await fetch(
      `${API_URL}/inventory/movements`,
      {
        headers:{
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const data =
      await res.json();

    movementsData =
      data.movements || [];

    renderMovementsTable(
      movementsData
    );

  }catch(err){

    console.error(
      "Error movements",
      err
    );

  }

}


/* =========================
KPIS
========================= */

function renderInventoryKPIs(kpis){

  document.getElementById(
    "inventory-value"
  ).innerText =
    `$${Number(
      kpis.totalInventoryValue || 0
    ).toLocaleString()}`;

  document.getElementById(
    "total-variants"
  ).innerText =
    kpis.totalVariants || 0;

  document.getElementById(
    "low-stock"
  ).innerText =
    kpis.lowStock || 0;

  document.getElementById(
    "total-stock"
  ).innerText =
    kpis.totalStock || 0;

}


/* =========================
RENDER INVENTORY
========================= */

function renderInventoryTable(data){

  const table =
    document.getElementById(
      "inventory-table"
    );

  table.innerHTML = "";

  if(data.length === 0){

    table.innerHTML = `
    <tr>
      <td colspan="9" class="empty">
        No hay inventario
      </td>
    </tr>
    `;

    return;

  }


  /* =========================
  PAGINATION
  ========================= */

  const start =
    (inventoryPage - 1)
    * inventoryLimit;

  const end =
    start + inventoryLimit;

  const paginatedData =
    data.slice(start,end);


  /* =========================
  TABLE DATA
  ========================= */

  paginatedData.forEach(item=>{

    const stockClass =
      Number(item.stock) <= 5
      ? "stock-low"
      : "stock-ok";

    const stockLabel =
      Number(item.stock) <= 5
      ? "BAJO"
      : "OK";

    table.innerHTML += `
    <tr>

      <td>
        ${item.product_name || "-"}
      </td>

      <td>

        ${
          item.image
          ? `
            <img
              src="${item.image}"
              style="
                width:60px;
                height:60px;
                object-fit:cover;
                border-radius:10px;
              "
            >
          `
          : "-"
        }

      </td>

      <td>
        ${item.category || "-"}
      </td>

      <td>
        ${item.color || "-"}
        /
        ${item.size || "-"}
      </td>

      <td>
        ${item.sku || "-"}
      </td>

      <td>
        ${item.stock || 0}
      </td>

      <td
        style="
          min-width:120px;
          white-space:nowrap;
        "
      >
        $${Number(
          item.cost || 0
        ).toFixed(2)}
      </td>

      <td
        style="
          min-width:160px;
          font-weight:600;
          white-space:nowrap;
        "
      >
        $${Number(
          item.inventory_value || 0
        ).toLocaleString()}
      </td>

      <td>

        <span class="${stockClass}">

          ${stockLabel}

        </span>

      </td>

    </tr>
    `;

  });

  renderInventoryPagination(
    data.length
  );

}


/* =========================
PAGINATION UI
========================= */

function renderInventoryPagination(totalItems){

  const totalPages =
    Math.ceil(
      totalItems / inventoryLimit
    );

  let pagination =
    document.getElementById(
      "inventory-pagination"
    );

  if(!pagination){

    pagination =
      document.createElement("div");

    pagination.id =
      "inventory-pagination";

    pagination.className =
      "pagination";

    pagination.style.marginTop =
      "20px";

    pagination.style.display =
      "flex";

    pagination.style.justifyContent =
      "center";

    pagination.style.alignItems =
      "center";

    pagination.style.gap =
      "10px";

    document
      .querySelector(".table-card")
      .appendChild(pagination);

  }

  pagination.innerHTML = `

    <button
      ${
        inventoryPage <= 1
        ? "disabled"
        : ""
      }
      onclick="prevInventoryPage()"
    >
      Anterior
    </button>

    <span
      style="
        font-weight:600;
      "
    >
      Página ${inventoryPage}
      de ${totalPages}
    </span>

    <button
      ${
        inventoryPage >= totalPages
        ? "disabled"
        : ""
      }
      onclick="nextInventoryPage()"
    >
      Siguiente
    </button>

  `;

}


/* =========================
NEXT PAGE
========================= */

window.nextInventoryPage = () => {

  const totalPages =
    Math.ceil(
      inventoryData.length
      / inventoryLimit
    );

  if(
    inventoryPage < totalPages
  ){

    inventoryPage++;

    applyFilters();

  }

};


/* =========================
PREV PAGE
========================= */

window.prevInventoryPage = () => {

  if(inventoryPage > 1){

    inventoryPage--;

    applyFilters();

  }

};


/* =========================
RENDER MOVEMENTS
========================= */

function renderMovementsTable(data){

  const table =
    document.getElementById(
      "movements-table"
    );

  table.innerHTML = "";

  if(data.length === 0){

    table.innerHTML = `
    <tr>
      <td colspan="10" class="empty">
        No hay movimientos
      </td>
    </tr>
    `;

    return;

  }

  data.forEach(movement=>{

    let movementClass =
      "movement-adjustment";

    if(
      movement.type === "SALE"
    ){

      movementClass =
        "movement-sale";

    }

    if(
      movement.type ===
      "CANCELLED_ORDER"
    ){

      movementClass =
        "movement-cancelled";

    }

    const createdAt =
      movement.created_at
      ? new Date(
          movement.created_at
        ).toLocaleString()
      : "-";

    table.innerHTML += `
    <tr>

      <td>

        <span class="${movementClass}">

          ${movement.type}

        </span>

      </td>

      <td>
        ${movement.product_name || "-"}
      </td>

      <td>
        ${movement.color || "-"}
        /
        ${movement.size || "-"}
      </td>

      <td>
        ${movement.sku || "-"}
      </td>

      <td>
        ${movement.quantity || 0}
      </td>

      <td>
        ${movement.previous_stock || 0}
      </td>

      <td>
        ${movement.new_stock || 0}
      </td>

      <td>

        ${movement.reference_type || "-"}

        #

        ${movement.reference_id || "-"}

      </td>

      <td>
        ${movement.notes || "-"}
      </td>

      <td>
        ${createdAt}
      </td>

    </tr>
    `;

  });

}


/* =========================
FILTERS
========================= */

function setupFilters(){

  const searchInput =
    document.getElementById(
      "search-inventory"
    );

  const movementFilter =
    document.getElementById(
      "filter-movement"
    );

  searchInput.addEventListener(
    "keyup",
    applyFilters
  );

  movementFilter.addEventListener(
    "change",
    applyFilters
  );

}


/* =========================
APPLY FILTERS
========================= */

function applyFilters(){

  const search =
    document
      .getElementById(
        "search-inventory"
      )
      .value
      .toLowerCase();

  const movementType =
    document
      .getElementById(
        "filter-movement"
      )
      .value;


  /* =========================
  INVENTORY FILTER
  ========================= */

  let filteredInventory =
    [...inventoryData];

  if(search){

    filteredInventory =
      filteredInventory.filter(item =>

        (item.product_name || "")
        .toLowerCase()
        .includes(search)

        ||

        (item.sku || "")
        .toLowerCase()
        .includes(search)

      );

  }

  renderInventoryTable(
    filteredInventory
  );


  /* =========================
  MOVEMENTS FILTER
  ========================= */

  let filteredMovements =
    [...movementsData];

  if(search){

    filteredMovements =
      filteredMovements.filter(m =>

        (m.product_name || "")
        .toLowerCase()
        .includes(search)

        ||

        (m.sku || "")
        .toLowerCase()
        .includes(search)

      );

  }

  if(movementType){

    filteredMovements =
      filteredMovements.filter(
        m =>
          m.type === movementType
      );

  }

  renderMovementsTable(
    filteredMovements
  );

}