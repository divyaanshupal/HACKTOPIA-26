import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Vibrant color palettes
const COLORS = {
    primary: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    status: {
        pending: '#f59e0b',
        approved: '#10b981',
        rejected: '#ef4444',
        closed: '#6b7280',
    },
    gradient: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(217, 70, 239, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(244, 114, 182, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 211, 238, 0.8)',
        'rgba(45, 212, 191, 0.8)',
    ],
    gradientBorder: [
        'rgba(99, 102, 241, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(217, 70, 239, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(244, 114, 182, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(34, 211, 238, 1)',
        'rgba(45, 212, 191, 1)',
    ],
};

// Status Distribution Pie Chart
export function StatusPieChart({ files }) {
    const statusCounts = files.reduce((acc, file) => {
        const status = file.status || 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                data: Object.values(statusCounts),
                backgroundColor: [
                    COLORS.status.pending,
                    COLORS.status.approved,
                    COLORS.status.rejected,
                    COLORS.status.closed,
                ],
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12, weight: 'bold' },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutQuart',
        },
    };

    return <Doughnut data={data} options={options} />;
}

// Office-wise File Distribution Bar Chart
export function OfficeBarChart({ files }) {
    const officeCounts = files.reduce((acc, file) => {
        const office = file.currentOffice || 'Unassigned';
        acc[office] = (acc[office] || 0) + 1;
        return acc;
    }, {});

    const sortedOffices = Object.entries(officeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const data = {
        labels: sortedOffices.map(([name]) => name.length > 15 ? name.slice(0, 12) + '...' : name),
        datasets: [
            {
                label: 'Files',
                data: sortedOffices.map(([, count]) => count),
                backgroundColor: COLORS.gradient,
                borderColor: COLORS.gradientBorder,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'bold' } },
            },
            y: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
            },
        },
        animation: {
            duration: 1200,
            easing: 'easeOutQuart',
        },
    };

    return <Bar data={data} options={options} />;
}

// Monthly Activity Line Chart
export function ActivityLineChart({ files }) {
    const monthCounts = files.reduce((acc, file) => {
        const date = new Date(file.creationDate || file.dateOfLastForward);
        const month = date.toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = months.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1);

    const data = {
        labels: last6Months,
        datasets: [
            {
                label: 'Files Created',
                data: last6Months.map(month => monthCounts[month] || 0),
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: 'rgba(99, 102, 241, 1)',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'bold' } },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { stepSize: 1 },
            },
        },
        animation: {
            duration: 1500,
            easing: 'easeOutQuart',
        },
    };

    return <Line data={data} options={options} />;
}

// Delayed vs On-Time Pie Chart
export function DelayedPieChart({ files }) {
    const delayed = files.filter(f => f.delayed).length;
    const onTime = files.length - delayed;

    const data = {
        labels: ['On Time', 'Delayed'],
        datasets: [
            {
                data: [onTime, delayed],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                borderColor: ['#10b981', '#ef4444'],
                borderWidth: 3,
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12, weight: 'bold' },
                },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
        },
    };

    return <Pie data={data} options={options} />;
}

// Branch-wise Distribution
export function BranchBarChart({ files }) {
    const branchCounts = files.reduce((acc, file) => {
        const branch = file.currentBranch || 'Unassigned';
        acc[branch] = (acc[branch] || 0) + 1;
        return acc;
    }, {});

    const sortedBranches = Object.entries(branchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const data = {
        labels: sortedBranches.map(([name]) => name.length > 12 ? name.slice(0, 10) + '...' : name),
        datasets: [
            {
                label: 'Files',
                data: sortedBranches.map(([, count]) => count),
                backgroundColor: COLORS.gradient.slice(0, 6),
                borderColor: COLORS.gradientBorder.slice(0, 6),
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { stepSize: 1 },
            },
        },
        animation: {
            duration: 1200,
            easing: 'easeOutQuart',
        },
    };

    return <Bar data={data} options={options} />;
}

// Stat Card Component
export function StatCard({ title, value, icon, color, subValue }) {
    return (
        <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-5 text-white transform hover:scale-105 transition-all duration-300`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm opacity-90 font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {subValue && <p className="text-xs mt-2 opacity-80">{subValue}</p>}
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}
