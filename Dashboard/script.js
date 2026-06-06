const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        color: "#4c5870",
        font: {
          family: "Inter",
          size: 12,
          weight: "600"
        }
      }
    },
    tooltip: {
      backgroundColor: "#172033",
      padding: 12,
      titleFont: {
        family: "Inter",
        weight: "700"
      },
      bodyFont: {
        family: "Inter"
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: "#697386",
        font: {
          family: "Inter",
          weight: "600"
        }
      }
    },
    y: {
      border: {
        display: false
      },
      grid: {
        color: "#edf1f7"
      },
      ticks: {
        color: "#697386",
        font: {
          family: "Inter",
          weight: "600"
        }
      }
    }
  }
};

new Chart(document.getElementById("revenueChart"), {
  type: "line",
  data: {
    labels: months,
    datasets: [
      {
        label: "Revenue ($K)",
        data: [72, 84, 91, 88, 110, 124, 118, 132, 149, 153, 168, 191],
        borderColor: "#246bfe",
        backgroundColor: "rgba(36, 107, 254, 0.12)",
        fill: true,
        tension: 0.38,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#246bfe"
      }
    ]
  },
  options: commonOptions
});

new Chart(document.getElementById("categoryChart"), {
  type: "bar",
  data: {
    labels: ["Electronics", "Fashion", "Home", "Beauty", "Sports"],
    datasets: [
      {
        label: "Sales ($K)",
        data: [328, 246, 198, 154, 132],
        backgroundColor: ["#246bfe", "#00a88f", "#f5a623", "#ec5b78", "#6c63ff"],
        borderRadius: 7
      }
    ]
  },
  options: {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false
      }
    }
  }
});

new Chart(document.getElementById("regionChart"), {
  type: "doughnut",
  data: {
    labels: ["North", "South", "East", "West"],
    datasets: [
      {
        data: [34, 27, 21, 18],
        backgroundColor: ["#246bfe", "#00a88f", "#f5a623", "#ec5b78"],
        borderColor: "#ffffff",
        borderWidth: 5,
        hoverOffset: 8
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: commonOptions.plugins
  }
});

new Chart(document.getElementById("channelChart"), {
  type: "bar",
  data: {
    labels: ["Website", "Marketplace", "Retail Store", "Partners"],
    datasets: [
      {
        label: "Orders",
        data: [9200, 7100, 5200, 3360],
        backgroundColor: "#00a88f",
        borderRadius: 7
      }
    ]
  },
  options: {
    ...commonOptions,
    indexAxis: "y",
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false
      }
    }
  }
});

new Chart(document.getElementById("profitChart"), {
  type: "radar",
  data: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Profit ($K)",
        data: [96, 118, 142, 174],
        borderColor: "#ec5b78",
        backgroundColor: "rgba(236, 91, 120, 0.18)",
        pointBackgroundColor: "#ec5b78",
        pointBorderColor: "#ffffff",
        pointRadius: 4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonOptions.plugins,
    scales: {
      r: {
        angleLines: {
          color: "#edf1f7"
        },
        grid: {
          color: "#edf1f7"
        },
        pointLabels: {
          color: "#4c5870",
          font: {
            family: "Inter",
            weight: "700"
          }
        },
        ticks: {
          backdropColor: "transparent",
          color: "#697386"
        }
      }
    }
  }
});
