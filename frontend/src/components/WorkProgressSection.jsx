import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

export default function WorkProgressSection({ workProgressData, trendsData }) {
	const [showTrendline, setShowTrendline] = useState(false)
	const [hasError, setHasError] = useState(false)

	// Safely extract values with defaults and ensure they're valid numbers
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
	const isValidData = workProgressData && typeof workProgressData === 'object' && !Array.isArray(workProgressData)

	// Initialize with safe defaults
	const totalWorks = isValidData ? Math.max(0, safeNumber(workProgressData?.totalWorksTakenUp, 0)) : 0
	const completedWorks = isValidData ? Math.max(0, safeNumber(workProgressData?.completedWorks, 0)) : 0
	const ongoingWorks = isValidData ? Math.max(0, safeNumber(workProgressData?.ongoingWorks, 0)) : 0
	const percentCategoryB = isValidData ? Math.max(0, Math.min(100, safeNumber(workProgressData?.percentCategoryBWorks, 0))) : 0
	const percentCategoryA = Math.max(0, Math.min(100, 100 - percentCategoryB))

	// Calculate completion percentage - safe division
	let completionPct = 0
	if (totalWorks > 0 && Number.isFinite(completedWorks) && Number.isFinite(totalWorks)) {
		try {
			const ratio = completedWorks / totalWorks
			if (Number.isFinite(ratio) && !isNaN(ratio)) {
				completionPct = Math.max(0, Math.min(100, Math.round(ratio * 100)))
			}
		} catch (error) {
			console.error('Error calculating completion percentage:', error)
			completionPct = 0
		}
	}

	// Donut chart data (Category A vs Category B)
	const donutData = useMemo(() => {
		// Ensure values are valid and sum to 100
		const catA = Math.max(0, Math.min(100, percentCategoryA))
		const catB = Math.max(0, Math.min(100, percentCategoryB))
		const total = catA + catB
		
		if (total === 0) {
			// If no data, show 50-50 split
			return [
				{ name: 'Category A (Labor)', value: 50 },
				{ name: 'Category B (Assets)', value: 50 },
			]
		}
		
		return [
			{ name: 'Category A (Labor)', value: catA },
			{ name: 'Category B (Assets)', value: catB },
		]
	}, [percentCategoryA, percentCategoryB])

	// Progress bar data
	const progressBarData = {
		completed: completedWorks,
		ongoing: ongoingWorks,
		total: totalWorks,
	}

	// Prepare trendline data from trends if available
	const trendlineData = useMemo(() => {
		if (!trendsData || !Array.isArray(trendsData)) return []
		
		// Sort by month order (April to March)
		const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
		const sorted = [...trendsData].sort((a, b) => {
			const monthA = monthOrder.indexOf(a.month || '')
			const monthB = monthOrder.indexOf(b.month || '')
			return monthA === -1 ? 1 : monthB === -1 ? -1 : monthA - monthB
		})

		return sorted.map(item => ({
			month: item.month || '',
			completed: Number(item.completedWorks || 0),
			ongoing: Number(item.ongoingWorks || 0),
		})).filter(item => item.month) // Remove items without month
	}, [trendsData])

	// Handle loading and error states in JSX, not with early returns
	if (!isValidData) {
		return <div className="text-center py-8 text-gray-500">Loading work progress data...</div>
	}

	if (hasError) {
		return (
			<div className="text-center py-8 text-red-500">
				<p>Error loading work progress data. Please refresh the page.</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
					<span>🧑‍🌾</span>
					<span>Work Progress</span>
				</h2>
				<p className="text-gray-600 text-lg">
					Projects started, in-progress and completed under MGNREGA.
				</p>
			</div>

			{/* Two-Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Left Column: Visuals */}
				<div className="space-y-6">
					{/* Donut Chart - Category A vs Category B */}
					<div className="bg-white border rounded-xl p-6 shadow-md">
						<div className="text-lg font-semibold mb-4">Share of Works by Category</div>
						<div className="relative h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={donutData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={90}
										dataKey="value"
										startAngle={90}
										endAngle={-270}
									>
										<Cell fill="#10B981" /> {/* Category A - Green */}
										<Cell fill="#F97316" /> {/* Category B - Orange */}
									</Pie>
									<Tooltip
										formatter={(value, name) => [
											`${value.toFixed(1)}%`,
											name
										]}
									/>
								</PieChart>
							</ResponsiveContainer>
							{/* Center Label */}
							<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
								<div className="text-xs text-gray-600 mb-1">Share of Works (%)</div>
								<div className="text-3xl font-bold text-gray-900">
									{percentCategoryB.toFixed(1)}%
								</div>
								<div className="text-xs text-gray-500 mt-1">Category B</div>
							</div>
						</div>
						<div className="flex justify-center gap-6 mt-4 text-sm">
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 rounded-full bg-green-500"></div>
								<span>Category A (Labor)</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 rounded-full bg-orange-500"></div>
								<span>Category B (Assets)</span>
							</div>
						</div>
					</div>

					{/* Progress Bar - Completed vs Ongoing */}
					<div className="bg-white border rounded-xl p-6 shadow-md">
						<div className="text-lg font-semibold mb-4">Project Completion Status</div>
						<div className="relative">
							<div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden relative">
								{/* Completed portion */}
								<div
									className="h-full bg-green-500 transition-all duration-1000 flex items-center justify-end pr-2"
									style={{ width: `${completionPct}%` }}
								>
									{completionPct >= 20 && (
										<span className="text-white text-sm font-semibold">
											{completionPct}% completed ✅
										</span>
									)}
								</div>
								{/* Ongoing portion */}
								{ongoingWorks > 0 && totalWorks > 0 && (
									<div
										className="h-full bg-yellow-400 transition-all duration-1000 absolute top-0 flex items-center pl-2"
										style={{
											left: `${Math.max(0, Math.min(100, completionPct))}%`,
											width: `${(() => {
												if (totalWorks <= 0) return 0
												const ratio = ongoingWorks / totalWorks
												if (!Number.isFinite(ratio)) return 0
												const ongoingPct = Math.round(ratio * 100)
												return Math.max(0, Math.min(100 - completionPct, ongoingPct))
											})()}%`
										}}
									>
										{completionPct < 20 && ongoingWorks > 0 && (
											<span className="text-gray-800 text-sm font-semibold">
												Ongoing
											</span>
										)}
									</div>
								)}
								{/* Label outside if completed < 20% */}
								{completionPct < 20 && (
									<div className="absolute top-full left-0 mt-2 text-sm text-green-700 font-semibold">
										{completionPct}% completed ✅
									</div>
								)}
							</div>
							{/* Numeric values below */}
							<div className="mt-4 flex justify-between text-sm">
								<div>
									<span className="font-semibold text-green-700">Completed:</span>{' '}
									<span>{completedWorks.toLocaleString()} / {totalWorks.toLocaleString()} works</span>
								</div>
								<div>
									<span className="font-semibold text-yellow-700">Ongoing:</span>{' '}
									<span>{ongoingWorks.toLocaleString()} works</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Summary Cards + Trendline */}
				<div className="space-y-6">
					{/* Summary Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Total Works Taken Up */}
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-lg">
							<div className="text-2xl mb-2">📈</div>
							<div className="text-xs uppercase tracking-wide text-blue-700 mb-1">Total Works Taken Up</div>
							<div className="text-2xl font-bold text-blue-900">{totalWorks.toLocaleString()}</div>
						</div>

						{/* Completed Works */}
						<div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 shadow-lg">
							<div className="text-2xl mb-2">✅</div>
							<div className="text-xs uppercase tracking-wide text-green-700 mb-1">Completed Works</div>
							<div className="text-2xl font-bold text-green-900">{completedWorks.toLocaleString()}</div>
						</div>

						{/* Ongoing Works */}
						<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4 shadow-lg">
							<div className="text-2xl mb-2">🟡</div>
							<div className="text-xs uppercase tracking-wide text-yellow-700 mb-1">Ongoing Works</div>
							<div className="text-2xl font-bold text-yellow-900">{ongoingWorks.toLocaleString()}</div>
						</div>

						{/* % Category B Works */}
						<div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 shadow-lg">
							<div className="text-2xl mb-2">📊</div>
							<div className="text-xs uppercase tracking-wide text-orange-700 mb-1">% Category B Works</div>
							<div className="text-2xl font-bold text-orange-900">{percentCategoryB.toFixed(1)}%</div>
						</div>
					</div>

					{/* Trendline Toggle */}
					<div className="bg-white border rounded-xl p-4 shadow-sm">
						<div className="flex items-center justify-between">
							<div className="text-sm font-semibold text-gray-700">Show Monthly Trendline</div>
							<button
								onClick={() => setShowTrendline(!showTrendline)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									showTrendline ? 'bg-blue-600' : 'bg-gray-300'
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										showTrendline ? 'translate-x-6' : 'translate-x-1'
									}`}
								/>
							</button>
						</div>
					</div>

					{/* Trendline Chart */}
					{showTrendline && trendlineData.length > 0 && (
						<div className="bg-white border rounded-xl p-6 shadow-md">
							<div className="text-lg font-semibold mb-4">Monthly Works Trend</div>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={trendlineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="month"
											tick={{ fontSize: 12, fill: '#666' }}
											interval={Math.max(0, Math.floor(trendlineData.length / 8))}
										/>
										<YAxis tick={{ fontSize: 12, fill: '#666' }} />
										<Tooltip
											contentStyle={{ fontSize: '12px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
											formatter={(value) => value.toLocaleString()}
										/>
										<Legend wrapperStyle={{ paddingTop: '10px' }} />
										<Line
											type="monotone"
											dataKey="completed"
											stroke="#10B981"
											strokeWidth={3}
											dot={{ r: 4 }}
											name="Completed Works"
										/>
										<Line
											type="monotone"
											dataKey="ongoing"
											stroke="#FBBF24"
											strokeWidth={3}
											dot={{ r: 4 }}
											name="Ongoing Works"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
					{showTrendline && trendlineData.length === 0 && (
						<div className="bg-white border rounded-xl p-6 shadow-md text-center text-gray-500">
							Monthly trend data not available
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
				<p className="text-gray-700 text-base leading-relaxed text-center">
					Each project under MGNREGA brings work and infrastructure to our communities. This section tracks how many projects have begun, are in progress, and completed.
				</p>
			</div>
		</div>
	)
}

