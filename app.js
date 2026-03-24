const API_URL = "https://script.google.com/macros/s/AKfycbzg-Ks1cZ0NEwA2aBxNE4J6OCOHDWqpo9W8jza2EjBRoc81nXkEleF6KltDosVt6hdm/exec?action=data";

let chartMontoMesInstance = null;
let chartTopMarcasInstance = null;

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

function actualizarFiltros(filterOptions) {
  llenarSelect(filtroAnio, filterOptions?.anios || [], "Año");
  llenarSelect(filtroMes, filterOptions?.meses || [], "Mes");
  llenarSelect(filtroMarca, filterOptions?.marcas || [], "Marca");
  llenarSelect(filtroCategoria, filterOptions?.categorias || [], "Categoría");
}

async function cargarDashboard() {
  try {
    const url = construirUrlConFiltros();
    const response = await fetch(url);
    const data = await response.json();

    console.log("DATOS DASHBOARD:", data);

    if (!data || !data.kpis || !data.charts || !data.filters) {
      throw new Error("La respuesta no tiene la estructura esperada.");
    }

    actualizarFiltros(data.filters);
    actualizarKPIs(data.kpis);
    renderChartMontoPorMes(data.charts.porMes || []);
    renderChartTopMarcas(data.charts.topMarcas || []);
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
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