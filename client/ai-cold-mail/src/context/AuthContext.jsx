import { createContext, useContext, useReducer, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

// ─── State shape ────────────────────────────
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

// ─── Reducer ────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_LOADED":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "AUTH_FAILED":
      return { ...initialState, loading: false };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return { ...initialState, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// ─── Provider ───────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: check localStorage for existing session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: "AUTH_LOADED", payload: { user, token } });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "AUTH_FAILED" });
      }
    } else {
      dispatch({ type: "AUTH_FAILED" });
    }
  }, []);

  // ─── Actions ────────────────────────────
  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    const { token } = res.data;

    localStorage.setItem("token", token);
    // We don't get full user data from OTP verification, set a minimal user
    const user = { email };
    localStorage.setItem("user", JSON.stringify(user));

    dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    ...state,
    register,
    verifyOTP,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
