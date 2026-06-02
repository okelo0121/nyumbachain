export default function Login() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-lg">
            <div className="glass-card rounded-lg p-xl w-full max-w-md">
                <h2 className="font-display-lg text-center mb-xl">Welcome Back</h2>
                <div className="space-y-lg">
                    <div>
                        <label className="text-label-sm mb-2 block">Stellar Address</label>
                        <input className="w-full p-md rounded-lg bg-surface-container border border-white/10" placeholder="G..." />
                    </div>
                    <button className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-button-text">Connect Wallet</button>
                </div>
            </div>
        </div>
    );
}