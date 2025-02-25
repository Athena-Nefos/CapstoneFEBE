import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
};

// Create context
export const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
    case 'USER_LOADED':
        return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
        };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
        localStorage.setItem('token', action.payload.token);
        return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
        };
    case 'REGISTER_FAIL':
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
        localStorage.removeItem('token');
        return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
        };
    case 'CLEAR_ERRORS':
        return {
        ...state,
        error: null
        };
    default:
        return state;
    }
};

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios default header with token
    const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
    };

  // Load user
    const loadUser = async () => {
    if (localStorage.token) {
        setAuthToken(localStorage.token);
    }

    try {
        const res = await axios.get('http://localhost:3001/api/auth/user');
        dispatch({ type: 'USER_LOADED', payload: res.data });
    } catch (err) {
        dispatch({ type: 'AUTH_ERROR', payload: err.response?.data?.message || 'Authentication error' });
    }
    };

  // Register user
    const register = async (formData) => {
    try {
        const res = await axios.post('http://localhost:3001/api/auth/register', formData);
        dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
        loadUser();
    } catch (err) {
        dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.message || 'Registration failed'
        });
    }
    };

  // Login user
    const login = async (formData) => {
    try {
        const res = await axios.post('http://localhost:3001/api/auth/login', formData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
        loadUser();
    } catch (err) {
        dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Login failed'
        });
    }
    };

  // Logout
    const logout = () => {
    dispatch({ type: 'LOGOUT' });
    };

  // Clear errors
    const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
    };

  // Effect to load user on mount or token change
    useEffect(() => {
    if (state.token) {
        loadUser();
    }
    }, []);

    return (
    <AuthContext.Provider
        value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearErrors
        }}
    >
        {children}
    </AuthContext.Provider>
    );
};