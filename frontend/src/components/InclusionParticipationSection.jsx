import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function InclusionParticipationSection({ inclusionData }) {
	const [showWomen, setShowWomen] = useState(true)
	const [showSC, setShowSC] = useState(true)
	const [showST, setShowST] = useState(true)
	const [showDifferentlyAbled, setShowDifferentlyAbled] = useState(true)

	// Process and clean monthly trends data to avoid duplicate months and ensure proper ordering
	const processedMonthlyData = useMemo(() => {
		if (!inclusionData?.monthlyTrends || !Array.isArray(inclusionData.monthlyTrends)) {
			return []
		}

		// Financial year month order (April to March)
		const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
		
		// Group by month and sum values if there are duplicates
		const monthMap = new Map()
		
		inclusionData.monthlyTrends.forEach(item => {
			const month = item.month || 'Unknown'
			if (!monthMap.has(month)) {
				monthMap.set(month, {
					month: month,
					women: 0,
					sc: 0,
					st: 0,
					differentlyAbled: 0
				})
			}
			const existing = monthMap.get(month)
			existing.women += Number(item.women || 0)
			existing.sc += Number(item.sc || 0)
			existing.st += Number(item.st || 0)
			existing.differentlyAbled += Number(item.differentlyAbled || 0)
		})

		// Convert to array and sort by financial year order
		const sorted = Array.from(monthMap.values()).sort((a, b) => {
			const indexA = monthOrder.indexOf(a.month)
			const indexB = monthOrder.indexOf(b.month)
			return indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB
		})

		// Calculate interval for x-axis labels to avoid crowding
		// If more than 6 months, show every other label for better readability
		const interval = sorted.length > 6 ? 1 : 0
		
		return { data: sorted, interval }
	}, [inclusionData])

	if (!inclusionData) {
		return (
			<div className="text-center py-12">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
				<div className="text-gray-500 text-lg">Loading inclusion data...</div>
			</div>
		)
	}

	const chartData = processedMonthlyData.data || []
	const xAxisInterval = processedMonthlyData.interval || 0

	return (
		<div className="space-y-8">
			{/* Heading Section */}
			<div>
				<h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
					<span>👫</span>
					<span>Inclusion & Participation Overview</span>
				</h2>
				<p className="text-gray-600 text-lg">
					Track monthly participation trends for women, SC/ST, and differently-abled individuals in MGNREGA work.
				</p>
			</div>

			{/* Filter Controls - Toggle Buttons */}
			<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
				<div className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
					<span>🔍</span>
					<span>Toggle Categories to View on Chart</span>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<button
						onClick={() => setShowWomen(!showWomen)}
						className={`px-4 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
							showWomen
								? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						<div className="text-2xl mb-1">👩‍🌾</div>
						<div className="text-sm">Women</div>
					</button>
					<button
						onClick={() => setShowSC(!showSC)}
						className={`px-4 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
							showSC
								? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						<div className="text-2xl mb-1">🧑🏾‍🌾</div>
						<div className="text-sm">SC</div>
					</button>
					<button
						onClick={() => setShowST(!showST)}
						className={`px-4 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
							showST
								? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						<div className="text-2xl mb-1">👨🏽‍🌾</div>
						<div className="text-sm">ST</div>
					</button>
					<button
						onClick={() => setShowDifferentlyAbled(!showDifferentlyAbled)}
						className={`px-4 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
							showDifferentlyAbled
								? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						<div className="text-2xl mb-1">♿</div>
						<div className="text-sm">Differently Abled</div>
					</button>
				</div>
			</div>

			{/* Line Chart */}
			<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-xl font-bold text-gray-900 mb-1">Monthly Participation Trends</h3>
						<p className="text-sm text-gray-600">Financial Year: {inclusionData.finYear || 'N/A'}</p>
					</div>
					<div className="text-sm text-gray-500">
						{chartData.length} {chartData.length === 1 ? 'Month' : 'Months'}
					</div>
				</div>
				{chartData.length > 0 ? (
					<div className="h-96 lg:h-[450px]">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart 
								data={chartData} 
								margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis 
									dataKey="month" 
									tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }}
									angle={-45}
									textAnchor="end"
									height={80}
									interval={xAxisInterval}
									stroke="#6b7280"
								/>
								<YAxis 
									tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }}
									stroke="#6b7280"
									label={{ 
										value: 'Persondays', 
										angle: -90, 
										position: 'insideLeft', 
										style: { textAnchor: 'middle', fill: '#374151', fontSize: '14px', fontWeight: 600 } 
									}}
									tickFormatter={(value) => {
										if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
										if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
										return value.toString()
									}}
								/>
								<Tooltip
									contentStyle={{ 
										fontSize: '14px', 
										backgroundColor: '#fff', 
										border: '2px solid #e5e7eb', 
										borderRadius: '12px',
										boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
										padding: '12px'
									}}
									formatter={(value, name) => {
										const formattedValue = Number(value).toLocaleString('en-IN')
										const categoryNames = {
											'women': '👩‍🌾 Women',
											'sc': '🧑🏾‍🌾 SC',
											'st': '👨🏽‍🌾 ST',
											'differentlyAbled': '♿ Differently Abled'
										}
										return [formattedValue, categoryNames[name] || name]
									}}
									labelStyle={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}
								/>
								<Legend 
									wrapperStyle={{ paddingTop: '20px' }}
									iconType="line"
									formatter={(value) => {
										const categoryNames = {
											'👩‍🌾 Women': 'Women',
											'🧑🏾‍🌾 SC': 'SC',
											'👨🏽‍🌾 ST': 'ST',
											'♿ Differently Abled': 'Differently Abled'
										}
										return categoryNames[value] || value
									}}
								/>
								{showWomen && (
									<Line 
										type="monotone" 
										dataKey="women" 
										stroke="#ec4899" 
										strokeWidth={3} 
										dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} 
										activeDot={{ r: 8 }}
										name="👩‍🌾 Women"
									/>
								)}
								{showSC && (
									<Line 
										type="monotone" 
										dataKey="sc" 
										stroke="#10b981" 
										strokeWidth={3} 
										dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
										activeDot={{ r: 8 }}
										name="🧑🏾‍🌾 SC"
									/>
								)}
								{showST && (
									<Line 
										type="monotone" 
										dataKey="st" 
										stroke="#3b82f6" 
										strokeWidth={3} 
										dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
										activeDot={{ r: 8 }}
										name="👨🏽‍🌾 ST"
									/>
								)}
								{showDifferentlyAbled && (
									<Line 
										type="monotone" 
										dataKey="differentlyAbled" 
										stroke="#f97316" 
										strokeWidth={3} 
										dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} 
										activeDot={{ r: 8 }}
										name="♿ Differently Abled"
									/>
								)}
							</LineChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="h-96 flex items-center justify-center text-gray-500">
						<div className="text-center">
							<div className="text-4xl mb-2">📊</div>
							<p>No monthly trend data available</p>
						</div>
					</div>
				)}
			</div>

			{/* Summary Cards */}
			<div>
				<div className="flex items-center gap-2 mb-6">
					<h3 className="text-xl font-bold text-gray-900">Total Yearly Participation Summary</h3>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Women Card */}
					<div className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 border-2 border-pink-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
						<div className="flex items-center justify-between mb-3">
							<div className="text-4xl">👩‍🌾</div>
							<div className="text-xs bg-pink-200 px-2 py-1 rounded-full text-pink-800 font-semibold">WOMEN</div>
						</div>
						<div className="text-sm uppercase tracking-wide text-pink-700 mb-2 font-semibold">Total Persondays</div>
						<div className="text-3xl font-bold text-pink-900 mb-1">{inclusionData.totals?.women?.toLocaleString('en-IN') || 0}</div>
						<div className="text-xs text-pink-600 mt-2">
							{inclusionData.totals && (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled) > 0
								? `${Math.round((inclusionData.totals.women / (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled)) * 100)}% of total`
								: '0% of total'}
						</div>
					</div>

					{/* SC Card */}
					<div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-2 border-green-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
						<div className="flex items-center justify-between mb-3">
							<div className="text-4xl">🧑🏾‍🌾</div>
							<div className="text-xs bg-green-200 px-2 py-1 rounded-full text-green-800 font-semibold">SC</div>
						</div>
						<div className="text-sm uppercase tracking-wide text-green-700 mb-2 font-semibold">Total Persondays</div>
						<div className="text-3xl font-bold text-green-900 mb-1">{inclusionData.totals?.sc?.toLocaleString('en-IN') || 0}</div>
						<div className="text-xs text-green-600 mt-2">
							{inclusionData.totals && (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled) > 0
								? `${Math.round((inclusionData.totals.sc / (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled)) * 100)}% of total`
								: '0% of total'}
						</div>
					</div>

					{/* ST Card */}
					<div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-2 border-blue-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
						<div className="flex items-center justify-between mb-3">
							<div className="text-4xl">👨🏽‍🌾</div>
							<div className="text-xs bg-blue-200 px-2 py-1 rounded-full text-blue-800 font-semibold">ST</div>
						</div>
						<div className="text-sm uppercase tracking-wide text-blue-700 mb-2 font-semibold">Total Persondays</div>
						<div className="text-3xl font-bold text-blue-900 mb-1">{inclusionData.totals?.st?.toLocaleString('en-IN') || 0}</div>
						<div className="text-xs text-blue-600 mt-2">
							{inclusionData.totals && (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled) > 0
								? `${Math.round((inclusionData.totals.st / (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled)) * 100)}% of total`
								: '0% of total'}
						</div>
					</div>

					{/* Differently Abled Card */}
					<div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-2 border-orange-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
						<div className="flex items-center justify-between mb-3">
							<div className="text-4xl">♿</div>
							<div className="text-xs bg-orange-200 px-2 py-1 rounded-full text-orange-800 font-semibold">DIFFERENTLY ABLED</div>
						</div>
						<div className="text-sm uppercase tracking-wide text-orange-700 mb-2 font-semibold">Total Persondays</div>
						<div className="text-3xl font-bold text-orange-900 mb-1">{inclusionData.totals?.differentlyAbled?.toLocaleString('en-IN') || 0}</div>
						<div className="text-xs text-orange-600 mt-2">
							{inclusionData.totals && (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled) > 0
								? `${Math.round((inclusionData.totals.differentlyAbled / (inclusionData.totals.women + inclusionData.totals.sc + inclusionData.totals.st + inclusionData.totals.differentlyAbled)) * 100)}% of total`
								: '0% of total'}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

