export default function Register() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-lg">
            <div className="glass-card rounded-lg p-xl w-full max-w-md">
                <h2 className="font-display-lg text-center mb-xl">Create Account</h2>
                <div className="space-y-lg">
                    <div>
                        <label className="text-label-sm mb-2 block">Full Name</label>
                        <input className="w-full p-md rounded-lg bg-surface-container border border-white/10" placeholder="Enter your full name" />
                    </div>
                    <div>
                        <label className="text-label-sm mb-2 block">Stellar Address</label>
                        <input className="w-full p-md rounded-lg bg-surface-container border border-white/10" placeholder="G..." />
                    </div>
                    <div>
                        <label className="text-label-sm mb-2 block">Role</label>
                        <div className="grid grid-cols-2 gap-md">
                            <button className="glass-card p-md text-center rounded-lg border-2 border-primary">Tenant</button>
                            <button className="glass-card p-md text-center rounded-lg">Landlord</button>
                          </div>
                    </div>
                    <button className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-button-text">Create Account</button>
                </div>
            </div>
        </div>
    );
}