import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { errorToString } from "../utils/error-utils";

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [mensajeErr, setMensajeErr] = useState<string>("");

  // Función para iniciar sesión
  const login = async (username: string, password: string) => {
    // Validar campos
    if (!username || !password) {
      setError(true);
      setMensajeErr("Por favor ingresa usuario y contraseña");
      return { success: false };
    }

    setLoading(true);
    setError(false);
    setMensajeErr("");

    try {
      const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const response = await axios.post(`${API_URL}/login/`, {
        username,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      setLoading(false);
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(true);
      setMensajeErr(errorToString(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  // Función para registrar usuario
  const register = async (userData: {
    name: string;
    lastName: string;
    username: string;
    phoneNum: string;
    email: string;
    password: string;
  }) => {
    const { name, lastName, username, phoneNum, email, password } = userData;

    // Validar campos
    if (!name || !lastName || !username || !phoneNum || !email || !password) {
      setError(true);
      setMensajeErr("Por favor ingresa todos los campos");
      return { success: false };
    }

    setLoading(true);
    setError(false);
    setMensajeErr("");

    try {
      const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';

      const requestData = {
        // Registro con campos por defecto
        username,
        password,
        email,
        
        // Registro personalizado
        nombre_usuario: username,
        correo: email,
        contrasena: password,
        nombre: name,
        apellido: lastName,
        celular: phoneNum
      };
      
      const response = await axios.post(`${API_URL}/api/usuarios/`, requestData);
      
      setLoading(false);
      
      if (response.status === 201) {
        return { success: true, data: response.data };
      } else {
        setError(true);
        setMensajeErr("Error al registrar usuario");
        return { success: false };
      }
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(true);
      setMensajeErr(errorToString(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Comprobar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Retornar las funciones y estados del hook
  return {
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    error,
    mensajeErr,
    setError,
    setMensajeErr
  };
}
