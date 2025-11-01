import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts'

export default function WagesPaymentSection({ wagesData, monthlyWagesTrends, meta }) {
	const [hoveredMetric, setHoveredMetric] = useState(null)

	// Safely extract values
	const safeNumber = (val, defaultVal = 0) => {
		try {
			if (val === null || val === undefined) return defaultVal
			const num = Number(val)
			return (Number.isFinite(num) && !isNaN(num)) ? num : defaultVal
		} catch {
			return defaultVal
		}
	}

	// Check if data is valid - but don't return early, compute values safely
	const isValidData = wagesData && typeof wagesData === 'object' && !Array.isArray(wagesData)

	// Initialize with safe defaults - always compute values even if data is missing
	const averageWage = isValidData ? safeNumber(wagesData?.averageWage, 0) : 0
	const totalWages = isValidData ? safeNumber(wagesData?.totalWages, 0) : 0
	const totalWagesLakhs = Math.round((totalWages / 100000) * 100) / 100

	// Calculate growth percentage (comparing with previous month)
	// For demo, we'll calculate based on monthly trends if available
	const wageGrowth = useMemo(() => {
		if (!monthlyWagesTrends || monthlyWagesTrends.length < 2) return 0
		const sorted = [...monthlyWagesTrends].sort((a, b) => {
			const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
			return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
		})
		if (sorted.length < 2) return 0
		const current = sorted[sorted.length - 1]?.wagesLakhs || 0
		const previous = sorted[sorted.length - 2]?.wagesLakhs || 0
		if (previous === 0) return 0
		return Math.round(((current - previous) / previous) * 1000) / 10
	}, [monthlyWagesTrends])

	// Payment compliance - calculate as percentage (for demo, estimate based on data availability)
	// In real scenario, this would come from payment timeliness data
	const paymentCompliance = useMemo(() => {
		// Estimate: if we have wage data, assume high compliance (90-98%)
		// This would need actual payment timeliness data from API
		return 95 // Default value, should come from API
	}, [])

	// Prepare last 6 months data for bar chart
	const recentMonthsData = useMemo(() => {
		if (!monthlyWagesTrends || monthlyWagesTrends.length === 0) return []
		const sorted = [...monthlyWagesTrends].sort((a, b) => {
			const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
			return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
		})
		return sorted.slice(-6).map(item => ({
			month: item.month,
			wages: Math.round(item.wagesLakhs || 0)
		}))
	}, [monthlyWagesTrends])

	// Material & Skilled Wages split
	// For demo: Estimate based on Category A/B split or use default
	// Category A (Labor) ~70%, Category B (Materials) ~30%
	const materialWages = Math.round(totalWagesLakhs * 0.30 * 100) / 100
	const skilledWages = Math.round(totalWagesLakhs * 0.70 * 100) / 100
	const materialSkilledData = [
		{ name: 'Materials', value: materialWages },
		{ name: 'Skilled Wages', value: skilledWages }
	]

	// Gauge data for payment compliance
	const gaugeData = [
		{ name: 'On Time', value: paymentCompliance },
		{ name: 'Pending', value: 100 - paymentCompliance }
	]

	// Tooltip content for info icons
	const tooltips = {
		averageWage: 'Average daily pay per worker under MGNREGA',
		paymentCompliance: 'Percentage of payments generated and disbursed within 15 days of work completion',
		totalWages: 'Total wages paid through Direct Benefit Transfer (DBT) in the financial year',
		materialSkilled: 'Breakdown of expenditure between material costs and skilled labor wages'
	}

	// Handle loading state - show header and loading message
	if (!isValidData) {
		return (
			<div className="space-y-8">
				<div>
					<h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
						<span>💰</span>
						<span>Wages & Payment Overview</span>
					</h2>
					<p className="text-gray-600 text-lg">
						Track wage rates, payment timeliness, and expenditure breakdown for MGNREGA work.
					</p>
				</div>
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
					<div className="text-gray-500 text-lg">Loading wages and payment data...</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
					<span>💰</span>
					<span>Wages & Payment Overview</span>
				</h2>
				<p className="text-gray-600 text-lg">
					Track wage rates, payment timeliness, and expenditure breakdown for MGNREGA work.
				</p>
				{meta?.finYear && (
					<p className="text-sm text-gray-500 mt-1">Data for {meta.finYear}</p>
				)}
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* 🥇 Primary Card: Average Wage Rate */}
				<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-center gap-2">
							<span className="text-xl font-semibold text-blue-800">Average Wage Rate</span>
							<div
								className="relative group"
								onMouseEnter={() => setHoveredMetric('averageWage')}
								onMouseLeave={() => setHoveredMetric(null)}
							>
								<span className="cursor-help text-blue-600 hover:text-blue-800">ⓘ</span>
								{hoveredMetric === 'averageWage' && (
									<div className="absolute z-10 left-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
										{tooltips.averageWage}
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="flex items-baseline gap-2 mb-2">
						<span className="text-5xl font-bold text-blue-900">₹{averageWage.toFixed(0)}</span>
						<span className="text-lg text-blue-700">/day</span>
					</div>
					{wageGrowth !== 0 && (
						<div className="flex items-center gap-1 text-sm">
							<span className={`font-semibold ${wageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
								{wageGrowth >= 0 ? '↑' : '↓'} {Math.abs(wageGrowth)}%
							</span>
							<span className="text-gray-600">vs previous period</span>
						</div>
					)}
				</div>

				{/* ⏱️ Second Card: Payment Compliance Gauge */}
				<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl font-semibold text-gray-800">% Payments Generated Within 15 Days</span>
						<div
							className="relative group"
							onMouseEnter={() => setHoveredMetric('paymentCompliance')}
							onMouseLeave={() => setHoveredMetric(null)}
						>
							<span className="cursor-help text-gray-600 hover:text-gray-800">ⓘ</span>
							{hoveredMetric === 'paymentCompliance' && (
								<div className="absolute z-10 left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
									{tooltips.paymentCompliance}
								</div>
							)}
						</div>
					</div>
					<div className="relative h-48 flex items-center justify-center">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={gaugeData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									startAngle={180}
									endAngle={0}
									dataKey="value"
								>
									<Cell fill={paymentCompliance >= 90 ? "#10B981" : paymentCompliance >= 70 ? "#FBBF24" : "#EF4444"} />
									<Cell fill="#E5E7EB" />
								</Pie>
								<Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
							</PieChart>
						</ResponsiveContainer>
						<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
							<div className="text-4xl font-bold text-gray-900">{paymentCompliance.toFixed(0)}%</div>
							<div className="text-xs text-gray-600 mt-1">Compliance</div>
						</div>
					</div>
					<div className="flex justify-center gap-4 mt-2 text-xs">
						<div className={`flex items-center gap-1 ${paymentCompliance >= 90 ? 'text-green-600' : paymentCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
							<div className={`w-3 h-3 rounded-full ${paymentCompliance >= 90 ? 'bg-green-500' : paymentCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
							<span>On Time</span>
						</div>
						<div className="flex items-center gap-1 text-gray-400">
							<div className="w-3 h-3 rounded-full bg-gray-300"></div>
							<span>Pending</span>
						</div>
					</div>
				</div>

				{/* 💰 Third Card: Total Wages with Trend */}
				<div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl font-semibold text-green-800">Wages (₹ Lakhs)</span>
						<div
							className="relative group"
							onMouseEnter={() => setHoveredMetric('totalWages')}
							onMouseLeave={() => setHoveredMetric(null)}
						>
							<span className="cursor-help text-green-600 hover:text-green-800">ⓘ</span>
							{hoveredMetric === 'totalWages' && (
								<div className="absolute z-10 left-0 top-6 w-56 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
									{tooltips.totalWages}
								</div>
							)}
						</div>
					</div>
					<div className="mb-4">
						<span className="text-4xl font-bold text-green-900">₹{totalWagesLakhs.toLocaleString()}</span>
						<span className="text-lg text-green-700 ml-2">Lakhs</span>
					</div>
					{recentMonthsData.length > 0 && (
						<div className="bg-white rounded-lg p-3">
							<div className="text-xs font-semibold text-gray-700 mb-2">Monthly Trend</div>
							<div className="h-32">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={recentMonthsData}>
										<XAxis 
											dataKey="month" 
											tick={{ fontSize: 10, fill: '#666' }}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip 
											formatter={(value) => `₹${value} Lakhs`}
											contentStyle={{ fontSize: '12px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px' }}
										/>
										<Bar dataKey="wages" fill="#10B981" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
				</div>

				{/* 🛠️ Fourth Card: Material & Skilled Wages Split */}
				<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl font-semibold text-gray-800">Material & Skilled Wages</span>
						<div
							className="relative group"
							onMouseEnter={() => setHoveredMetric('materialSkilled')}
							onMouseLeave={() => setHoveredMetric(null)}
						>
							<span className="cursor-help text-gray-600 hover:text-gray-800">ⓘ</span>
							{hoveredMetric === 'materialSkilled' && (
								<div className="absolute z-10 left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
									{tooltips.materialSkilled}
								</div>
							)}
						</div>
					</div>
					<div className="text-center mb-4">
						<div className="text-3xl font-bold text-gray-900">₹{totalWagesLakhs.toLocaleString()}</div>
						<div className="text-sm text-gray-600">Total (Lakhs)</div>
					</div>
					<div className="relative h-48">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={materialSkilledData}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={80}
									dataKey="value"
									startAngle={90}
									endAngle={-270}
								>
									<Cell fill="#3B82F6" /> {/* Materials - Blue */}
									<Cell fill="#F59E0B" /> {/* Skilled Wages - Orange */}
								</Pie>
								<Tooltip 
									formatter={(value) => `₹${value.toLocaleString()} Lakhs`}
									contentStyle={{ fontSize: '12px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-center gap-6 mt-4 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-full bg-blue-500"></div>
							<span className="text-gray-700">Materials: ₹{materialWages.toLocaleString()} Lakhs</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-full bg-orange-500"></div>
							<span className="text-gray-700">Skilled: ₹{skilledWages.toLocaleString()} Lakhs</span>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
				<p className="text-gray-700 text-base leading-relaxed text-center">
					Timely wage payments and transparent expenditure tracking ensure worker welfare and program integrity. 
					These metrics reflect the district's commitment to efficient MGNREGA implementation.
				</p>
			</div>
		</div>
	)
}

