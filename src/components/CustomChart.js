import { useRef } from "react";
// MUI
import Alert from "@mui/material/Alert";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  BarElement,
} from "chart.js";
import { Pie, Line, Bar, Chart } from "react-chartjs-2";
import { WordCloudController, WordElement } from "chartjs-chart-wordcloud";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  BarElement,
  WordCloudController,
  WordElement
);

function getRandomColor(length, solid = false) {
  var colors = [];
  for (var i = 0; i < length; i++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = solid ? 1 : 0.6;
    const c = "rgb(" + r + ", " + g + ", " + b + ", " + a + ")";
    colors.push(c);
  }
  return colors;
}

const pieData = (labels, data) => {
  const backgroundColor = getRandomColor(labels.length);
  const borderColor = backgroundColor.map((item) => {
    return item.replace(0.6, 1);
  });
  return {
    labels: labels,
    datasets: [
      {
        label: "Jumlah",
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };
};

export const CustomAreaChart = ({ data, loading }) => {
  if (loading) return <></>;
  if (!loading && data.length === 0)
    return <Alert severity="info">Data Tidak Ditemukan</Alert>;

  const labels = data.map((a) => a.label);
  const values = data.map((a) => a.value);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Jumlah Permohonan",
      },
    },
  };

  const datas = {
    labels,
    datasets: [
      {
        fill: true,
        data: values,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return <Line options={options} data={datas} height={80} />;
};

export const CustomPieChart = ({ data, loading }) => {
  if (loading) return <></>;
  if (!loading && data.length === 0)
    return <Alert severity="info">Data Tidak Ditemukan</Alert>;

  const labels = data.map((a) => a.label);
  const values = data.map((a) => a.value);
  return (
    <Pie
      width="100%"
      height={300}
      options={{ maintainAspectRatio: false }}
      data={pieData(labels, values)}
    />
  );
};

export const CustomBarChart = ({ data, loading }) => {
  if (loading) return <></>;
  if (!loading && data.length === 0)
    return <Alert severity="info">Data Tidak Ditemukan</Alert>;

  const labels = data.map((a) => a.label);
  const values = data.map((a) => a.value);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  const datas = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: values,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
  return <Bar options={options} data={datas} height={100} />;
};

export const CustomWordCloud = ({ data, loading }) => {
  const chartRef = useRef(null);
  if (loading) return <></>;
  if (!loading && data.length === 0)
    return <Alert severity="info">Data Tidak Ditemukan</Alert>;

  const labels = data.map((a) => a.text);
  const values = data.map((a) => a.value);

  const datas = {
    labels: labels,
    datasets: [
      {
        label: "",
        data: values,
      },
    ],
  };

  return (
    <Chart
      height={300}
      ref={chartRef}
      type="wordCloud"
      data={datas}
      options={{
        title: {
          display: false,
          text: "Chart.js Word Cloud",
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
};

// JAJAL SETELAH UPDATE PACKAGE
