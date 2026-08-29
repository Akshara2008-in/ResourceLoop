
import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabase";
import Login from "./Login";

const API_URL = "http://localhost:5050";

function App() {
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [requestQuantities, setRequestQuantities] = useState({});

    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    const [myRequests, setMyRequests] = useState([]);
    const [myRequestsLoading, setMyRequestsLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        quantity: "",
        condition: "",
        location: ""
    });

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    useEffect(() => {
        const getSession = async () => {
            try {
                const {
                    data: { session }
                } = await supabase.auth.getSession();

                setUser(session?.user || null);
            } catch (error) {
                console.error("Auth error:", error);
            } finally {
                setCheckingAuth(false);
            }
        };

        getSession();

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // =========================================================
    // LOGIN
    // =========================================================

    const handleLogin = (loggedInUser) => {
        console.log("Logged in:", loggedInUser);
        setUser(loggedInUser);
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            setUser(null);
            setResources([]);
            setRequests([]);
            setMyRequests([]);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const userId = user?.id;

    // =========================================================
    // AUTH HEADERS
    // =========================================================

    const getAuthHeaders = async () => {
        const {
            data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
            throw new Error("You are not logged in.");
        }

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
        };
    };

    // =========================================================
    // FETCH RESOURCES
    // =========================================================

    const fetchResources = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/resources`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to fetch resources"
                );
            }

            setResources(data.resources || []);
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to load resources"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH OWNER REQUESTS
    // =========================================================

    const fetchOwnerRequests = async () => {
        if (!userId) return;

        try {
            setRequestsLoading(true);

            const headers = await getAuthHeaders();

            const response = await fetch(
                `${API_URL}/api/requests/owner/${userId}`,
                {
                    headers
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to fetch requests"
                );
            }

            setRequests(data.requests || []);
        } catch (error) {
            console.error(
                "Owner requests:",
                error
            );
        } finally {
            setRequestsLoading(false);
        }
    };

    // =========================================================
    // FETCH MY REQUESTS
    // =========================================================

    const fetchMyRequests = async () => {
        if (!userId) return;

        try {
            setMyRequestsLoading(true);

            const headers = await getAuthHeaders();

            const response = await fetch(
                `${API_URL}/api/requests/user/${userId}`,
                {
                    headers
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to fetch my requests"
                );
            }

            setMyRequests(data.requests || []);
        } catch (error) {
            console.error(
                "My requests:",
                error
            );
        } finally {
            setMyRequestsLoading(false);
        }
    };

    // =========================================================
    // LOAD DATA AFTER LOGIN
    // =========================================================

    useEffect(() => {
        if (!userId) return;

        fetchResources();
        fetchOwnerRequests();
        fetchMyRequests();
    }, [userId]);

    // =========================================================
    // RESOURCE FORM
    // =========================================================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // =========================================================
    // ADD RESOURCE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please login first.");
            return;
        }

        try {
            const headers = await getAuthHeaders();

            const response = await fetch(
                `${API_URL}/api/resources`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        user_id: user.id,
                        title: form.title,
                        description: form.description,
                        category: form.category,
                        quantity: Number(form.quantity),
                        condition: form.condition,
                        location: form.location
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to create resource"
                );
            }

            alert(
                "Resource added successfully!"
            );

            setForm({
                title: "",
                description: "",
                category: "",
                quantity: "",
                condition: "",
                location: ""
            });

            fetchResources();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // =========================================================
    // REQUEST RESOURCE
    // =========================================================

    const handleRequest = async (resourceId) => {
        if (!user) {
            alert("Please login first.");
            return;
        }

        const quantity =
            Number(
                requestQuantities[resourceId]
            ) || 1;

        try {
            const headers =
                await getAuthHeaders();

            const response = await fetch(
                `${API_URL}/api/requests`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        resource_id: resourceId,
                        quantity
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to create request"
                );
            }

            alert(
                "Resource request submitted successfully!"
            );

            setRequestQuantities({
                ...requestQuantities,
                [resourceId]: 1
            });

            fetchMyRequests();
            fetchOwnerRequests();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // =========================================================
    // APPROVE REQUEST
    // =========================================================

    const approveRequest = async (requestId) => {
        try {
            const headers =
                await getAuthHeaders();

            const response = await fetch(
                `${API_URL}/api/requests/${requestId}/approve`,
                {
                    method: "PATCH",
                    headers
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to approve request"
                );
            }

            alert(
                "Request approved successfully!"
            );

            fetchOwnerRequests();
            fetchMyRequests();
            fetchResources();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // =========================================================
    // REJECT REQUEST
    // =========================================================

    const rejectRequest = async (requestId) => {
        try {
            const headers =
                await getAuthHeaders();

            const response = await fetch(
                `${API_URL}/api/requests/${requestId}/reject`,
                {
                    method: "PATCH",
                    headers
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to reject request"
                );
            }

            alert(
                "Request rejected successfully!"
            );

            fetchOwnerRequests();
            fetchMyRequests();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // =========================================================
    // QUANTITY CONTROLS
    // =========================================================

    const increaseQuantity = (
        resourceId,
        maxQuantity
    ) => {
        const current =
            Number(
                requestQuantities[resourceId]
            ) || 1;

        if (current < maxQuantity) {
            setRequestQuantities({
                ...requestQuantities,
                [resourceId]:
                    current + 1
            });
        }
    };

    const decreaseQuantity = (
        resourceId
    ) => {
        const current =
            Number(
                requestQuantities[resourceId]
            ) || 1;

        if (current > 1) {
            setRequestQuantities({
                ...requestQuantities,
                [resourceId]:
                    current - 1
            });
        }
    };

    // =========================================================
    // AUTH CHECK SCREEN
    // =========================================================

    if (checkingAuth) {
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
                        Checking authentication...
                    </p>

                </div>
            </div>
        );
    }

    // =========================================================
    // LOGIN SCREEN
    // =========================================================

    if (!user) {
        return (
            <Login
                onLogin={handleLogin}
            />
        );
    }

    // =========================================================
    // MAIN APPLICATION
    // =========================================================

    return (
        <div className="app">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="navbar">

                <div className="navbar-brand">

                    <h1>
                        ResourceLoop
                    </h1>

                    <span>
                        Surplus Resource Exchange
                    </span>

                </div>

                <nav>

                    <a href="#home">
                        Home
                    </a>

                    <a href="#resources">
                        Resources
                    </a>

                    <a href="#add-resource">
                        Add Resource
                    </a>

                    <a href="#requests">
                        Requests
                    </a>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </nav>

            </header>

            <main>

                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    className="hero"
                    id="home"
                >

                    <div className="hero-content">

                        <span className="hero-badge">
                            ♻️ Resource Sharing
                        </span>

                        <h2>
                            Share what you have.
                            <br />
                            Find what you need.
                        </h2>

                        <p>
                            ResourceLoop connects surplus
                            resources with people who need
                            them and helps communities
                            reduce waste.
                        </p>

                        <a
                            href="#resources"
                            className="hero-button"
                        >
                            View Resources
                        </a>

                    </div>

                </section>

                {/* =================================================
                    ADD RESOURCE
                ================================================= */}

                <section
                    className="add-resource"
                    id="add-resource"
                >

                    <div className="section-heading">

                        <span className="section-label">
                            CONTRIBUTE
                        </span>

                        <h2>
                            Post a Surplus Resource
                        </h2>

                        <p>
                            Have something you don't need?
                            Share it with someone who does.
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="resource-form"
                    >

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Resource Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Unused Notebooks"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    placeholder="e.g. Stationery"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                placeholder="Describe the resource..."
                                value={form.description}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    placeholder="10"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Condition
                                </label>

                                <input
                                    type="text"
                                    name="condition"
                                    placeholder="New / Good / Used"
                                    value={form.condition}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Chennai"
                                    value={form.location}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            + Add Resource
                        </button>

                    </form>

                </section>

                {/* =================================================
                    AVAILABLE RESOURCES
                ================================================= */}

                <section
                    className="resources-section"
                    id="resources"
                >

                    <div className="section-heading">

                        <span className="section-label">
                            RESOURCE MARKETPLACE
                        </span>

                        <h2>
                            Available Resources
                        </h2>

                        <p>
                            Browse resources shared by
                            members of the community.
                        </p>

                    </div>

                    {loading && (
                        <p className="loading-message">
                            Loading resources...
                        </p>
                    )}

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        resources.length === 0 && (

                        <p className="empty-message">
                            No resources available.
                        </p>

                    )}

                    <div className="resource-grid">

                        {resources.map(
                            (resource) => (

                            <div
                                className="resource-card"
                                key={resource.id}
                            >

                                <div className="card-header">

                                    <span className="category">
                                        {resource.category}
                                    </span>

                                    <span className="status">
                                        {resource.status}
                                    </span>

                                </div>

                                <h3>
                                    {resource.title}
                                </h3>

                                <p className="description">
                                    {resource.description ||
                                        "No description provided."}
                                </p>

                                <div className="details">

                                    <p>
                                        <strong>
                                            Quantity:
                                        </strong>{" "}
                                        {resource.quantity}
                                    </p>

                                    <p>
                                        <strong>
                                            Condition:
                                        </strong>{" "}
                                        {resource.condition ||
                                            "Not specified"}
                                    </p>

                                    <p>
                                        <strong>
                                            Location:
                                        </strong>{" "}
                                        {resource.location ||
                                            "Not specified"}
                                    </p>

                                </div>

                                {Number(
                                    resource.quantity
                                ) > 0 ? (

                                    <>

                                        <div className="quantity-selector">

                                            <strong>
                                                Request Quantity:
                                            </strong>

                                            <div className="quantity-controls">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            resource.id
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {
                                                        requestQuantities[
                                                            resource.id
                                                        ] || 1
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            resource.id,
                                                            Number(
                                                                resource.quantity
                                                            )
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            className="primary-button"
                                            onClick={() =>
                                                handleRequest(
                                                    resource.id
                                                )
                                            }
                                        >
                                            Request Resource
                                        </button>

                                    </>

                                ) : (

                                    <button
                                        type="button"
                                        className="unavailable-button"
                                        disabled
                                    >
                                        Unavailable
                                    </button>

                                )}

                            </div>

                        )
                        )}

                    </div>

                </section>

                {/* =================================================
                    INCOMING REQUESTS
                ================================================= */}

                <section
                    className="requests-section"
                    id="requests"
                >

                    <div className="section-heading">

                        <span className="section-label">
                            RESOURCE OWNERS
                        </span>

                        <h2>
                            Incoming Requests
                        </h2>

                        <p>
                            Manage requests made for
                            resources you have shared.
                        </p>

                    </div>

                    {requestsLoading && (
                        <p className="loading-message">
                            Loading requests...
                        </p>
                    )}

                    {!requestsLoading &&
                        requests.length === 0 && (

                        <p className="empty-message">
                            No incoming requests yet.
                        </p>

                    )}

                    <div className="requests-list">

                        {requests.map(
                            (request) => (

                            <div
                                className="request-card"
                                key={request.id}
                            >

                                <div className="request-card-header">

                                    <div>

                                        <span className="category">
                                            {request.category ||
                                                "Resource"}
                                        </span>

                                        <h3>
                                            {request.resource_title}
                                        </h3>

                                    </div>

                                    <span
                                        className={`request-status ${request.status}`}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                                <div className="request-info">

                                    <p>
                                        <strong>
                                            Requested Quantity:
                                        </strong>{" "}
                                        {request.quantity}
                                    </p>

                                    <p>
                                        <strong>
                                            Available Quantity:
                                        </strong>{" "}
                                        {request.available_quantity}
                                    </p>

                                </div>

                                {request.status ===
                                    "pending" && (

                                    <div className="request-actions">

                                        <button
                                            type="button"
                                            className="approve-button"
                                            onClick={() =>
                                                approveRequest(
                                                    request.id
                                                )
                                            }
                                        >
                                            ✓ Approve
                                        </button>

                                        <button
                                            type="button"
                                            className="reject-button"
                                            onClick={() =>
                                                rejectRequest(
                                                    request.id
                                                )
                                            }
                                        >
                                            ✕ Reject
                                        </button>

                                    </div>

                                )}

                            </div>

                        )
                        )}

                    </div>

                </section>

                {/* =================================================
                    MY REQUESTS
                ================================================= */}

                <section
                    className="my-requests-section"
                >

                    <div className="section-heading">

                        <span className="section-label">
                            YOUR ACTIVITY
                        </span>

                        <h2>
                            My Requests
                        </h2>

                        <p>
                            Track the resources you have
                            requested.
                        </p>

                    </div>

                    {myRequestsLoading && (
                        <p className="loading-message">
                            Loading your requests...
                        </p>
                    )}

                    {!myRequestsLoading &&
                        myRequests.length === 0 && (

                        <p className="empty-message">
                            You haven't made any requests yet.
                        </p>

                    )}

                    <div className="requests-list">

                        {myRequests.map(
                            (request) => (

                            <div
                                className="request-card"
                                key={request.id}
                            >

                                <div className="request-card-header">

                                    <div>

                                        <span className="category">
                                            {request.category ||
                                                "Resource"}
                                        </span>

                                        <h3>
                                            {request.resource_title}
                                        </h3>

                                    </div>

                                    <span
                                        className={`request-status ${request.status}`}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                                <div className="request-info">

                                    <p>
                                        <strong>
                                            Quantity:
                                        </strong>{" "}
                                        {request.quantity}
                                    </p>

                                    <p>
                                        <strong>
                                            Location:
                                        </strong>{" "}
                                        {request.location ||
                                            "Not specified"}
                                    </p>

                                </div>

                            </div>

                        )
                        )}

                    </div>

                </section>

            </main>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="footer">

                <h3>
                    ResourceLoop
                </h3>

                <p>
                    Share resources. Reduce waste.
                    Build a better community.
                </p>

                <p className="footer-small">
                    © 2026 ResourceLoop
                </p>

            </footer>

        </div>
    );
}

export default App;

