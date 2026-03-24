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
let chartVentasMesInstance = null;
let chartVentasAnioInstance = null;
let chartTopCodigosInstance = null;

let filtrosIniciales = null;

const filtroAnio = document.getElementById("filtroAnio");
const filtroMes = document.getElementById("filtroMes");
const filtroMarca = document.getElementById("filtroMarca");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroCodigo = document.getElementById("filtroCodigo");
const filtroCodigoBusqueda = document.getElementById("filtroCodigoBusqueda");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

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
  optionDefault.textContent = `Todos - ${placeholder}`;
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

function aplicarFiltrosIniciales() {
  if (!filtrosIniciales) return;

  llenarSelect(filtroAnio, filtrosIniciales.anios || [], "Año");
  llenarSelect(filtroMes, filtrosIniciales.meses || [], "Mes");
  llenarSelect(filtroMarca, filtrosIniciales.marcas || [], "Marca");
  llenarSelect(filtroCategoria, filtrosIniciales.categorias || [], "Categoría");
  llenarSelect(filtroCodigo, filtrosIniciales.codigos || [], "Código + marca");
}

function obtenerFiltrosActuales() {
  return {
    anio: filtroAnio.value,
    mes: filtroMes.value,
    marca: filtroMarca.value,
    categoria: filtroCategoria.value,
    codigo: filtroCodigo.value,
    codigo_busqueda: filtroCodigoBusqueda.value.trim()
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
  if (filtros.codigo) params.append("codigo", filtros.codigo);
  if (filtros.codigo_busqueda) params.append("codigo_busqueda", filtros.codigo_busqueda);

  const baseUrl = API_URL.split("?")[0];
  return `${baseUrl}?${params.toString()}`;
}

function actualizarKPIs(kpis) {
  document.getElementById("kpiMonto").textContent =
    formatearNumero(kpis.totalMonto);

  document.getElementById("kpiCantidad").textContent =
    formatearNumero(kpis.totalCantidad);

  document.getElementById("kpiVeces").textContent =
    formatearNumero(kpis.totalVecesVendidas);

  document.getElementById("kpiPrecio").textContent =
    formatearNumero(Math.round(kpis.precioPromedio || 0));

  document.getElementById("kpiProductos").textContent =
    formatearNumero(kpis.totalProductos);

  document.getElementById("kpiCodigoTop").textContent =
    kpis.codigoTop || "Sin datos";
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
          backgroundColor: [
            "rgba(13, 99, 255, 0.85)",
            "rgba(0, 194, 255, 0.85)",
            "rgba(123, 97, 255, 0.85)",
            "rgba(255, 159, 26, 0.85)",
            "rgba(20, 195, 142, 0.85)",
            "rgba(13, 99, 255, 0.75)"
          ],
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { weight: "bold" }
          }
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
          grid: {
            display: false
          },
          ticks: {
            color: "#44536b",
            font: { weight: "bold" }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#44536b",
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
          backgroundColor: "rgba(0, 194, 255, 0.78)",
          borderColor: "rgba(13, 99, 255, 1)",
          borderWidth: 1.5,
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { weight: "bold" }
          }
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
          grid: {
            display: false
          },
          ticks: {
            color: "#44536b",
            font: { weight: "bold" }
          }
        },
        x: {
          beginAtZero: true,
          ticks: {
            color: "#44536b",
            callback: function(value) {
              return formatearNumero(value);
            }
          }
        }
      }
    }
  });
}

function renderChartVentasPorMes(data) {
  const canvas = document.getElementById("chartVentasMes");
  if (!canvas) return;

  const labels = (data || []).map(item => item[0]);
  const values = (data || []).map(item => Number(item[1] || 0));

  if (chartVentasMesInstance) {
    chartVentasMesInstance.destroy();
  }

  chartVentasMesInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Veces vendidas",
          data: values,
          borderColor: "#ff4fa3",
          backgroundColor: "rgba(255, 79, 163, 0.18)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { weight: "bold" }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#44536b",
            font: { weight: "bold" }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#44536b",
            callback: function(value) {
              return formatearNumero(value);
            }
          }
        }
      }
    }
  });
}

function renderChartVentasPorAnio(data) {
  const canvas = document.getElementById("chartVentasAnio");
  if (!canvas) return;

  const labels = (data || []).map(item => item[0]);
  const values = (data || []).map(item => Number(item[1] || 0));

  if (chartVentasAnioInstance) {
    chartVentasAnioInstance.destroy();
  }

  chartVentasAnioInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Veces vendidas",
          data: values,
          backgroundColor: "rgba(20, 195, 142, 0.75)",
          borderColor: "rgba(20, 195, 142, 1)",
          borderWidth: 1.5,
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { weight: "bold" }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#44536b",
            font: { weight: "bold" }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#44536b",
            callback: function(value) {
              return formatearNumero(value);
            }
          }
        }
      }
    }
  });
}

function renderChartTopCodigos(data) {
  const canvas = document.getElementById("chartTopCodigos");
  if (!canvas) return;

  const labels = (data || []).slice(0, 5).map(item => item[0]);
  const values = (data || []).slice(0, 5).map(item => Number(item[1] || 0));

  if (chartTopCodigosInstance) {
    chartTopCodigosInstance.destroy();
  }

  chartTopCodigosInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#0d63ff",
            "#00c2ff",
            "#7b61ff",
            "#ff9f1a",
            "#14c38e"
          ],
          borderColor: "#ffffff",
          borderWidth: 4,
          hoverOffset: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 18,
            usePointStyle: true,
            pointStyle: "circle",
            font: { weight: "bold" }
          }
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

function renderTablaCodigos(data) {
  const tbody = document.getElementById("tablaCodigosBody");
  tbody.innerHTML = "";

  if (!data || !data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3">No hay datos disponibles</td>
      </tr>
    `;
    return;
  }

  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
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
  const ventasPorMes = data?.charts?.ventasPorMes || [];
  const topCodigos = data?.charts?.topCodigos || [];
  const kpis = data?.kpis || {};

  if (!topMarcas.length && !porMes.length) {
    insight1.textContent = "No hay datos para los filtros seleccionados.";
    insight2.textContent = "Limpia filtros o cambia la combinación actual.";
    return;
  }

  const marcaTop = topMarcas[0] || ["Sin datos", 0];
  const codigoTop = topCodigos[0] || ["Sin datos", 0];

  let mejorMesMonto = ["Sin datos", 0];
  porMes.forEach(item => {
    if (Number(item[1] || 0) > Number(mejorMesMonto[1] || 0)) {
      mejorMesMonto = item;
    }
  });

  let mejorMesFrecuencia = ["Sin datos", 0];
  ventasPorMes.forEach(item => {
    if (Number(item[1] || 0) > Number(mejorMesFrecuencia[1] || 0)) {
      mejorMesFrecuencia = item;
    }
  });

  insight1.textContent =
    `La marca líder es ${marcaTop[0]} y el código con mayor monto es ${codigoTop[0]}.`;

  insight2.textContent =
    `El mes con mayor monto es ${mejorMesMonto[0]}, el mes con más ventas es ${mejorMesFrecuencia[0]} y el total asciende a ${formatearNumero(kpis.totalMonto)}.`;
}

async function cargarFiltrosIniciales() {
  const baseUrl = API_URL.split("?")[0];
  const response = await fetch(`${baseUrl}?action=data`);
  const data = await response.json();

  if (!data || !data.baseFilters) {
    throw new Error("No se pudieron cargar los filtros iniciales.");
  }

  filtrosIniciales = data.baseFilters;
  aplicarFiltrosIniciales();
}

async function cargarDashboard() {
  mostrarLoader(true);
  ocultarError();

  try {
    const url = construirUrlConFiltros();
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.kpis || !data.charts) {
      throw new Error("La respuesta no tiene la estructura esperada.");
    }

    actualizarKPIs(data.kpis);
    renderChartMontoPorMes(data.charts.porMes || []);
    renderChartTopMarcas(data.charts.topMarcas || []);
    renderChartVentasPorMes(data.charts.ventasPorMes || []);
    renderChartVentasPorAnio(data.charts.ventasPorAnio || []);
    renderChartTopCodigos(data.charts.topCodigos || []);
    renderTablaCodigos(data.charts.topCodigos || []);
    generarInsights(data);
  } catch (error) {
    mostrarError("Error al cargar datos del dashboard");
    console.error("Error al cargar dashboard:", error);
  } finally {
    mostrarLoader(false);
  }
}

function limpiarFiltros() {
  filtroAnio.value = "";
  filtroMes.value = "";
  filtroMarca.value = "";
  filtroCategoria.value = "";
  filtroCodigo.value = "";
  filtroCodigoBusqueda.value = "";
  cargarDashboard();
}

function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function activarEventosFiltros() {
  filtroAnio.addEventListener("change", cargarDashboard);
  filtroMes.addEventListener("change", cargarDashboard);
  filtroMarca.addEventListener("change", cargarDashboard);
  filtroCategoria.addEventListener("change", cargarDashboard);
  filtroCodigo.addEventListener("change", cargarDashboard);
  filtroCodigoBusqueda.addEventListener("input", debounce(cargarDashboard, 400));
  btnLimpiarFiltros.addEventListener("click", limpiarFiltros);
}

async function init() {
  try {
    mostrarLoader(true);
    await cargarFiltrosIniciales();
    activarEventosFiltros();
    await cargarDashboard();
  } catch (error) {
    mostrarError("No se pudo inicializar el dashboard");
    console.error(error);
  } finally {
    mostrarLoader(false);
  }
}

init();