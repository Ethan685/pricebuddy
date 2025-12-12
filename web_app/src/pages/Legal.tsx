

export function Legal() {
    return (
        <div className="p-8 text-[#E6EDF3] max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Legal Information</h1>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-[#4F7EFF]">Privacy Policy</h2>
                <div className="bg-[#121A23] p-6 rounded-2xl space-y-4 text-[#9BA7B4]">
                    <p><strong>Last Updated: December 2025</strong></p>
                    <p>
                        At PriceBuddy, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Information We Collect:</strong> We collect your email address and profile information when you sign in with Google. We also track your search history and clicked products to improve our recommendations.</li>
                        <li><strong>How We Use Your Data:</strong> We use your data to provide price alerts, track cashback rewards, and generate market reports. We do not sell your personal data to third parties.</li>
                        <li><strong>Data Security:</strong> Your data is stored securely on Google Cloud Platform with industry-standard encryption.</li>
                        <li><strong>Your Rights:</strong> You can request to delete your account and all associated data at any time by contacting support@pricebuddy.com.</li>
                    </ul>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-[#4F7EFF]">Privacy Settings</h2>
                <div className="bg-[#121A23] p-6 rounded-2xl text-[#9BA7B4]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-bold mb-1">Do Not Sell My Personal Information</h3>
                            <p className="text-sm">Opt-out of data sharing with third-party advertising partners (CCPA).</p>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.setItem('pb_ccpa_optout', 'true');
                                alert('Preference saved: Unsubscribed from data sharing.');
                            }}
                            className="bg-[#30363D] hover:bg-[#161B22] border border-[#9BA7B4]/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Opt Out
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-[#4F7EFF]">Terms of Service</h2>
                <div className="bg-[#121A23] p-6 rounded-2xl space-y-4 text-[#9BA7B4]">
                    <p><strong>Last Updated: December 2025</strong></p>
                    <p>
                        By using PriceBuddy, you agree to the following terms:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Price Accuracy:</strong> While we strive for accuracy, prices on merchant sites may change rapidly. PriceBuddy is not responsible for discrepancies between our display and the final checkout price.</li>
                        <li><strong>Affiliate Disclosure:</strong> PriceBuddy participates in affiliate programs with Amazon, Coupang, and other merchants. We may earn a commission when you purchase through our links, at no extra cost to you.</li>
                        <li><strong>Cashback:</strong> Cashback rewards are subject to verification by the merchant. Fraudulent activity will result in immediate account termination.</li>
                        <li><strong>Prohibited Use:</strong> You may not use our platform for scraping, spamming, or any illegal activities.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
