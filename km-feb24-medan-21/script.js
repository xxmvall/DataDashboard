document.addEventListener('DOMContentLoaded', async function() {
    const sizeChartCtx = document.getElementById('sizeChart').getContext('2d');
    const monthlySalesChartCtx = document.getElementById('monthlySalesChart').getContext('2d');
    const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
    const revenueCategoryChartCtx = document.getElementById('revenueCategoryChart').getContext('2d');

    const sizeDropdown = document.getElementById('sizeDropdown');
    const monthDropdown = document.getElementById('monthDropdown');
    const categoryRevenueDropdown = document.getElementById('categoryRevenueDropdown');
    const categoryDropdown = document.getElementById('categoryDropdown');

    async function loadJSON(url) {
        const response = await fetch(url);
        return await response.json();
    }

    const revsizeData = await loadJSON('data/datarevsize.json');
    const sizeData = await loadJSON('data/soldbysize.json');
    const monthlySalesData = await loadJSON('data/totalsales.json');
    const categoryData = await loadJSON('data/totalsalesbycategory.json');
    const revenueCategoryData = await loadJSON('data/revenuebycategory.json');
    const customerData = await loadJSON('data/jumlahcustomer.json');

    function populateCustomerCards(data) {
        let totalCustomers = 0;
        data.forEach(item => {
            totalCustomers += Number(item.jumlah_customer);
        });
        const formattedTotalCustomers = totalCustomers.toLocaleString('id-ID');
        document.getElementById('total-customers').textContent = formattedTotalCustomers;
    }
    populateCustomerCards(customerData);

    function populateCategoryTable(data) {
        const tableBody = document.querySelector('#category-table tbody');
        data.forEach(item => {
            const row = document.createElement('tr');
            const categoryCell = document.createElement('td');
            const revenueCell = document.createElement('td');
            categoryCell.textContent = item.category;
            revenueCell.textContent = `$${(Number(item.jumlah_pendapatan) / 1000000).toFixed(2)}K`;
            row.appendChild(categoryCell);
            row.appendChild(revenueCell);
            tableBody.appendChild(row);
        });
    }
    populateCategoryTable(revenueCategoryData);

    function populateSizeTable(data) {
        const tableBody = document.querySelector('#size-table tbody');
        data.forEach(item => {
            const row = document.createElement('tr');
            const sizeCell = document.createElement('td');
            const revenueCell = document.createElement('td');
            sizeCell.textContent = item.size;
            revenueCell.textContent = `$${(Number(item.total_pendapatan) / 1000000).toFixed(2)}K`;
            row.appendChild(sizeCell);
            row.appendChild(revenueCell);
            tableBody.appendChild(row);
        });
    }
    populateSizeTable(revsizeData);

// quantity sold
    function calculateTotalQuantitySold(data) {
        return data.reduce((total, item) => total + parseInt(item.jumlah_yang_terjual, 10), 0);
    }
    const totalQuantitySold = calculateTotalQuantitySold(categoryData);
    const formattedTotalQuantitySold = totalQuantitySold.toLocaleString('id-ID');
    document.getElementById('quantitySold').textContent = formattedTotalQuantitySold;


    //total revenue
    function calculateTotalRevenue(data) {
        return data.reduce((total, item) => total + parseInt(item.total_penjualan, 10), 0);
    }
    const totalRevenue = calculateTotalRevenue(monthlySalesData);
    const formattedTotalRevenue = `$${(totalRevenue / 1000000).toFixed(2)}K`;
    document.getElementById('totalRevenue').textContent = formattedTotalRevenue;


    //top category
    function getTopCategory(data) {
        let topCategory = data[0];
        for (const item of data) {
            if (parseInt(item.jumlah_pendapatan, 10) > parseInt(topCategory.jumlah_pendapatan, 10)) {
                topCategory = item;
            }
        }
        return topCategory.category;
    }

    const topCategory = getTopCategory(revenueCategoryData);
    document.getElementById('topCategorySale').textContent = topCategory;


    //pizza sold by size
    function updateSizeChart(data, selectedSize) {
        if (selectedSize === 'All') {
            const datasets = Object.keys(sizeColors).map(size => {
                const values = new Array(12).fill(0);
                data.filter(item => item.size === size).forEach(item => {
                    const monthIndex = sizeLabels.indexOf(item.bulan);
                    values[monthIndex] += parseInt(item.jumlah_yang_terjual) || 0;
                });
                return {
                    label: size,
                    data: values,
                    borderColor: sizeColors[size].borderColor,
                    backgroundColor: sizeColors[size].backgroundColor,
                    borderWidth: 1
                };
            });
            sizeChart.data.datasets = datasets;
        } else {
            const values = new Array(12).fill(0);
            data.filter(item => item.size === selectedSize).forEach(item => {
                const monthIndex = sizeLabels.indexOf(item.bulan);
                values[monthIndex] += parseInt(item.jumlah_yang_terjual) || 0;
            });
            sizeChart.data.datasets = [{
                label: selectedSize,
                data: values,
                borderColor: sizeColors[selectedSize].borderColor,
                backgroundColor: sizeColors[selectedSize].backgroundColor,
                borderWidth: 1
            }];
        }
        sizeChart.update();
    }

        
        const sizeLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Warna untuk setiap ukuran
        const sizeColors = {
            'S': {
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)'
            },
            'M': {
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)'
            },
            'L': {
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)'
            },
            'XL': {
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            },
            'XXL': {
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)'
            },
            
        };

        // Inisialisasi chart
        const sizeChart = new Chart(sizeChartCtx, {
            type: 'line',
            data: {
                labels: sizeLabels,
                datasets: []
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    sizeDropdown.addEventListener('change', () => {
        const selectedSize = sizeDropdown.value;
        updateSizeChart(sizeData, selectedSize);
    });  

    updateSizeChart(sizeData, 'All');


//total revenue per month
function getMonthName(monthNumber) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    return monthNames[monthNumber - 1];
}

function updateMonthlySalesChart(data, selectedMonth) {
    let filteredData;
    if (selectedMonth === 'All') {
        filteredData = data;
    } else {
        filteredData = data.filter(item => item.bulan === selectedMonth);
    }
    const labels = filteredData.map(item => getMonthName(parseInt(item.bulan)));
    const values = filteredData.map(item => parseInt(item.total_penjualan));

    console.log('Selected Month:', selectedMonth);
    console.log('Filtered Data:', filteredData);
    console.log('Labels:', labels);
    console.log('Values:', values);

    monthlySalesChart.data.labels = labels;
    monthlySalesChart.data.datasets[0].data = values;
    monthlySalesChart.update();
}

const monthlySalesChart = new Chart(monthlySalesChartCtx, {
    type: 'bar',
    data: {
        labels: monthlySalesData.map(item => getMonthName(parseInt(item.bulan))),
        datasets: [{
            label: 'Total Sales',
            data: monthlySalesData.map(item => parseInt(item.total_penjualan)),
            backgroundColor: '#E49BFF',
            borderColor: 'rgb(161, 221, 112)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return `$${(value / 1000).toLocaleString()}K`;
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let value = context.raw;
                        value = `$${(value / 1000).toLocaleString()}K`;
                        return `Total Sales: ${value}`;
                    }
                }
            }
        }
    }
});

monthDropdown.addEventListener('change', () => {
    const selectedMonth = monthDropdown.value;
    updateMonthlySalesChart(monthlySalesData, selectedMonth);
});


//soldbycategory
function filterDataByCategory(data, category) {
    if (category === 'All') {
        return data;
    } else {
        return data.filter(item => item.category === category);
    }
}

function aggregateDataByMonth(data) {
    const result = {};
    data.forEach(item => {
        if (!result[item.bulan]) {
            result[item.bulan] = 0;
        }
        result[item.bulan] += parseInt(item.jumlah_yang_terjual, 10);
    });
    return result;
}

function updateChart(chart, data) {
    const aggregatedData = aggregateDataByMonth(data);
    chart.data.labels = Object.keys(aggregatedData);
    chart.data.datasets[0].data = Object.values(aggregatedData);
    chart.update();
}

const initialData = filterDataByCategory(categoryData, 'All');

const categoryChart = new Chart(categoryChartCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Category Sold',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

updateChart(categoryChart, initialData);

categoryDropdown.addEventListener('change', function() {
    const selectedCategory = categoryDropdown.value;
    const filteredData = filterDataByCategory(categoryData, selectedCategory);
    updateChart(categoryChart, filteredData);
});



//revenuebycategory
function updateRevenueCategoryChart(data, selectedCategory) {
    const filteredData = selectedCategory === 'All' ? data : data.filter(item => item.category === selectedCategory);
    const labels = filteredData.map(item => item.category);
    const values = filteredData.map(item => (item.jumlah_pendapatan / 1000)); // Ubah format ke ribuan

    revenueCategoryChart.data.labels = labels;
    revenueCategoryChart.data.datasets[0].data = values;
    revenueCategoryChart.update();

    }

    const revenueCategoryChart = new Chart(revenueCategoryChartCtx, {
        type: 'bar',
        data: {
            labels: revenueCategoryData.map(item => item.category),
            datasets: [{
                label: 'Revenue',
                data: revenueCategoryData.map(item => item.jumlah_pendapatan),
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return `$${(value / 1000).toLocaleString()}K`;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw;
                            value = `$${(value / 1000).toLocaleString()}K`;
                            return `Total Sales: ${value}`;
                        }
                    }
                }
            }
        }
    });

    categoryRevenueDropdown.addEventListener('change', () => {
        const selectedCategory = categoryRevenueDropdown.value;
        updateRevenueCategoryChart(revenueCategoryData, selectedCategory);
    });
});