import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ title, value, icon, colorClass }) {
	return (
		<div className={`border rounded-xl p-4 bg-white ${colorClass}`}>
			<div className="text-sm uppercase tracking-wide opacity-70 mb-1">{title}</div>
			<div className="flex items-center gap-2">
				<div className="text-2xl">{icon}</div>
				<div className="text-3xl font-bold">{Number.isFinite(value) ? value.toLocaleString() : value}</div>
			</div>
		</div>
	)
}

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
		<div className="max-w-6xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl md:text-3xl font-bold">{district} – Work Progress</h1>
				<div className="flex gap-4 text-blue-600">
					<Link to={`/dashboard/${encodeURIComponent(district)}`}>← Back to Dashboard</Link>
					<Link to="/">Change District</Link>
				</div>
			</div>

			{loading && <div>Loading…</div>}
			{error && <div className="text-red-600">{error}</div>}
			{!loading && !error && data && (
				<div className="space-y-6">
					<section>
						<h2 className="text-lg font-semibold mb-3">Overview</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<StatCard title="Total Works Taken Up" value={data.workProgress?.totalWorksTakenUp} icon="📈" colorClass="" />
							<StatCard title="Completed Works" value={data.workProgress?.completedWorks} icon="✅" colorClass="" />
							<StatCard title="Ongoing Works" value={data.workProgress?.ongoingWorks} icon="🟡" colorClass="" />
						</div>
					</section>

					<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-white border rounded-xl p-4">
							<div className="text-sm uppercase tracking-wide opacity-70 mb-2">Completion Status</div>
							<div className="flex gap-6 items-center">
								<div className="text-6xl">{(Number(data.workProgress?.completedWorks) > 0) ? '🟢' : '🟡'}</div>
								<div>
									<div className="text-xl font-semibold">Completed: {data.workProgress?.completedWorks?.toLocaleString?.() ?? 0}</div>
									<div className="text-sm opacity-70">Ongoing: {data.workProgress?.ongoingWorks?.toLocaleString?.() ?? 0}</div>
								</div>
							</div>
						</div>

						<div className="bg-white border rounded-xl p-4">
							<div className="text-sm uppercase tracking-wide opacity-70 mb-2">% Category B Works</div>
							<div className="w-full h-64">
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
							<div className="text-center text-sm opacity-70 mt-2">Category B share: {Number(data.workProgress?.percentCategoryBWorks || 0)}%</div>
						</div>
					</section>
				</div>
			)}
		</div>
	)
}
