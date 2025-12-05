import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

const Profile = async () => {
    const session = await auth();

    if (!session?.user) {
        return (
            <main className="profile-page unauthorized">
                <div className="card">
                    <h2>Not Signed In</h2>
                    <p>You need to be signed in to view your profile.</p>
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    const { user } = session;

    return (
        <main className="profile-page">
            <div className="profile-header">
                <div className="avatar-container">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={120}
                            height={120}
                            className="avatar"
                        />
                    ) : (
                        <div className="avatar-fallback">
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                    )}
                    <div className="online-status" />
                </div>

                <div className="user-info">
                    <h1>{user.name || "Guest User"}</h1>
                    <p className="email">{user.email}</p>
                    <span className="role-badge">Member</span>
                </div>
            </div>

            <div className="profile-grid">
                {/* User Details Card */}
                <div className="card">
                    <h3>Account Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Full Name</span>
                            <span className="value">{user.name || "—"}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Email Address</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Account Type</span>
                            <span className="value">Standard User</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Member Since</span>
                            <span className="value">
                                {new Date().toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="card">
                    <h3>Account Actions</h3>
                    <div className="actions">
                        <Link href="/dashboard/settings" className="action-btn secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.33-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22l-1.92 3.32c-.15.25-.08.56.12.61l2.03 1.58c-.04.3-.06.61-.06.94 0 .33.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.15.25.37.36.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.44 0 .59-.22l1.92-3.32c.15-.25.08-.56-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor" />
                            </svg>
                            Edit Profile Settings
                        </Link>

                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/login" });
                            }}
                            className="w-full"
                        >
                            <button type="submit" className="action-btn danger">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor" />
                                </svg>
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Profile;