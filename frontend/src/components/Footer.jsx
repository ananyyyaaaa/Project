export default function Footer() {
	return (
		<footer className="bg-gray-900 text-white mt-12 border-t-4 border-blue-600">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
					<div>
						<h3 className="text-lg font-semibold mb-4 text-blue-400">About MGNREGA</h3>
						<p className="text-gray-300 text-sm leading-relaxed">
							The Mahatma Gandhi National Rural Employment Guarantee Act is a social security measure that aims to guarantee the 'right to work' and ensure livelihood security in rural areas.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h3>
						<ul className="space-y-2 text-gray-300 text-sm">
							<li><a href="https://nrega.nic.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">Official Website</a></li>
							<li><a href="https://nrega.nic.in/Guidelines/Guideline_index.html" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">Guidelines & Rules</a></li>
							<li><a href="https://nrega.nic.in/Netnrega/dynamic2/statewise_report_physical.aspx" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">Annual Reports</a></li>
							<li><a href="https://nrega.nic.in/Netnrega/dynamic2/contact.aspx" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">Contact Us</a></li>
						</ul>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-4 text-blue-400">Contact Information</h3>
						<ul className="space-y-2 text-gray-300 text-sm">
							<li>📧 Email: info@mgnrega.gov.in</li>
							<li>📞 Helpline: 1800-11-4477</li>
							<li>📍 Address: Government of India</li>
							<li>🌐 Website: www.nrega.nic.in</li>
						</ul>
					</div>
				</div>
				<div className="border-t border-gray-700 pt-6 mt-6">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-gray-400 text-sm">
							© {new Date().getFullYear()} Government of India. All rights reserved.
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-400">
							<span>🇮🇳</span>
							<span>Made with ❤️ for Rural India</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

