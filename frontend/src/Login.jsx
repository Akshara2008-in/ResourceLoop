
import { useState } from "react";
import { supabase } from "./supabase";

function Login({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            if (isSignUp) {
                // =========================================
                // CREATE NEW ACCOUNT
                // =========================================

                const { data, error } =
                    await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                name: email.split("@")[0]
                            }
                        }
                    });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    setMessage(
                        "Account created successfully! You can now login."
                    );

                    setIsSignUp(false);
                    setPassword("");
                }
            } else {
                // =========================================
                // LOGIN EXISTING USER
                // =========================================

                const { data, error } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    onLogin(data.user);
                }
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                {/* HEADER */}

                <div className="login-header">
                    <div className="login-logo">
                        ♻️
                    </div>

                    <h1>ResourceLoop</h1>

                    <p>
                        Surplus Resource Exchange
                    </p>
                </div>

                {/* TITLE */}

                <div className="login-title">
                    <h2>
                        {isSignUp
                            ? "Create an account"
                            : "Welcome back"}
                    </h2>

                    <p>
                        {isSignUp
                            ? "Join ResourceLoop and start sharing."
                            : "Login to continue to ResourceLoop."}
                    </p>
                </div>

                {/* FORM */}

                <form onSubmit={handleSubmit}>

                    <div className="login-form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            minLength="6"
                            required
                        />
                    </div>

                    {/* MESSAGE */}

                    {message && (
                        <div className="login-message">
                            {message}
                        </div>
                    )}

                    {/* BUTTON */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isSignUp
                            ? "Create Account"
                            : "Login"}
                    </button>
                </form>

                {/* SWITCH LOGIN / SIGNUP */}

                <div className="login-switch">
                    {isSignUp
                        ? "Already have an account?"
                        : "Don't have an account?"}

                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setMessage("");
                        }}
                    >
                        {isSignUp
                            ? "Login"
                            : "Create Account"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Login;

