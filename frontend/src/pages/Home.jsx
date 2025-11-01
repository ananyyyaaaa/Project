import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import manipurImage from '../images/manipur.jpg'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
	const [districts, setDistricts] = useState([])
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedDistrict, setSelectedDistrict] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		async function loadDistricts() {
			setLoading(true)
			setError('')
			try {
				const res = await api.get('/api/districts')
				setDistricts(res.data?.districts || [])
			} catch (e) {
				setError('Failed to load districts')
			} finally {
				setLoading(false)
			}
		}
		loadDistricts()
	}, [])

	useEffect(() => {
		async function loadData() {
			try {
				const res = await api.get('/api/mgnrega/manipur')
				setData(res.data?.data)
			} catch (e) {
				setError('Failed to load state data')
			}
		}
		loadData()
	}, [])

	function handleDistrictChange(e) {
		const district = e.target.value
		setSelectedDistrict(district)
		if (district) {
			navigate(`/dashboard/${encodeURIComponent(district)}`)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
			<Header title="MGNREGA Dashboard" />

			{/* Hero Section with Image */}
			<section className="relative overflow-hidden">
				<div className="relative h-64 md:h-80 lg:h-96">
					<img
						src={manipurImage}
						alt="Manipur Landscape"
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/60"></div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center text-white px-4">
							<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-lg">
								MGNREGA Dashboard
							</h1>
							<p className="text-lg md:text-xl lg:text-2xl font-light drop-shadow-md">
								Manipur State
							</p>
							<p className="text-sm md:text-base mt-2 opacity-90 drop-shadow">
								Empowering Rural India Through Employment Guarantee
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
				{/* District Selector */}
				<div className="bg-white border-2 border-blue-100 rounded-xl p-6 mb-8 shadow-lg">
					<div className="flex items-center gap-3 mb-4">
						<div className="text-2xl">📍</div>
						<label className="text-lg font-semibold text-gray-800">Select District to View Dashboard</label>
					</div>
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
						<select
							className="border-2 border-gray-300 rounded-lg p-3 w-full md:w-auto min-w-[250px] text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
							value={selectedDistrict}
							onChange={handleDistrictChange}
						>
							<option value="">{loading ? 'Loading districts...' : 'Choose a district'}</option>
							{districts.map((d) => (
								<option key={d} value={d}>{d}</option>
							))}
						</select>
						{error && <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">{error}</div>}
					</div>
				</div>

				{/* Key Metrics Section */}
				{data && (
					<>
						<div className="mb-6">
							<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
								<span>📊</span>
								<span>State Overview</span>
							</h2>
							<p className="text-gray-600">Key performance indicators for Manipur state</p>
						</div>

						{/* 6 Big Stat Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							<div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm uppercase tracking-wide text-blue-700 font-semibold">Total Active Workers</div>
									<div className="text-2xl">👥</div>
								</div>
								<div className="text-3xl font-bold text-blue-900">{data.totalActiveWorkers?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm uppercase tracking-wide text-green-700 font-semibold">Assets Created</div>
									<div className="text-2xl">🏗️</div>
								</div>
								<div className="text-3xl font-bold text-green-900">{data.assetsCreated?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm uppercase tracking-wide text-purple-700 font-semibold">Persondays Generated</div>
									<div className="text-2xl">📅</div>
								</div>
								<div className="text-3xl font-bold text-purple-900">{data.persondaysGenerated?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm uppercase tracking-wide text-yellow-700 font-semibold">DBT Transactions</div>
									<div className="text-2xl">💳</div>
								</div>
								<div className="text-3xl font-bold text-yellow-900">₹{(data.dbtTransactions || 0).toLocaleString()}</div>
							</div>
							<div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm uppercase tracking-wide text-pink-700 font-semibold">Households Benefitted</div>
									<div className="text-2xl">🏠</div>
								</div>
								<div className="text-3xl font-bold text-pink-900">{data.householdsBenefitted?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
								<div className="flex items-center justify-between mb-2">
									<div className="text-sm uppercase tracking-wide text-indigo-700 font-semibold">Individual Category Works</div>
									<div className="text-2xl">🔨</div>
								</div>
								<div className="text-3xl font-bold text-indigo-900">{data.individualCategoryWorks?.toLocaleString() || 0}</div>
							</div>
						</div>

						{/* 3 Medium Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition">
								<div className="flex items-center gap-3 mb-3">
									<div className="text-3xl">📈</div>
									<div className="text-sm uppercase tracking-wide text-gray-600 font-semibold">Attendance (today)</div>
								</div>
								<div className="text-3xl font-bold text-gray-900">{data.attendanceToday?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition">
								<div className="flex items-center gap-3 mb-3">
									<div className="text-3xl">🏗️</div>
									<div className="text-sm uppercase tracking-wide text-gray-600 font-semibold">Number of Worksites</div>
								</div>
								<div className="text-3xl font-bold text-gray-900">{data.numberOfWorksites?.toLocaleString() || 0}</div>
							</div>
							<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition">
								<div className="flex items-center gap-3 mb-3">
									<div className="text-3xl">👷</div>
									<div className="text-sm uppercase tracking-wide text-gray-600 font-semibold">Number of Workers</div>
								</div>
								<div className="text-3xl font-bold text-gray-900">{data.numberOfWorkers?.toLocaleString() || 0}</div>
							</div>
						</div>
					</>
				)}

				{/* Vision of the Scheme Section */}
				<div className="bg-gradient-to-r from-white to-blue-50 border-2 border-blue-100 rounded-xl p-8 shadow-lg mb-8">
					<div className="flex items-center gap-3 mb-4">
						<div className="text-3xl">🎯</div>
						<h2 className="text-2xl font-bold text-gray-900">Vision of the Scheme</h2>
					</div>
					<div className="text-gray-700 space-y-4 text-base leading-relaxed">
						<p className="bg-white/50 rounded-lg p-4 border-l-4 border-blue-500">
							The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) aims to enhance livelihood security in rural areas by providing at least 100 days of guaranteed wage employment in a financial year to every household whose adult members volunteer to do unskilled manual work.
						</p>
						<p className="bg-white/50 rounded-lg p-4 border-l-4 border-green-500">
							The Act promotes sustainable development through asset creation, water conservation, land development, and afforestation, while ensuring social inclusion and transparency through participatory governance.
						</p>
					</div>
				</div>

				{/* Loading State */}
				{!data && !error && (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
						<div className="text-gray-500 text-lg">Loading state data...</div>
					</div>
				)}
			</main>

			<Footer />
		</div>
	)
}
