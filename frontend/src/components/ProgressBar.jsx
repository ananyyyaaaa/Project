export default function ProgressBar({ value, max = 100 }) {
	const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
	return (
		<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
			<div className="h-3 bg-blue-600 transition-all duration-1000" style={{ width: `${pct}%` }} />
		</div>
	)
}

