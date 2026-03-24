function mostrarLoader(show) {
  document.getElementById("loader").classList.toggle("hidden", !show);
}

function mostrarError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.classList.remove("hidden");
}

function ocultarError() {
  document.getElementById("errorBox").classList.add("hidden");
}

const API_URL = "https://script.google.com/macros/s/AKfycbzg-Ks1cZ0NEwA2aBxNE4J6OCOHDWqpo9W8jza2EjBRoc81nXkEleF6KltDosVt6hdm/exec?action=data";

let chartMontoMesInstance = null;
let chartTopMarcasInstance = null;
let chartCategoriasInstance = null;

const filtroAnio = document.getElementById("filtroAnio");
const filtroMes = document.getElementById("filtroMes");
const filtroMarca = document.getElementById("filtroMarca");
const filtroCategoria = document.getElementById("filtroCategoria");

function formatearNumero(valor) {
  return Number(valor || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function llenarSelect(selectElement, items, placeholder) {
  const valorActual = selectElement.value;

  selectElement.innerHTML = "";

  const optionDefault = document.createElement("option");
  optionDefault.value = "";
  optionDefault.textContent = placeholder;
  selectElement.appendChild(optionDefault);

  (items || []).forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectElement.appendChild(option);
  });

  const existeValor = (items || []).includes(valorActual);
  selectElement.value = existeValor ? valorActual : "";
}

function obtenerFiltrosActuales() {
  return {
    anio: filtroAnio.value,
    mes: filtroMes.value,
    marca: filtroMarca.value,
    categoria: filtroCategoria.value
  };
}

function construirUrlConFiltros() {
  const filtros = obtenerFiltrosActuales();
  const params = new URLSearchParams();

  params.append("action", "data");

  if (filtros.anio) params.append("anio", filtros.anio);
  if (filtros.mes) params.append("mes", filtros.mes);
  if (filtros.marca) params.append("marca", filtros.marca);
  if (filtros.categoria) params.append("categoria", filtros.categoria);

  const baseUrl = API_URL.split("?")[0];
  return `${baseUrl}?${params.toString()}`;
}

function actualizarKPIs(kpis) {
  document.getElementById("kpiMonto").textContent =
    formatearNumero(kpis.totalMonto);

  document.getElementById("kpiCantidad").textContent =
    formatearNumero(kpis.totalCantidad);

  document.getElementById("kpiRegistros").textContent =
    formatearNumero(kpis.totalRegistros);

  document.getElementById("kpiPrecio").textContent =
    formatearNumero(Math.round(kpis.precioPromedio || 0));
}

function renderChartMontoPorMes(data) {
  const canvas = document.getElementById("chartMontoMes");
  if (!canvas) return;

  const labels = (data || []).map(item => item[0]);
  const values = (data || []).map(item => Number(item[1] || 0));

  if (chartMontoMesInstance) {
    chartMontoMesInstance.destroy();
  }

  chartMontoMesInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Monto",
          data: values,
          backgroundColor: "rgba(84, 169, 230, 0.55)",
          borderColor: "rgba(84, 169, 230, 1)",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return "Monto: " + formatearNumero(context.raw);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatearNumero(value);
            }
          }
        }
      }
    }
  });
}

function renderChartTopMarcas(data) {
  const canvas = document.getElementById("chartTopMarcas");
  if (!canvas) return;

  const labels = (data || []).map(item => item[0]);
  const values = (data || []).map(item => Number(item[1] || 0));

  if (chartTopMarcasInstance) {
    chartTopMarcasInstance.destroy();
  }

  chartTopMarcasInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Monto por marca",
          data: values,
          backgroundColor: "rgba(84, 169, 230, 0.55)",
          borderColor: "rgba(84, 169, 230, 1)",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return "Monto: " + formatearNumero(context.raw);
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatearNumero(value);
            }
          }
        }
      }
    }
  });
}

function renderChartCategorias(topMarcas) {
  const canvas = document.getElementById("chartCategorias");
  if (!canvas) return;

  const labels = (topMarcas || []).slice(0, 5).map(item => item[0]);
  const values = (topMarcas || []).slice(0, 5).map(item => Number(item[1] || 0));

  if (chartCategoriasInstance) {
    chartCategoriasInstance.destroy();
  }

  chartCategoriasInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#123e73",
            "#2b67ac",
            "#4d8bd6",
            "#7fb2ea",
            "#b8d6f6"
          ],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${formatearNumero(context.raw)}`;
            }
          }
        }
      }
    }
  });
}

function actualizarFiltros(filterOptions) {
  llenarSelect(filtroAnio, filterOptions?.anios || [], "Año");
  llenarSelect(filtroMes, filterOptions?.meses || [], "Mes");
  llenarSelect(filtroMarca, filterOptions?.marcas || [], "Marca");
  llenarSelect(filtroCategoria, filterOptions?.categorias || [], "Categoría");
}

function renderTablaMarcas(data) {
  const tbody = document.getElementById("tablaMarcasBody");
  tbody.innerHTML = "";

  if (!data || !data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="2">No hay datos disponibles</td>
      </tr>
    `;
    return;
  }

  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item[0]}</td>
      <td>${formatearNumero(item[1])}</td>
    `;
    tbody.appendChild(tr);
  });
}

function generarInsights(data) {
  const insight1 = document.getElementById("insight1");
  const insight2 = document.getElementById("insight2");

  const topMarcas = data?.charts?.topMarcas || [];
  const porMes = data?.charts?.porMes || [];
  const kpis = data?.kpis || {};

  if (!topMarcas.length && !porMes.length) {
    insight1.textContent = "No hay datos para los filtros seleccionados.";
    insight2.textContent = "Prueba cambiando año, mes, marca o categoría.";
    return;
  }

  const marcaTop = topMarcas[0] || ["Sin datos", 0];

  let mejorMes = ["Sin datos", 0];
  porMes.forEach(item => {
    if (Number(item[1] || 0) > Number(mejorMes[1] || 0)) {
      mejorMes = item;
    }
  });

  insight1.textContent =
    `La marca líder es ${marcaTop[0]} con monto ${formatearNumero(marcaTop[1])}.`;

  insight2.textContent =
    `El mes más fuerte es ${mejorMes[0]} y el total general es ${formatearNumero(kpis.totalMonto)}.`;
}

async function cargarDashboard() {
  mostrarLoader(true);
  ocultarError();

  try {
    const url = construirUrlConFiltros();
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.kpis || !data.charts || !data.filters) {
      throw new Error("La respuesta no tiene la estructura esperada.");
    }

    actualizarFiltros(data.filters);
    actualizarKPIs(data.kpis);
    renderChartMontoPorMes(data.charts.porMes || []);
    renderChartTopMarcas(data.charts.topMarcas || []);
    renderChartCategorias(data.charts.topMarcas || []);
    renderTablaMarcas(data.charts.topMarcas || []);
    generarInsights(data);

  } catch (error) {
    mostrarError("Error al cargar datos del dashboard");
    console.error("Error al cargar dashboard:", error);
  } finally {
    mostrarLoader(false);
  }
}

function activarEventosFiltros() {
  filtroAnio.addEventListener("change", cargarDashboard);
  filtroMes.addEventListener("change", cargarDashboard);
  filtroMarca.addEventListener("change", cargarDashboard);
  filtroCategoria.addEventListener("change", cargarDashboard);
}

activarEventosFiltros();
cargarDashboard();