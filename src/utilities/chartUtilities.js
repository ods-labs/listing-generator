import Chart from "chart.js/auto";

const createChart = (elementId, resagg, title, axex) => {
    let labels = [];
    let values = [];
    for (const dataObj of resagg.aggregations) {
        labels.push(dataObj[axex]);
        values.push(parseInt(dataObj.count));
    }
    // console.log(labels);
    // console.log(values);
    // create the chart
    const ctx = document.getElementById(elementId).getContext("2d");

    let myChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(153, 102, 255, 0.6)",
                        "rgba(255, 159, 64, 0.6)",
                    ],
                    borderWidth: 1,
                }, ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })
        // console.log(myChart);
    return myChart;
}

const updateChart = (myChart, resagg, axex) => {
    let labels = [];
    let values = [];
    for (const dataObj of resagg.aggregations) {
        labels.push(dataObj[axex]);
        values.push(parseInt(dataObj.count));
    }
    myChart.data.datasets[0].data = values;
    myChart.data.labels = labels;
    myChart.update();
}

export default { createChart, updateChart }