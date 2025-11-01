import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/client'

export default function CompareDistrictsSection({ selectedYear }) {
	const [districts, setDistricts] = useState([])
	const [district1, setDistrict1] = useState('')
	const [district2, setDistrict2] = useState('')
	const [data1, setData1] = useState(null)
	const [data2, setData2] = useState(null)
	const [loading, setLoading] = useState(false)
	const [loadingDistricts, setLoadingDistricts] = useState(false)
	const [error, setError] = useState('')
	const [selectedParameter, setSelectedParameter] = useState('wages')

	// Fetch districts list
	useEffect(() => {
		async function loadDistricts() {
			setLoadingDistricts(true)
			try {
				const res = await api.get(`/api/districts?fin_year=${selectedYear || '2024-2025'}`)
				setDistricts(res.data?.districts || [])
			} catch (e) {
				console.error('Failed to load districts:', e)
				setError('Failed to load districts list')
			} finally {
				setLoadingDistricts(false)
			}
		}
		loadDistricts()
	}, [selectedYear])

	// Fetch data for both districts when selected
	useEffect(() => {
		async function loadData() {
			if (!district1 || !district2 || !selectedYear) return
			
			setLoading(true)
			setError('')
			try {
				const [res1, res2] = await Promise.all([
					api.get(`/api/data/${encodeURIComponent(district1)}?fin_year=${selectedYear}`),
					api.get(`/api/data/${encodeURIComponent(district2)}?fin_year=${selectedYear}`)
				])
				setData1(res1.data?.data)
				setData2(res2.data?.data)
			} catch (e) {
				console.error('Failed to load district data:', e)
				setError('Failed to load district comparison data')
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [district1, district2, selectedYear])

	// Prepare monthly comparison data based on selected parameter
	const comparisonData = useMemo(() => {
		if (!data1 || !data2) return []

		// Get monthly trends from both districts
		const trends1 = data1.monthlyWagesTrends || []
		const trends2 = data2.monthlyWagesTrends || []

		// Create a map to combine data by month
		const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
		
		const monthMap = new Map()
		
		// Process district 1 data
		trends1.forEach(item => {
			const month = item.month
			if (!monthMap.has(month)) {
				monthMap.set(month, { month, district1: 0, district2: 0 })
			}
			if (selectedParameter === 'wages') {
				monthMap.get(month).district1 = item.wagesLakhs || 0
			}
		})

		// Process district 2 data
		trends2.forEach(item => {
			const month = item.month
			if (!monthMap.has(month)) {
				monthMap.set(month, { month, district1: 0, district2: 0 })
			}
			if (selectedParameter === 'wages') {
				monthMap.get(month).district2 = item.wagesLakhs || 0
			}
		})

		// Convert to array and sort by financial year order
		const result = Array.from(monthMap.values()).sort((a, b) => {
			return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
		})

		return result
	}, [data1, data2, selectedParameter])

	// Get works data for comparison
	const worksComparisonData = useMemo(() => {
		if (!data1 || !data2) return []

		const works1 = data1.monthlyWorksTrends || []
		const works2 = data2.monthlyWorksTrends || []
		const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
		
		const monthMap = new Map()

		works1.forEach(item => {
			const month = item.month
			if (!monthMap.has(month)) {
				monthMap.set(month, { month, district1Completed: 0, district1Ongoing: 0, district2Completed: 0, district2Ongoing: 0 })
			}
			monthMap.get(month).district1Completed = item.completedWorks || 0
			monthMap.get(month).district1Ongoing = item.ongoingWorks || 0
		})

		works2.forEach(item => {
			const month = item.month
			if (!monthMap.has(month)) {
				monthMap.set(month, { month, district1Completed: 0, district1Ongoing: 0, district2Completed: 0, district2Ongoing: 0 })
			}
			monthMap.get(month).district2Completed = item.completedWorks || 0
			monthMap.get(month).district2Ongoing = item.ongoingWorks || 0
		})

		return Array.from(monthMap.values()).sort((a, b) => {
			return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
		})
	}, [data1, data2])

	// Get summary comparison
	const summaryComparison = useMemo(() => {
		if (!data1 || !data2) return null

		return {
			wages: {
				district1: data1.wages?.totalWages || 0,
				district2: data2.wages?.totalWages || 0,
				label: 'Total Wages (₹)'
			},
			averageWage: {
				district1: data1.wages?.averageWage || 0,
				district2: data2.wages?.averageWage || 0,
				label: 'Average Wage (₹/Day)'
			},
			households: {
				district1: data1.employment?.totalHouseholds || 0,
				district2: data2.employment?.totalHouseholds || 0,
				label: 'Households Worked'
			},
			individuals: {
				district1: data1.employment?.totalIndividuals || 0,
				district2: data2.employment?.totalIndividuals || 0,
				label: 'Individuals Worked'
			},
			completedWorks: {
				district1: data1.workProgress?.completedWorks || 0,
				district2: data2.workProgress?.completedWorks || 0,
				label: 'Completed Works'
			},
			ongoingWorks: {
				district1: data1.workProgress?.ongoingWorks || 0,
				district2: data2.workProgress?.ongoingWorks || 0,
				label: 'Ongoing Works'
			}
		}
	}, [data1, data2])

	// Parameter options
	const parameters = [
		{ value: 'wages', label: 'Wages (₹ Lakhs)', color1: '#3B82F6', color2: '#10B981' },
		{ value: 'completedWorks', label: 'Completed Works', color1: '#3B82F6', color2: '#10B981' },
		{ value: 'ongoingWorks', label: 'Ongoing Works', color1: '#3B82F6', color2: '#10B981' }
	]

	const currentParam = parameters.find(p => p.value === selectedParameter) || parameters[0]

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
					<span>⚖️</span>
					<span>Compare Districts</span>
				</h2>
				<p className="text-gray-600 text-lg">
					Compare two districts across various parameters and view month-wise trends.
				</p>
				{selectedYear && (
					<p className="text-sm text-gray-500 mt-1">Financial Year: {selectedYear}</p>
				)}
			</div>

			{/* Selection Controls */}
			<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					{/* District 1 Selector */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Select District 1
						</label>
						<select
							className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
							value={district1}
							onChange={(e) => setDistrict1(e.target.value)}
							disabled={loadingDistricts}
						>
							<option value="">{loadingDistricts ? 'Loading...' : 'Choose District 1'}</option>
							{districts
								.filter(d => d !== district2)
								.map(d => (
									<option key={d} value={d}>{d}</option>
								))}
						</select>
					</div>

					{/* District 2 Selector */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Select District 2
						</label>
						<select
							className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
							value={district2}
							onChange={(e) => setDistrict2(e.target.value)}
							disabled={loadingDistricts}
						>
							<option value="">{loadingDistricts ? 'Loading...' : 'Choose District 2'}</option>
							{districts
								.filter(d => d !== district1)
								.map(d => (
									<option key={d} value={d}>{d}</option>
								))}
						</select>
					</div>

					{/* Parameter Selector */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Compare Parameter
						</label>
						<select
							className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
							value={selectedParameter}
							onChange={(e) => setSelectedParameter(e.target.value)}
							disabled={!district1 || !district2}
						>
							{parameters.map(param => (
								<option key={param.value} value={param.value}>{param.label}</option>
							))}
						</select>
					</div>
				</div>

				{error && (
					<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}
			</div>

			{/* Loading State */}
			{loading && (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
					<div className="text-gray-500 text-lg">Loading comparison data...</div>
				</div>
			)}

			{/* Comparison Charts */}
			{district1 && district2 && !loading && data1 && data2 && (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{summaryComparison && Object.entries(summaryComparison).slice(0, 6).map(([key, value]) => (
							<div key={key} className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md">
								<div className="text-xs uppercase tracking-wide text-gray-600 mb-3 font-semibold">
									{value.label}
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-blue-700">{district1}:</span>
										<span className="text-lg font-bold text-gray-900">
											{key.includes('Wage') || key === 'wages' 
												? `₹${(value.district1 / (key === 'wages' ? 1 : 1)).toLocaleString()}${key === 'wages' ? '' : '/day'}`
												: value.district1.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-green-700">{district2}:</span>
										<span className="text-lg font-bold text-gray-900">
											{key.includes('Wage') || key === 'wages' 
												? `₹${(value.district2 / (key === 'wages' ? 1 : 1)).toLocaleString()}${key === 'wages' ? '' : '/day'}`
												: value.district2.toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Month-wise Bar Chart */}
					<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
						<div className="mb-4">
							<h3 className="text-xl font-bold text-gray-900 mb-2">Month-wise Comparison: {currentParam.label}</h3>
							<div className="flex gap-4 items-center text-sm">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 rounded" style={{ backgroundColor: currentParam.color1 }}></div>
									<span className="font-medium text-gray-700">{district1}</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 rounded" style={{ backgroundColor: currentParam.color2 }}></div>
									<span className="font-medium text-gray-700">{district2}</span>
								</div>
							</div>
						</div>
						<div className="h-96">
							<ResponsiveContainer width="100%" height="100%">
								{selectedParameter === 'wages' && (
									<BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis 
											dataKey="month" 
											angle={-45}
											textAnchor="end"
											height={80}
											tick={{ fontSize: 12 }}
										/>
										<YAxis 
											tick={{ fontSize: 12 }}
											label={{ value: '₹ Lakhs', angle: -90, position: 'insideLeft' }}
										/>
										<Tooltip 
											formatter={(value) => `₹${value.toFixed(2)} Lakhs`}
											contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
										/>
										<Legend />
										<Bar dataKey="district1" fill={currentParam.color1} name={district1} radius={[4, 4, 0, 0]} />
										<Bar dataKey="district2" fill={currentParam.color2} name={district2} radius={[4, 4, 0, 0]} />
									</BarChart>
								)}
								{selectedParameter === 'completedWorks' && (
									<BarChart data={worksComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis 
											dataKey="month" 
											angle={-45}
											textAnchor="end"
											height={80}
											tick={{ fontSize: 12 }}
										/>
										<YAxis 
											tick={{ fontSize: 12 }}
											label={{ value: 'Number of Works', angle: -90, position: 'insideLeft' }}
										/>
										<Tooltip 
											formatter={(value) => value.toLocaleString()}
											contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
										/>
										<Legend />
										<Bar dataKey="district1Completed" fill={currentParam.color1} name={`${district1} - Completed`} radius={[4, 4, 0, 0]} />
										<Bar dataKey="district2Completed" fill={currentParam.color2} name={`${district2} - Completed`} radius={[4, 4, 0, 0]} />
									</BarChart>
								)}
								{selectedParameter === 'ongoingWorks' && (
									<BarChart data={worksComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis 
											dataKey="month" 
											angle={-45}
											textAnchor="end"
											height={80}
											tick={{ fontSize: 12 }}
										/>
										<YAxis 
											tick={{ fontSize: 12 }}
											label={{ value: 'Number of Works', angle: -90, position: 'insideLeft' }}
										/>
										<Tooltip 
											formatter={(value) => value.toLocaleString()}
											contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
										/>
										<Legend />
										<Bar dataKey="district1Ongoing" fill={currentParam.color1} name={`${district1} - Ongoing`} radius={[4, 4, 0, 0]} />
										<Bar dataKey="district2Ongoing" fill={currentParam.color2} name={`${district2} - Ongoing`} radius={[4, 4, 0, 0]} />
									</BarChart>
								)}
							</ResponsiveContainer>
						</div>
					</div>

					{/* Additional Info */}
					<div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
						<p className="text-gray-700 text-base leading-relaxed text-center">
							Compare performance metrics between {district1} and {district2} for the financial year {selectedYear}. 
							Use the parameter selector to view different comparison metrics month-wise.
						</p>
					</div>
				</>
			)}

			{/* No Selection Message */}
			{(!district1 || !district2) && !loading && (
				<div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center shadow-lg">
					<div className="text-6xl mb-4">📊</div>
					<div className="text-gray-700 text-xl font-semibold mb-2">Select Two Districts to Compare</div>
					<div className="text-gray-500 text-base">Choose District 1 and District 2 from the dropdowns above to view comparison charts</div>
				</div>
			)}
		</div>
	)
}

