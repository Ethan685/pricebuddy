import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="bg-[#0D1117] border-t border-[#30363D] py-8 mt-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">PriceBuddy</h3>
                    <p className="text-[#9BA7B4] text-sm">
                        Global Price Comparison & Cashback Platform.
                        <br />
                        Save money on every purchase.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-[#E6EDF3] mb-3">Company</h4>
                    <ul className="space-y-2 text-sm text-[#9BA7B4]">
                        <li><Link to="/about" className="hover:text-[#4F7EFF]">About Us</Link></li>
                        <li><Link to="/careers" className="hover:text-[#4F7EFF]">Careers</Link></li>
                        <li><Link to="/contact" className="hover:text-[#4F7EFF]">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-[#E6EDF3] mb-3">Legal</h4>
                    <ul className="space-y-2 text-sm text-[#9BA7B4]">
                        <li><Link to="/privacy" className="hover:text-[#4F7EFF]">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-[#4F7EFF]">Terms of Service</Link></li>
                        <li><Link to="/affiliate-disclosure" className="hover:text-[#4F7EFF]">Affiliate Disclosure</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-[#E6EDF3] mb-3">Community</h4>
                    <ul className="space-y-2 text-sm text-[#9BA7B4]">
                        <li><a href="#" className="hover:text-[#4F7EFF]">Discord</a></li>
                        <li><a href="#" className="hover:text-[#4F7EFF]">Twitter / X</a></li>
                        <li><a href="#" className="hover:text-[#4F7EFF]">Blog</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-[#30363D] text-center text-xs text-[#6E7681]">
                <p>&copy; {new Date().getFullYear()} PriceBuddy Inc. All rights reserved.</p>
                <p className="mt-2">
                    PriceBuddy participates in various affiliate programs and may earn commissions from qualifying purchases.
                </p>
            </div>
        </footer>
    );
}
