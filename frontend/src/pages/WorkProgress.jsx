import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../components/StatCard'
import Header from '../components/Header'
import Footer from '../components/Footer'

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']

export default function WorkProgress() {
	const { district } = useParams()
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		async function load() {
			setLoading(true)
			setError('')
			try {
				const res = await api.get(`/api/data/${encodeURIComponent(district)}`)
				setData(res.data?.data)
			} catch (e) {
				setError('Failed to load work progress')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [district])

	const pieData = useMemo(() => {
		if (!data?.workProgress) return []
		const pctB = Number(data.workProgress.percentCategoryBWorks || 0)
		return [
			{ name: 'Category B', value: pctB },
			{ name: 'Other', value: Math.max(0, 100 - pctB) }
		]
	}, [data])

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
			<Header 
				showBackButton={true} 
				backTo={`/dashboard/${encodeURIComponent(district)}`}
				title={`${district} – Work Progress`}
			/>
			
			<main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
				<div className="mb-6 flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Work Progress</h1>
						<p className="text-gray-600">Project status and work category distribution for {district}</p>
					</div>
					<div className="flex gap-3">
						<Link 
							to={`/dashboard/${encodeURIComponent(district)}`}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
						>
							← Back to Dashboard
						</Link>
						<Link 
							to="/"
							className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium shadow-md"
						>
							Change District
						</Link>
					</div>
				</div>

				{loading && (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
						<div className="text-gray-500 text-lg">Loading work progress data...</div>
					</div>
				)}
				{error && (
					<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
						<div className="text-red-600 font-semibold text-lg mb-2">⚠️ Error</div>
						<div className="text-red-700">{error}</div>
					</div>
				)}
				{!loading && !error && data && (
					<div className="space-y-6">
						<section>
							<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
								<span>📊</span>
								<span>Overview Statistics</span>
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<StatCard title="Total Works Taken Up" value={data.workProgress?.totalWorksTakenUp} icon="📈" colorClass="" />
								<StatCard title="Completed Works" value={data.workProgress?.completedWorks} icon="✅" colorClass="" />
								<StatCard title="Ongoing Works" value={data.workProgress?.ongoingWorks} icon="🟡" colorClass="" />
							</div>
						</section>

						<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
								<div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
									<span>📈</span>
									<span>Completion Status</span>
								</div>
								<div className="flex gap-6 items-center">
									<div className="text-7xl">{(Number(data.workProgress?.completedWorks) > 0) ? '🟢' : '🟡'}</div>
									<div className="space-y-2">
										<div className="text-2xl font-bold text-gray-900">
											Completed: <span className="text-green-600">{data.workProgress?.completedWorks?.toLocaleString?.() ?? 0}</span>
										</div>
										<div className="text-lg text-gray-600">
											Ongoing: <span className="font-semibold text-yellow-600">{data.workProgress?.ongoingWorks?.toLocaleString?.() ?? 0}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
								<div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
									<span>📊</span>
									<span>% Category B Works</span>
								</div>
								<div className="w-full h-64 mb-4">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie data={pieData} innerRadius={60} outerRadius={90} dataKey="value">
												{pieData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(v) => `${v}%`} />
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="text-center text-base font-semibold text-gray-700">
									Category B share: <span className="text-blue-600">{Number(data.workProgress?.percentCategoryBWorks || 0)}%</span>
								</div>
							</div>
						</section>
					</div>
				)}
			</main>
			
			<Footer />
		</div>
	)
}
