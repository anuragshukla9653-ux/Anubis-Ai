import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearError, setError, setLoading, setUser, clearUser } from "../auth.slice.js";
import { getMe, login, register, logout } from "../service/auth.api.js";

function getErrorMessage(error, fallbackMessage) {
    return error.response?.data?.message || fallbackMessage;
}

export function useAuth() {
    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);

    const handleRegister = useCallback(async ({ email, username, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await register({ email, username, password });

            if (data?.user) {
                dispatch(setUser(data.user));
            }

            return data;
        } catch (error) {
            const message = getErrorMessage(error, "Registration failed");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogin = useCallback(async ({ email, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await login({ email, password });

            if (data?.user) {
                dispatch(setUser(data.user));
            }

            return data;
        } catch (error) {
            const message = getErrorMessage(error, "Login failed");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const loadCurrentUser = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await getMe();

            if (data?.user) {
                dispatch(setUser(data.user));
            }

            return data;
        } catch (error) {
            const message = getErrorMessage(error, "Failed to fetch user details");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleGetMe = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await getMe();

            if (data?.user) {
                dispatch(setUser(data.user));
            }

            return data;
        } catch (error) {
            const message = getErrorMessage(error, "Failed to load user");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());
            await logout();
            dispatch(clearUser());
        } catch (error) {
            const message = getErrorMessage(error, "Logout failed");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    return {
        ...auth,
        handleRegister,
        handleLogin,
        loadCurrentUser,
        handleGetMe,
        handleLogout,
    };
}

 
