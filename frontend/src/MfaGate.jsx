
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

function MfaGate({ onVerified, onLogout }) {
    const [loading, setLoading] = useState(true);
    const [factorId, setFactorId] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [mode, setMode] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const initialized = useRef(false);

    // =====================================================
    // INITIALIZE MFA
    // =====================================================

    const initializeMfa = async () => {
        try {
            setLoading(true);
            setError("");

            // Check the current authentication assurance level
            const {
                data: assurance,
                error: assuranceError
            } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (assuranceError) {
                throw assuranceError;
            }

            // User has already completed MFA
            if (assurance.currentLevel === "aal2") {
                onVerified();
                return;
            }

            // Get the user's existing MFA factors
            const {
                data: factorsData,
                error: factorsError
            } = await supabase.auth.mfa.listFactors();

            if (factorsError) {
                throw factorsError;
            }

            const factors = factorsData.totp || [];

            // Check for an already verified authenticator
            const verifiedFactor = factors.find(
                (factor) => factor.status === "verified"
            );

            if (verifiedFactor) {
                setFactorId(verifiedFactor.id);
                setMode("verify");
                return;
            }

            // No verified authenticator exists.
            // Enroll a new TOTP authenticator.
            const {
                data: enrollment,
                error: enrollmentError
            } = await supabase.auth.mfa.enroll({
                factorType: "totp",
                friendlyName: "ResourceLoop Authenticator"
            });

            if (enrollmentError) {
                throw enrollmentError;
            }

            setFactorId(enrollment.id);
            setQrCode(enrollment.totp.qr_code);
            setSecret(enrollment.totp.secret);
            setMode("enroll");

        } catch (err) {
            console.error("MFA initialization error:", err);

            setError(
                err.message ||
                "Unable to initialize multi-factor authentication."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIALIZE WHEN COMPONENT LOADS
    // =====================================================

    useEffect(() => {
        if (initialized.current) {
            return;
        }

        initialized.current = true;
        initializeMfa();
    }, []);

    // =====================================================
    // VERIFY AUTHENTICATOR CODE
    // =====================================================

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(code)) {
            setError(
                "Please enter a valid 6-digit authenticator code."
            );
            return;
        }

        if (!factorId) {
            setError(
                "Authenticator factor not found. Please retry."
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            // Create an MFA challenge
            const {
                data: challenge,
                error: challengeError
            } = await supabase.auth.mfa.challenge({
                factorId
            });

            if (challengeError) {
                throw challengeError;
            }

            // Verify the authenticator code
            const {
                error: verifyError
            } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challenge.id,
                code
            });

            if (verifyError) {
                throw verifyError;
            }

            // Confirm that the session has reached AAL2
            const {
                data: assurance,
                error: assuranceError
            } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (assuranceError) {
                throw assuranceError;
            }

            if (assurance.currentLevel !== "aal2") {
                throw new Error(
                    "Authenticator verification succeeded, but the session has not reached AAL2. Please try again."
                );
            }

            // MFA successfully verified
            setCode("");
            onVerified();

        } catch (err) {
            console.error("MFA verification error:", err);

            setError(
                err.message ||
                "Authenticator verification failed. Please try again."
            );

            setCode("");

        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {
        return (
            <div className="login-page">

                <div className="login-card">

                    <div className="login-logo">
                        ♻️
                    </div>

                    <h1>
                        ResourceLoop
                    </h1>

                    <p>
                        Preparing secure authentication...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // MFA SCREEN
    // =====================================================

    return (
        <div className="login-page">

            <div className="login-card">

                {/* HEADER */}

                <div className="login-header">

                    <div className="login-logo">
                        🔐
                    </div>

                    <h1>
                        ResourceLoop
                    </h1>

                    <p>
                        Multi-Factor Authentication
                    </p>

                </div>

                {/* FIRST-TIME ENROLLMENT */}

                {mode === "enroll" && (

                    <>

                        <div className="login-title">

                            <h2>
                                Set Up Your Authenticator
                            </h2>

                            <p>
                                Scan this QR code using Google
                                Authenticator, Microsoft Authenticator,
                                or another compatible authenticator app.
                            </p>

                        </div>

                        {/* QR CODE */}

                        {qrCode && (

                            <div
                                style={{
                                    textAlign: "center",
                                    margin: "20px 0"
                                }}
                            >

                                <img
                                    src={qrCode}
                                    alt="Authenticator QR Code"
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                        maxWidth: "100%"
                                    }}
                                />

                            </div>

                        )}

                        {/* MANUAL SECRET */}

                        <div className="login-form-group">

                            <label>
                                Manual Setup Key
                            </label>

                            <input
                                type="text"
                                value={secret}
                                readOnly
                            />

                        </div>

                        <p>
                            After scanning the QR code, enter
                            the six-digit code generated by your
                            authenticator app.
                        </p>

                    </>

                )}

                {/* EXISTING AUTHENTICATOR */}

                {mode === "verify" && (

                    <div className="login-title">

                        <h2>
                            Verify Your Identity
                        </h2>

                        <p>
                            Open your authenticator app and
                            enter the current six-digit code.
                        </p>

                    </div>

                )}

                {/* AUTHENTICATOR FORM */}

                {(mode === "enroll" || mode === "verify") && (

                    <form onSubmit={handleVerify}>

                        <div className="login-form-group">

                            <label>
                                Authenticator Code
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength="6"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) =>
                                    setCode(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6)
                                    )
                                }
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={
                                submitting ||
                                code.length !== 6
                            }
                        >

                            {submitting
                                ? "Verifying..."
                                : mode === "enroll"
                                    ? "Enable Authenticator"
                                    : "Verify & Continue"}

                        </button>

                    </form>

                )}

                {/* ERROR MESSAGE */}

                {error && (

                    <div className="login-message">
                        {error}
                    </div>

                )}

                {/* RETRY */}

                {error && (

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={initializeMfa}
                        disabled={loading || submitting}
                        style={{
                            marginTop: "10px"
                        }}
                    >
                        Retry MFA Setup
                    </button>

                )}

                {/* LOGOUT */}

                <button
                    type="button"
                    className="cancel-button"
                    onClick={onLogout}
                    disabled={submitting}
                    style={{
                        marginTop: "15px"
                    }}
                >
                    Logout
                </button>

            </div>

        </div>
    );
}

export default MfaGate;
