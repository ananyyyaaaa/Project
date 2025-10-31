export default function MetricCard({ title, value, subtitle, status = 'moderate', icon = '📊' }) {
	const colorMap = {
		good: 'bg-good/10 text-good border-good/30',
		moderate: 'bg-moderate/10 text-moderate border-moderate/30',
		poor: 'bg-poor/10 text-poor border-poor/30',
	}
	const color = colorMap[status] || colorMap.moderate

	return (
		<div className={`border ${color} rounded-xl p-4 flex items-start gap-3`}>
			<div className="text-2xl">{icon}</div>
			<div className="flex-1">
				<div className="text-sm uppercase tracking-wide opacity-80">{title}</div>
				<div className="text-2xl font-bold">{Number.isFinite(value) ? value.toLocaleString() : value}</div>
				{subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
			</div>
		</div>
	)
}
