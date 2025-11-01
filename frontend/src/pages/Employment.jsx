import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import ProgressBar from '../components/ProgressBar'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Employment() {
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
				setError('Failed to load employment overview')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [district])

	const pieData = useMemo(() => {
		const issued = Number(data?.employment?.jobCardsIssued || 0)
		const active = Number(data?.employment?.jobCardsActive || 0)
		const inactive = Math.max(0, issued - active)
		return [
			{ name: 'Active', value: active },
			{ name: 'Inactive', value: inactive },
		]
	}, [data])

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
			<Header 
				showBackButton={true} 
				backTo={`/dashboard/${encodeURIComponent(district)}`}
				title={`${district} – Employment Overview`}
			/>
			
			<main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
				<div className="mb-6 flex items-center justify-between flex-wrap gap-4">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Employment Overview</h1>
						<p className="text-gray-600">Detailed employment statistics for {district}</p>
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
						<div className="text-gray-500 text-lg">Loading employment data...</div>
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
						<section className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
							<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
								<div>
									<div className="text-sm uppercase tracking-wide text-gray-600 font-semibold mb-2">Total Households Worked</div>
									<div className="text-5xl font-extrabold flex items-center gap-3 text-blue-900">
										<span>👨‍👩‍👧</span>
										<span>{data.employment?.totalHouseholds?.toLocaleString?.() ?? 0}</span>
									</div>
									<div className="text-base text-gray-600 mt-2">
										Total Individuals Worked: <span className="font-semibold text-gray-900">{data.employment?.totalIndividuals?.toLocaleString?.() ?? 0}</span>
									</div>
								</div>
								{Number(data.employment?.hhCompleted100Days) > 0 && (
									<div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300 text-green-800 font-semibold shadow-md">
										🏆 100 Days Achieved: {data.employment?.hhCompleted100Days?.toLocaleString?.()}
									</div>
								)}
							</div>
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="text-base font-semibold text-gray-700">Average Days of Employment Per Household</div>
									<div className="text-lg font-bold text-blue-600">{data.employment?.averageDays ?? 0} / 100 days</div>
								</div>
								<ProgressBar value={Number(data.employment?.averageDays || 0)} max={100} />
							</div>
						</section>

						<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
								<div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
									<span>📊</span>
									<span>Job Cards – Issued vs Active</span>
								</div>
								<div className="w-full h-64 mb-4">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie data={pieData} innerRadius={60} outerRadius={90} dataKey="value">
												{pieData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#E5E7EB'} />
												))}
											</Pie>
											<Tooltip formatter={(value) => value.toLocaleString()} />
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="text-sm text-gray-600 mt-4 space-y-1">
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 rounded-full bg-green-500"></div>
										<span>Active: <span className="font-semibold">{data.employment?.jobCardsActive?.toLocaleString?.() ?? 0}</span></span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 rounded-full bg-gray-300"></div>
										<span>Issued: <span className="font-semibold">{data.employment?.jobCardsIssued?.toLocaleString?.() ?? 0}</span></span>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
								<div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
									<span>ℹ️</span>
									<span>Information</span>
								</div>
								<ul className="space-y-3 text-sm text-gray-700">
									<li className="flex items-start gap-2">
										<span className="text-blue-600 font-bold">•</span>
										<span>Households and individuals are annual aggregates.</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-600 font-bold">•</span>
										<span>Average days is capped at 100 for progress visualization.</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-600 font-bold">•</span>
										<span>100-days achieved counts households completing full 100 days.</span>
									</li>
								</ul>
							</div>
						</section>
					</div>
				)}
			</main>
			
			<Footer />
		</div>
	)
}
