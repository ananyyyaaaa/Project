import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'

const PARAMETERS = [
	{
		id: 1,
		name: 'Persondays Generated',
		description: 'Total number of workdays created under MGNREGA',
		icon: '📅',
		colorClass: 'from-blue-500 to-blue-600',
		bgClass: 'from-blue-50 to-blue-100',
		borderClass: 'border-blue-200',
		textClass: 'text-blue-700',
		getValue: (data) => data?.persondaysGenerated || 0,
	},
	{
		id: 2,
		name: 'Household Participation',
		description: 'Total number of households that received work',
		icon: '👨‍👩‍👧',
		colorClass: 'from-green-500 to-green-600',
		bgClass: 'from-green-50 to-green-100',
		borderClass: 'border-green-200',
		textClass: 'text-green-700',
		getValue: (data) => data?.householdsBenefitted || 0,
	},
	{
		id: 3,
		name: 'Individuals Worked',
		description: 'Total individuals who worked at least one day',
		icon: '👥',
		colorClass: 'from-purple-500 to-purple-600',
		bgClass: 'from-purple-50 to-purple-100',
		borderClass: 'border-purple-200',
		textClass: 'text-purple-700',
		getValue: (data) => data?.totalActiveWorkers || 0,
	},
	{
		id: 4,
		name: '100-Day Goal Achievement',
		description: 'Number of households that completed 100 days of employment',
		icon: '🏆',
		colorClass: 'from-yellow-500 to-yellow-600',
		bgClass: 'from-yellow-50 to-yellow-100',
		borderClass: 'border-yellow-200',
		textClass: 'text-yellow-700',
		getValue: (data) => data?.hhCompleted100Days || 0,
	},
	{
		id: 5,
		name: 'Inclusion Index',
		description: 'Combined score based on participation of women, SC/ST, and differently-abled persons',
		icon: '👫',
		colorClass: 'from-pink-500 to-pink-600',
		bgClass: 'from-pink-50 to-pink-100',
		borderClass: 'border-pink-200',
		textClass: 'text-pink-700',
		getValue: (data) => {
			// Calculate inclusion index from inclusion data
			const women = data?.inclusionData?.totals?.women || 0
			const sc = data?.inclusionData?.totals?.sc || 0
			const st = data?.inclusionData?.totals?.st || 0
			const differentlyAbled = data?.inclusionData?.totals?.differentlyAbled || 0
			return women + sc + st + differentlyAbled
		},
	},
	{
		id: 6,
		name: 'Rural Development Index',
		description: 'Measures impact based on completed works in infrastructure',
		icon: '🏗️',
		colorClass: 'from-indigo-500 to-indigo-600',
		bgClass: 'from-indigo-50 to-indigo-100',
		borderClass: 'border-indigo-200',
		textClass: 'text-indigo-700',
		getValue: (data) => data?.assetsCreated || 0,
	},
]

export default function LeaderboardSection({ selectedYear }) {
	const { district: currentDistrict } = useParams()
	const [districts, setDistricts] = useState([])
	const [districtData, setDistrictData] = useState({})
	const [loading, setLoading] = useState(true)
	const [selectedParam, setSelectedParam] = useState(1)
	const [error, setError] = useState('')

	// Fetch all districts
	useEffect(() => {
		async function loadDistricts() {
			try {
				const res = await api.get('/api/districts')
				setDistricts(res.data?.districts || [])
			} catch (e) {
				console.error('Failed to load districts:', e)
				setError('Failed to load districts list')
			}
		}
		loadDistricts()
	}, [])

	// Fetch data for all districts
	useEffect(() => {
		async function loadAllDistrictsData() {
			if (districts.length === 0 || !selectedYear) return

			setLoading(true)
			setError('')
			const dataMap = {}

			try {
				// Fetch data for all districts in parallel
				const promises = districts.map(async (district) => {
					try {
						const [overviewRes, detailRes, inclusionRes] = await Promise.all([
							api.get(`/api/mgnrega/${encodeURIComponent(district)}?fin_year=${selectedYear}`).catch(() => null),
							api.get(`/api/data/${encodeURIComponent(district)}?fin_year=${selectedYear}`).catch(() => null),
							api.get(`/api/inclusion/${encodeURIComponent(district)}?fin_year=${selectedYear}`).catch(() => null),
						])

						return {
							district,
							overview: overviewRes?.data?.data || null,
							detail: detailRes?.data?.data || null,
							inclusionData: inclusionRes?.data?.data || null,
						}
					} catch (e) {
						console.error(`Error loading data for ${district}:`, e)
						return { district, overview: null, detail: null, inclusionData: null }
					}
				})

				const results = await Promise.all(promises)
				results.forEach((result) => {
					dataMap[result.district] = {
						...result.overview,
						hhCompleted100Days: result.detail?.employment?.hhCompleted100Days || 0,
						persondaysGenerated: result.overview?.persondaysGenerated || 0,
						inclusionData: result.inclusionData,
					}
				})

				setDistrictData(dataMap)
			} catch (e) {
				console.error('Failed to load district data:', e)
				setError('Failed to load district comparison data')
			} finally {
				setLoading(false)
			}
		}

		loadAllDistrictsData()
	}, [districts, selectedYear])

	// Calculate rankings for selected parameter
	const rankings = useMemo(() => {
		const param = PARAMETERS.find((p) => p.id === selectedParam)
		if (!param) return []

		const districtValues = Object.entries(districtData).map(([district, data]) => ({
			district,
			value: param.getValue(data),
		}))

		// Sort by value descending
		const sorted = [...districtValues].sort((a, b) => b.value - a.value)

		// Add rank
		return sorted.map((item, index) => ({
			...item,
			rank: index + 1,
		}))
	}, [districtData, selectedParam])

	const selectedParameter = PARAMETERS.find((p) => p.id === selectedParam)

	const getRankIcon = (rank) => {
		if (rank === 1) return '🥇'
		if (rank === 2) return '🥈'
		if (rank === 3) return '🥉'
		return `#${rank}`
	}

	const getRankColor = (rank) => {
		if (rank === 1) return 'from-yellow-400 to-yellow-600'
		if (rank === 2) return 'from-gray-300 to-gray-500'
		if (rank === 3) return 'from-orange-400 to-orange-600'
		return 'from-blue-100 to-blue-200'
	}

	const formatValue = (value) => {
		if (value >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`
		if (value >= 100000) return `${(value / 100000).toFixed(2)}L`
		if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
		return value.toLocaleString('en-IN')
	}

	if (loading) {
		return (
			<div className="text-center py-12">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
				<div className="text-gray-500 text-lg">Loading leaderboard data...</div>
				<div className="text-gray-400 text-sm mt-2">This may take a moment as we fetch data for all districts</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
				<div className="text-red-600 font-semibold text-lg mb-2">⚠️ Error</div>
				<div className="text-red-700">{error}</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
					<span>🏆</span>
					<span>District Performance Leaderboard</span>
				</h2>
				<p className="text-gray-600 text-lg">
					Compare district performance across key MGNREGA indicators for {selectedYear}
				</p>
			</div>

			{/* Parameter Selector */}
			<div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-lg">
				<div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select Performance Parameter</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
					{PARAMETERS.map((param) => (
						<button
							key={param.id}
							onClick={() => setSelectedParam(param.id)}
							className={`px-4 py-3 rounded-xl font-medium transition-all text-left ${
								selectedParam === param.id
									? `bg-gradient-to-r ${param.colorClass} text-white shadow-lg transform scale-105`
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							<div className="text-xl mb-1">{param.icon}</div>
							<div className="text-xs font-semibold">{param.name}</div>
						</button>
					))}
				</div>
			</div>

			{/* Parameter Description */}
			{selectedParameter && (
				<div className={`bg-gradient-to-r ${selectedParameter.bgClass} border-2 ${selectedParameter.borderClass} rounded-xl p-4 shadow-md`}>
					<div className="flex items-center gap-3 mb-2">
						<div className="text-2xl">{selectedParameter.icon}</div>
						<h3 className="text-lg font-bold text-gray-900">{selectedParameter.name}</h3>
					</div>
					<p className="text-gray-700 text-sm">{selectedParameter.description}</p>
				</div>
			)}

			{/* Rankings Table */}
			<div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
				<div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
					<h3 className="text-xl font-bold text-gray-900">Top Performing Districts</h3>
					<p className="text-sm text-gray-600 mt-1">Ranked by {selectedParameter?.name}</p>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">District</th>
								<th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
								<th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Performance</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{rankings.map((item) => {
								const isCurrentDistrict = currentDistrict && item.district.toLowerCase() === currentDistrict.toLowerCase()
								const maxValue = rankings[0]?.value || 1
								const percentage = (item.value / maxValue) * 100

								return (
									<tr
										key={item.district}
										className={`hover:bg-gray-50 transition ${
											isCurrentDistrict ? 'bg-blue-50 border-l-4 border-blue-500' : ''
										}`}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<span className="text-xl">{getRankIcon(item.rank)}</span>
												{item.rank <= 3 && (
													<span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${getRankColor(item.rank)} text-white`}>
														Top {item.rank}
													</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<span className="text-sm font-semibold text-gray-900">{item.district}</span>
												{isCurrentDistrict && (
													<span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">Current</span>
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right">
											<div className="text-lg font-bold text-gray-900">{formatValue(item.value)}</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
													<div
														className={`h-full bg-gradient-to-r ${selectedParameter?.colorClass || 'from-blue-500 to-blue-600'} rounded-full transition-all`}
														style={{ width: `${percentage}%` }}
													></div>
												</div>
												<span className="text-xs text-gray-600 font-medium w-16 text-right">{percentage.toFixed(1)}%</span>
											</div>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
					<div className="text-sm font-semibold text-blue-700 mb-1">Total Districts</div>
					<div className="text-3xl font-bold text-blue-900">{rankings.length}</div>
				</div>
				<div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 shadow-lg">
					<div className="text-sm font-semibold text-green-700 mb-1">Top Performer</div>
					<div className="text-xl font-bold text-green-900">{rankings[0]?.district || 'N/A'}</div>
					<div className="text-sm text-green-700 mt-1">{formatValue(rankings[0]?.value || 0)}</div>
				</div>
				<div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 shadow-lg">
					<div className="text-sm font-semibold text-purple-700 mb-1">Average Value</div>
					<div className="text-2xl font-bold text-purple-900">
						{formatValue(Math.round(rankings.reduce((sum, item) => sum + item.value, 0) / rankings.length || 0))}
					</div>
				</div>
			</div>
		</div>
	)
}

