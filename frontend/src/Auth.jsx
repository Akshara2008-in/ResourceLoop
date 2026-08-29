import { useState } from "react";
import { supabase } from "./supabase";

function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const { error } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                setMessage("Login successful!");

            } else {
                // Sign up
                const { data, error } =
                    await supabase.auth.signUp({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                if (data.user) {
                    setMessage(
                        "Account created successfully!"
                    );
                }
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setMessage("");
        setEmail("");
        setPassword("");
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h2>
                    {isLogin
                        ? "Login to ResourceLoop"
                        : "Create Account"}
                </h2>

                <form onSubmit={handleAuth}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                            ? "Login"
                            : "Sign Up"}
                    </button>

                </form>

                {message && (
                    <p className="auth-message">
                        {message}
                    </p>
                )}

                <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                >
                    {isLogin
                        ? "Create a new account"
                        : "Already have an account? Login"}
                </button>

            </div>

        </div>
    );
}

export default Auth;