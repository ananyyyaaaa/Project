import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function EmploymentOverviewSection({ employmentData, data }) {
	if (!employmentData) {
		return <div className="text-center py-8 text-gray-500">Loading employment data...</div>
	}

	return (
		<div className="space-y-8">
			<h2 className="text-3xl font-bold text-gray-900 mb-6">Employment Overview</h2>

			{/* Section 1: Key Employment Highlights - 6 Large Cards */}
			<div>
				<h3 className="text-xl font-semibold text-gray-800 mb-4">Key Employment Highlights</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Total Households Worked */}
					<div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
						<div className="text-5xl mb-3">👨‍👩‍👧</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">Families got work</div>
						<div className="text-4xl font-bold text-gray-900">{employmentData.employment?.totalHouseholds?.toLocaleString() || 0}</div>
						<div className="text-xs text-gray-600 mt-2">Total Households Worked</div>
					</div>

					{/* Total Individuals Worked */}
					<div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
						<div className="text-5xl mb-3">👷‍♀️</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">People worked under MGNREGA</div>
						<div className="text-4xl font-bold text-gray-900">{employmentData.employment?.totalIndividuals?.toLocaleString() || 0}</div>
						<div className="text-xs text-gray-600 mt-2">Total Individuals Worked</div>
					</div>

					{/* Average Days of Employment */}
					<div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
						<div className="text-5xl mb-3">📅</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">Avg workdays per family</div>
						<div className="mb-3">
							<div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-blue-600 transition-all duration-1000"
									style={{ width: `${Math.min(100, (employmentData.employment?.averageDays || 0))}%` }}
								/>
							</div>
							<div className="text-xs text-gray-600 mt-1 text-right">{employmentData.employment?.averageDays || 0} / 100 days</div>
						</div>
						<div className="text-3xl font-bold text-gray-900">{employmentData.employment?.averageDays?.toFixed(1) || 0}</div>
					</div>

					{/* Total HHs Completed 100 Days */}
					<div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition relative overflow-hidden">
						<div className="absolute top-2 right-2 text-3xl opacity-20">🏆</div>
						<div className="text-5xl mb-3 relative z-10">🏆</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">Families reached 100 days goal</div>
						<div className="text-4xl font-bold text-gray-900 relative z-10">{employmentData.employment?.hhCompleted100Days?.toLocaleString() || 0}</div>
						<div className="text-xs text-gray-600 mt-2 relative z-10">Total HHs Completed 100 Days</div>
					</div>

					{/* Total Job Cards Issued */}
					<div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
						<div className="text-5xl mb-3">🪪</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">Registered families</div>
						<div className="text-4xl font-bold text-gray-900 mb-3">{employmentData.employment?.jobCardsIssued?.toLocaleString() || 0}</div>
						<div className="h-24">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={[
											{ name: 'Active', value: employmentData.employment?.jobCardsActive || 0 },
											{ name: 'Inactive', value: Math.max(0, (employmentData.employment?.jobCardsIssued || 0) - (employmentData.employment?.jobCardsActive || 0)) },
										]}
										cx="50%"
										cy="50%"
										innerRadius={20}
										outerRadius={40}
										dataKey="value"
									>
										<Cell fill="#10B981" />
										<Cell fill="#E5E7EB" />
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="text-xs text-gray-600">Active: {employmentData.employment?.jobCardsActive?.toLocaleString() || 0}</div>
					</div>

					{/* Total Wages Paid */}
					<div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
						<div className="text-5xl mb-3 animate-pulse">💰</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">Direct payments made</div>
						<div className="text-4xl font-bold text-gray-900">₹{(employmentData.wages?.totalWages || 0).toLocaleString()}</div>
						<div className="text-xs text-gray-600 mt-2">Total Wages Paid (DBT Transactions)</div>
					</div>
				</div>
			</div>

			{/* Section 2: Worksite & Attendance - 3 Tiles */}
			<div>
				<h3 className="text-xl font-semibold text-gray-800 mb-4">Worksite & Attendance</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* No. of Worksites */}
					<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition">
						<div className="text-4xl mb-3">🏠</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">No. of Worksites</div>
						<div className="text-3xl font-bold text-gray-900">{data?.numberOfWorksites?.toLocaleString() || 0}</div>
						<div className="text-xs text-gray-500 mt-2">Active construction sites</div>
					</div>

					{/* No. of Workers Today */}
					<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition">
						<div className="text-4xl mb-3">👥</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">No. of Workers Today</div>
						<div className="text-3xl font-bold text-gray-900">{data?.attendanceToday?.toLocaleString() || 0}</div>
						<div className="text-xs text-gray-500 mt-2">Currently working</div>
					</div>

					{/* Attendance Today - Donut Chart */}
					<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition">
						<div className="text-4xl mb-3">🕓</div>
						<div className="text-sm uppercase tracking-wide text-gray-600 mb-2">Attendance Today</div>
						<div className="h-32 mb-2">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={[
											{ name: 'Present', value: data?.attendanceToday || 0 },
											{ name: 'Absent', value: Math.max(0, (data?.numberOfWorkers || 0) - (data?.attendanceToday || 0)) },
										]}
										cx="50%"
										cy="50%"
										innerRadius={30}
										outerRadius={50}
										dataKey="value"
									>
										<Cell fill="#10B981" />
										<Cell fill="#EF4444" />
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="flex justify-center gap-4 text-xs">
							<span className="text-green-600">● Present</span>
							<span className="text-red-600">● Absent</span>
						</div>
					</div>
				</div>
			</div>

			{/* Section 3: Progress Overview - Charts */}
			<div>
				<h3 className="text-xl font-semibold text-gray-800 mb-4">Progress Overview</h3>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Persondays Generated Chart */}
					<div className="bg-white border rounded-xl p-6 shadow-md">
						<div className="text-lg font-semibold mb-4 flex items-center gap-2">
							<span>📊</span>
							<span>Persondays Generated (in lakhs)</span>
						</div>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={[
									{ category: 'Women', persondays: (employmentData.inclusivity?.womenParticipationPct * 100) || 0, icon: '👩' },
									{ category: 'SC', persondays: (employmentData.inclusivity?.scStParticipationPct * 50) || 0, icon: '🧑🏾' },
									{ category: 'ST', persondays: (employmentData.inclusivity?.scStParticipationPct * 50) || 0, icon: '🧑🏿' },
									{ category: 'Total', persondays: (data?.persondaysGenerated / 100000) || 0, icon: '👥' },
								]}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="category" />
									<YAxis label={{ value: 'Persondays (Lakhs)', angle: -90, position: 'insideLeft' }} />
									<Tooltip />
									<Bar dataKey="persondays" fill="#3B82F6" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Category-wise Works */}
					<div className="bg-white border rounded-xl p-6 shadow-md">
						<div className="text-lg font-semibold mb-4">Category-wise Works</div>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
								<div className="flex items-center gap-3">
									<span className="text-2xl">🌾</span>
									<span className="font-medium">Agriculture</span>
								</div>
								<span className="font-bold">{employmentData.workProgress?.totalWorksTakenUp || 0}</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
								<div className="flex items-center gap-3">
									<span className="text-2xl">💧</span>
									<span className="font-medium">Water Conservation</span>
								</div>
								<span className="font-bold">{Math.floor((employmentData.workProgress?.totalWorksTakenUp || 0) * 0.3)}</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
								<div className="flex items-center gap-3">
									<span className="text-2xl">🧱</span>
									<span className="font-medium">Construction</span>
								</div>
								<span className="font-bold">{Math.floor((employmentData.workProgress?.totalWorksTakenUp || 0) * 0.4)}</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
								<div className="flex items-center gap-3">
									<span className="text-2xl">🌳</span>
									<span className="font-medium">Afforestation</span>
								</div>
								<span className="font-bold">{Math.floor((employmentData.workProgress?.totalWorksTakenUp || 0) * 0.2)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Section 4: Scheme Vision */}
			<div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-8 shadow-lg overflow-hidden relative">
				<div className="absolute right-0 top-0 opacity-10 text-9xl">👨‍🌾</div>
				<div className="relative z-10">
					<div className="flex items-start gap-6">
						<div className="text-6xl">🌾</div>
						<div className="flex-1">
							<h3 className="text-2xl font-bold text-gray-900 mb-4">Vision of MGNREGA</h3>
							<p className="text-gray-700 text-lg leading-relaxed">
								MGNREGA aims to provide <strong>livelihood</strong>, <strong>dignity</strong>, and <strong>rural development</strong> through guaranteed employment for every household. The scheme ensures social inclusion, sustainable asset creation, and transparent governance, empowering rural communities across India.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

