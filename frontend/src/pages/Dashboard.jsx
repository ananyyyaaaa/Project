import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import TrendChart from '../components/TrendChart'
import MetricCard from '../components/MetricCard'

function statusFromValue(value, goodThreshold, poorThreshold) {
	if (typeof value !== 'number' || Number.isNaN(value)) return 'moderate'
	if (value >= goodThreshold) return 'good'
	if (value <= poorThreshold) return 'poor'
	return 'moderate'
}

export default function Dashboard() {
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
				setError('Failed to load dashboard data')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [district])

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl md:text-3xl font-bold">{district} – Dashboard</h1>
				<Link to="/" className="text-blue-600">← Change District</Link>
			</div>

			{loading && <div>Loading…</div>}
			{error && <div className="text-red-600">{error}</div>}
			{!loading && !error && data && (
				<div className="space-y-6">
					{/* Employment Overview */}
					<section>
						<h2 className="text-lg font-semibold mb-3">1. Employment Overview</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<MetricCard title="Households" value={data.employment?.totalHouseholds} icon="👪" status={statusFromValue(data.employment?.totalHouseholds, 5000, 500)} />
							<MetricCard title="Individuals" value={data.employment?.totalIndividuals} icon="🧑‍🌾" status={statusFromValue(data.employment?.totalIndividuals, 10000, 1000)} />
							<MetricCard title="Avg Days" value={data.employment?.averageDays} icon="📅" status={statusFromValue(data.employment?.averageDays, 50, 10)} />
						</div>
					</section>

					{/* Wages & Payments */}
					<section>
						<h2 className="text-lg font-semibold mb-3">2. Wages & Payments</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<MetricCard title="Average Wage" value={data.wages?.averageWage} icon="💸" status={statusFromValue(data.wages?.averageWage, 250, 100)} />
							<MetricCard title="Total Wages" value={data.wages?.totalWages} icon="🏦" status={statusFromValue(data.wages?.totalWages, 10000000, 100000)} />
						</div>
					</section>

					{/* Work Progress */}
					<section>
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold">3. Work Progress</h2>
							<Link className="text-blue-600" to={`/work-progress/${encodeURIComponent(district)}`}>Open detailed page →</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<MetricCard title="Total Works" value={data.workProgress?.totalWorksTakenUp} icon="📈" status={statusFromValue(data.workProgress?.totalWorksTakenUp, 1500, 100)} />
							<MetricCard title="Completed Works" value={data.workProgress?.completedWorks} icon="✅" status={statusFromValue(data.workProgress?.completedWorks, 500, 50)} />
							<MetricCard title="Ongoing Works" value={data.workProgress?.ongoingWorks} icon="🚧" status={statusFromValue(data.workProgress?.ongoingWorks, 800, 100)} />
						</div>
					</section>

					{/* Inclusivity */}
					<section>
						<h2 className="text-lg font-semibold mb-3">4. Inclusivity</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<MetricCard title="Women Participation %" value={data.inclusivity?.womenParticipationPct} icon="👩" status={statusFromValue(data.inclusivity?.womenParticipationPct, 50, 20)} />
							<MetricCard title="SC/ST Participation %" value={data.inclusivity?.scStParticipationPct} icon="🧑🏾‍🤝‍🧑🏻" status={statusFromValue(data.inclusivity?.scStParticipationPct, 50, 20)} />
						</div>
					</section>

					{/* Trends */}
					<section>
						<h2 className="text-lg font-semibold mb-3">5. Trends</h2>
						<TrendChart data={data.trends || []} />
					</section>
				</div>
			)}
		</div>
	)
}
