import { Link } from 'react-router-dom'

export default function Header({ showBackButton = false, backTo = '/', title = 'MGNREGA Dashboard' }) {
	return (
		<header className="bg-white border-b shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 py-4">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
						<div className="text-3xl">🇮🇳</div>
						<div>
							<div className="text-xs text-gray-600 font-medium">Government of India</div>
							<div className="text-sm text-gray-800 font-semibold">{title}</div>
						</div>
					</Link>
					<div className="flex items-center gap-4">
						<div className="text-right hidden md:block">
							<div className="text-xs text-gray-500">Mahatma Gandhi National Rural Employment</div>
							<div className="text-xs text-gray-500">Guarantee Act</div>
						</div>
						{showBackButton && (
							<Link
								to={backTo}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
							>
								<span>←</span>
								<span>Back to State</span>
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

