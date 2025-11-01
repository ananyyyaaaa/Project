import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import CompareDistrictsSection from '../components/CompareDistrictsSection'
import LeaderboardSection from '../components/LeaderboardSection'
import WagesPaymentSection from '../components/WagesPaymentSection'
import EmploymentOverviewSection from '../components/EmploymentOverviewSection'
import InclusionParticipationSection from '../components/InclusionParticipationSection'
import WorkProgressSection from '../components/WorkProgressSection'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Dashboard() {
	const { district: districtParam } = useParams()
	const district = districtParam ? decodeURIComponent(districtParam) : ''
	const [data, setData] = useState(null)
	const [employmentData, setEmploymentData] = useState(null)
	const [inclusionData, setInclusionData] = useState(null)
	const [workProgressData, setWorkProgressData] = useState(null)
	const [wagesData, setWagesData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedYear, setSelectedYear] = useState('')
	const [activeNavItem, setActiveNavItem] = useState(1)
	
	console.log('Dashboard mounted with district:', district)

	// Generate financial year options (current and past 4 years)
	// API expects format: "2024-2025" (full year format)
	const currentYear = new Date().getFullYear()
	const getFinancialYear = (year) => {
		const nextYear = year + 1
		return `${year}-${nextYear}` // Full format: 2024-2025
	}

	const yearOptions = []
	for (let i = 0; i < 5; i++) {
		yearOptions.push(getFinancialYear(currentYear - i))
	}

	useEffect(() => {
		setSelectedYear(getFinancialYear(currentYear))
	}, [])

	useEffect(() => {
		async function load() {
			if (!selectedYear || !district) return
			setLoading(true)
			setError('')
			try {
				const url = `/api/mgnrega/${encodeURIComponent(district)}?fin_year=${selectedYear}`
				console.log('Fetching dashboard data from:', url)
				const res = await api.get(url)
				console.log('Dashboard data response:', res.data)
				setData(res.data?.data)
			} catch (e) {
				console.error('Failed to load dashboard data:', e)
				setError('Failed to load dashboard data: ' + (e.response?.data?.error || e.message))
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [district, selectedYear])

	// Load detailed employment data when Employment Overview is active
	useEffect(() => {
		async function loadEmploymentData() {
			if (activeNavItem === 1 && selectedYear) {
				try {
					const res = await api.get(`/api/data/${encodeURIComponent(district)}?fin_year=${selectedYear}`)
					console.log('Employment data response:', res.data)
					setEmploymentData(res.data?.data)
				} catch (e) {
					console.error('Failed to load employment data:', e)
					setEmploymentData(null)
				}
			}
		}
		loadEmploymentData()
	}, [district, selectedYear, activeNavItem])

	// Load inclusion data when Inclusion & Participation is active (nav item 5)
	useEffect(() => {
		async function loadInclusionData() {
			if (activeNavItem === 5 && selectedYear && district) {
				try {
					const res = await api.get(`/api/inclusion/${encodeURIComponent(district)}?fin_year=${selectedYear}`)
					console.log('Inclusion data response:', res.data)
					setInclusionData(res.data?.data)
				} catch (e) {
					console.error('Failed to load inclusion data:', e)
					setInclusionData(null)
				}
			}
		}
		loadInclusionData()
	}, [district, selectedYear, activeNavItem])

	// Load work progress data when Work Progress is active (nav item 3)
	useEffect(() => {
		async function loadWorkProgressData() {
			if (activeNavItem === 3 && selectedYear && district) {
				try {
					const res = await api.get(`/api/data/${encodeURIComponent(district)}?fin_year=${selectedYear}`)
					console.log('Work progress data response:', res.data)
					setWorkProgressData(res.data?.data)
				} catch (e) {
					console.error('Failed to load work progress data:', e)
					setWorkProgressData(null)
				}
			}
		}
		loadWorkProgressData()
	}, [district, selectedYear, activeNavItem])

	// Load wages data when Wages & Payment is active (nav item 2)
	useEffect(() => {
		async function loadWagesData() {
			if (activeNavItem === 2 && selectedYear && district) {
				try {
					const res = await api.get(`/api/data/${encodeURIComponent(district)}?fin_year=${selectedYear}`)
					console.log('Wages data response:', res.data)
					setWagesData(res.data?.data)
				} catch (e) {
					console.error('Failed to load wages data:', e)
					setWagesData(null)
				}
			}
		}
		loadWagesData()
	}, [district, selectedYear, activeNavItem])

	const navItems = [
		{ id: 1, label: 'Employment Overview' },
		{ id: 2, label: 'Wages and Payment Information' },
		{ id: 3, label: 'Work Progress' },
		{ id: 4, label: 'Expenditure and Efficiency' },
		{ id: 5, label: 'Inclusion and Participation' },
		{ id: 6, label: 'Compare yourself with other districts' },
		{ id: 7, label: 'Leadership Board' },
	]

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
			<Header showBackButton={true} backTo="/" title={`MGNREGA Dashboard – ${district}`} />
			
			{/* Top Stats Section */}
			<div className="bg-white border-b shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">District Dashboard</h1>
							<p className="text-gray-600">Comprehensive MGNREGA analytics for {district}</p>
						</div>
						<div className="flex items-center gap-3">
							<label className="text-sm font-medium text-gray-700">Financial Year:</label>
							<select
								className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm"
								value={selectedYear}
								onChange={(e) => setSelectedYear(e.target.value)}
							>
								{yearOptions.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Major Data Cards */}
					{data && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
								<div className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">Total Active Workers</div>
								<div className="text-2xl font-bold text-blue-900">{data.totalActiveWorkers?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
								<div className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-1">Assets Created</div>
								<div className="text-2xl font-bold text-green-900">{data.assetsCreated?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
								<div className="text-xs uppercase tracking-wide text-purple-700 font-semibold mb-1">Persondays</div>
								<div className="text-2xl font-bold text-purple-900">{data.persondaysGenerated?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
								<div className="text-xs uppercase tracking-wide text-yellow-700 font-semibold mb-1">DBT Transactions</div>
								<div className="text-2xl font-bold text-yellow-900">₹{(data.dbtTransactions || 0).toLocaleString()}</div>
							</div>
							<div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
								<div className="text-xs uppercase tracking-wide text-pink-700 font-semibold mb-1">Households</div>
								<div className="text-2xl font-bold text-pink-900">{data.householdsBenefitted?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
								<div className="text-xs uppercase tracking-wide text-indigo-700 font-semibold mb-1">Individual Works</div>
								<div className="text-2xl font-bold text-indigo-900">{data.individualCategoryWorks?.toLocaleString() || 0}</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Main Content Area - Side by Side */}
			<div className="flex flex-1 max-w-7xl mx-auto w-full">
				{/* Left Sidebar Navbar */}
				<div className="w-64 bg-white border-r-2 border-gray-200 shadow-lg min-h-[calc(100vh-250px)]">
					<div className="p-4 sticky top-20">
						<div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
							<span>📋</span>
							<span>Navigation</span>
						</div>
						<nav className="space-y-2">
							{navItems.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={(e) => {
										e.preventDefault()
										setActiveNavItem(item.id)
									}}
									className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
										activeNavItem === item.id
											? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
											: 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
									}`}
								>
									{item.label}
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* Right Content Area */}
				<main className="flex-1 p-6 bg-transparent">
					{loading && (
						<div className="text-center py-12">
							<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
							<div className="text-gray-500 text-lg">Loading district data...</div>
						</div>
					)}
					{error && (
						<div className="text-center py-12 bg-red-50 border-2 border-red-200 rounded-xl p-6">
							<div className="text-red-600 font-semibold text-lg mb-2">⚠️ Error</div>
							<div className="text-red-700">{error}</div>
						</div>
					)}

					{!loading && !error && (
						<div>
							{/* Employment Overview Section */}
							{activeNavItem === 1 && (
								<EmploymentOverviewSection employmentData={employmentData} data={data} />
							)}

							{/* Inclusion & Participation Section (Nav Item 5) */}
							{activeNavItem === 5 && (
								<InclusionParticipationSection inclusionData={inclusionData} />
							)}

							{/* Work Progress Section (Nav Item 3) */}
							{activeNavItem === 3 && (
								<WorkProgressSection
									workProgressData={workProgressData?.workProgress || null}
									trendsData={workProgressData?.monthlyWorksTrends || []}
								/>
							)}

							{/* Wages & Payment Section (Nav Item 2) */}
							{activeNavItem === 2 && (
							<WagesPaymentSection
								wagesData={wagesData?.wages || null}
								monthlyWagesTrends={wagesData?.monthlyWagesTrends || []}
								meta={wagesData?.meta || {}}
							/>
							)}


							{/* Compare Districts Section (Nav Item 6) */}
							{activeNavItem === 6 && (
								<CompareDistrictsSection selectedYear={selectedYear} />
							)}

							{/* Leadership Board Section (Nav Item 7) */}
							{activeNavItem === 7 && (
								<LeaderboardSection selectedYear={selectedYear} />
							)}

							{/* Placeholder for other nav items */}
							{activeNavItem !== 1 && activeNavItem !== 2 && activeNavItem !== 3 && activeNavItem !== 5 && activeNavItem !== 6 && activeNavItem !== 7 && (
								<div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center shadow-lg">
									<div className="text-6xl mb-4">🚧</div>
									<div className="text-gray-700 text-xl font-semibold mb-2">{navItems.find(item => item.id === activeNavItem)?.label}</div>
									<div className="text-gray-500 text-base">Content coming soon...</div>
								</div>
							)}
						</div>
					)}
				</main>
			</div>
			
			<Footer />
		</div>
	)
}
