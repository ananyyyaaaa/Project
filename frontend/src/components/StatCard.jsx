export default function StatCard({ title, value, icon, colorClass = '' }) {
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

