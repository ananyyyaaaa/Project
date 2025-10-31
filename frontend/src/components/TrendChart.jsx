import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TrendChart({ data }) {
	return (
		<div className="w-full h-72 bg-white rounded-xl border border-gray-200 p-4">
			<div className="text-sm uppercase tracking-wide opacity-70 mb-2">Trends</div>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="period" height={40} angle={-20} textAnchor="end" interval={Math.max(Math.floor((data?.length || 1)/6), 0)} />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
