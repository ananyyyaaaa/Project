import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Home() {
	const [districts, setDistricts] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selected, setSelected] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		async function load() {
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
		load()
	}, [])

	function go() {
		if (selected) {
			navigate(`/dashboard/${encodeURIComponent(selected)}`)
		}
	}

	return (
		<div className="max-w-3xl mx-auto p-6">
			<h1 className="text-2xl md:text-3xl font-bold mb-6">MGNREGA Dashboard – Manipur</h1>
			<div className="bg-white border border-gray-200 rounded-xl p-4">
				<label className="block text-sm font-medium mb-2">Select District</label>
				<div className="flex gap-3">
					<select className="border rounded-lg p-2 flex-1" value={selected} onChange={(e) => setSelected(e.target.value)}>
						<option value="">{loading ? 'Loading…' : 'Choose a district'}</option>
						{districts.map((d) => (
							<option key={d} value={d}>{d}</option>
						))}
					</select>
					<button onClick={go} disabled={!selected} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">View Dashboard</button>
				</div>
				{error && <div className="text-sm text-red-600 mt-2">{error}</div>}
			</div>
			<div className="mt-6 text-sm opacity-70">Data source: data.gov.in (MGNREGA datasets)</div>
		</div>
	)
}
