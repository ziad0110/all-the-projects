// PhoneVerse — Price Chart Component
const PriceChartManager = {
  charts: {},
  
  create(canvasId, priceHistory, options = {}) {
    if (this.charts[canvasId]) { this.charts[canvasId].destroy(); }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const labels = priceHistory.map(p => p.date);
    const data = priceHistory.map(p => p.price);
    const isUp = data[data.length - 1] >= data[0];
    const color = isUp ? '#10b981' : '#ef4444';
    const bgColor = isUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
    
    this.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'السعر ($)',
          data,
          borderColor: color,
          backgroundColor: bgColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: options.showPoints ? 3 : 0,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26,26,62,0.9)',
            titleColor: '#e8e8ff',
            bodyColor: '#a0a0cc',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => `$${item.raw}`
            }
          }
        },
        scales: {
          x: {
            display: options.showAxis !== false,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#6a6a99', maxTicksLimit: 6, font: { family: 'Inter', size: 11 } }
          },
          y: {
            display: options.showAxis !== false,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#6a6a99', callback: v => '$' + v, font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
    return this.charts[canvasId];
  },

  createMulti(canvasId, phonesData) {
    if (this.charts[canvasId]) { this.charts[canvasId].destroy(); }
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const colors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const datasets = phonesData.map((p, i) => ({
      label: p.model,
      data: p.priceHistory.map(h => h.price),
      borderColor: colors[i % colors.length],
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }));
    const labels = phonesData[0].priceHistory.map(h => h.date);
    this.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { position: 'top', labels: { color: '#a0a0cc', font: { family: 'Tajawal', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(26,26,62,0.9)', titleColor: '#e8e8ff', bodyColor: '#a0a0cc', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12 }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6a6a99', maxTicksLimit: 6, font: { family: 'Inter', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6a6a99', callback: v => '$' + v, font: { family: 'Inter', size: 11 } } }
        }
      }
    });
    return this.charts[canvasId];
  },

  filterByTimeRange(priceHistory, range) {
    const now = new Date();
    let cutoff;
    switch (range) {
      case '7d': cutoff = new Date(now - 7 * 86400000); break;
      case '30d': cutoff = new Date(now - 30 * 86400000); break;
      case '90d': cutoff = new Date(now - 90 * 86400000); break;
      default: return priceHistory;
    }
    return priceHistory.filter(p => new Date(p.date) >= cutoff);
  },

  destroyAll() {
    Object.values(this.charts).forEach(c => c.destroy());
    this.charts = {};
  }
};
