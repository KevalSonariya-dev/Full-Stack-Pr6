import { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken as saveToken, removeToken, getMe, loginUser, registerUser } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(getToken());
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const currentToken = getToken();
            if (currentToken) {
                try {
                    const userData = await getMe();
                    setUser(userData);
                    setTokenState(currentToken);
                } catch {
                    // Token invalid or expired
                    removeToken();
                    setUser(null);
                    setTokenState(null);
                }
            } else {
                setUser(null);
                setTokenState(null);
            }
            setLoading(false);
        };

        verifyAuth();

        const handleUnauthorized = () => {
            setUser(null);
            setTokenState(null);
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, []);

    const login = async (email, password) => {
        const data = await loginUser({ email, password });
        if (data.token) {
            saveToken(data.token);
            setTokenState(data.token);
            setUser(data.user || { email });
        }
        return data;
    };

    const register = async (email, password) => {
        return await registerUser({ email, password });
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setTokenState(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
