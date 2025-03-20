import React, { useState } from "react";
import './index.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onLogin?: (username: string, password: string) => void;
  onRegister?: (name: string, lastName: string, username: string, phoneNum: string,
              email: string, password: string) => void;
}

function Auth({ onLogin, onRegister }: AuthProps) {
  const navigate = useNavigate();
  
  // State for form view - login or register
  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  
  // Login form states
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  
  // Register form states
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [phoneNum, setPhoneNum] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Toggle between login and register views
  const toggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoginView(!isLoginView);
  };

  // Login form handlers
  const handleLoginUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginUsername(e.target.value);
  };

  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (loginUsername && loginPassword) {
      try {
        const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        const response = await axios.post(`${API_URL}/login/`, {
          username: loginUsername,
          password: loginPassword
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        if (onLogin) {
          onLogin(loginUsername.toString(), loginPassword.toString());
        }

        navigate("/home");
        
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
      }
    } else {
      console.log('Por favor ingresa usuario y contraseña');
    }
  };

  // Register form handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePhoneNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNum(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    try {
      const userData = {
        // Campos para el modelo User de Django
        username: username,
        password: password,
        email: email,
        
        // Campos para tu modelo Usuario personalizado
        nombre_usuario: username,
        correo: email,
        contrasena: password,
        nombre: name,
        apellido: lastName,
        celular: phoneNum
      };
      
      const response = await axios.post(`${API_URL}/api/usuarios/`, userData);
      
      if (response.status === 201) {
        if (onRegister) {
          onRegister(name, lastName, username, phoneNum, email, password);
        }
        // After successful registration, switch to login view
        setIsLoginView(true);
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans p-4">
      <div className="w-full lg:w-[85vw] lg:h-[85vh] rounded-3xl bg-myGray flex flex-col lg:flex-row p-2 sm:p-4 overflow-hidden relative">
        
        {/* Image Container - Fixed position, but image moves inside it */}
        <div className="hidden lg:block lg:w-1/2 h-full absolute left-1/2 transform -translate-x-1/2 top-0 overflow-visible transition-none pointer-events-none py-2 px-1.5">
          <div className={`w-full h-full transition-transform duration-1000 ease-in-out ${isLoginView ? 'translate-x-1/2' : '-translate-x-1/2'}`}>
            <img 
              src="imagen_prueba.jpeg" 
              alt="Imagen de autenticación" 
              className="w-full h-full rounded-3xl object-cover"
            />
          </div>
        </div>

        {/* Mobile Image - Only visible on md screens, hidden on lg and up */}
        <div className="hidden md:block lg:hidden w-full h-64 mb-4 overflow-hidden rounded-3xl">
          <img 
            src="imagen_prueba.jpeg" 
            alt="Imagen de autenticación" 
            className="w-full h-full rounded-3xl object-cover md:object-top"
          />
        </div>
        
        {/* Forms Container */}
        <div className="w-full lg:w-full h-full flex flex-col lg:flex-row justify-between">
          {/* Login Form */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center items-center py-8 px-4 transition-opacity duration-700 lg:duration-300 ease-in-out ${isLoginView ? 'opacity-100 z-10' : 'opacity-0 lg:opacity-0 absolute lg:relative pointer-events-none'}`}>
            <div className="text-white text-xl sm:text-2xl mb-8 lg:mb-16 font-bold text-center">
              <h1>¡Bienvenido a FriendlyBet!</h1>
            </div>

            <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">
              <input type="text" placeholder="Nombre de usuario" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleLoginUsernameChange}
                value={loginUsername} />
              
              <input type="password" placeholder="Contraseña" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black" 
                onChange={handleLoginPasswordChange}
                value={loginPassword} />
            </section>

            <section className="w-full max-w-md flex flex-col items-center mt-6">
              <button className="bg-myBlue w-full max-w-xs sm:max-w-sm md:w-44 h-12 rounded-full mb-4 font-semibold hover:bg-blue-200" 
                      onClick={handleLoginSubmit}>
                Iniciar sesión
              </button>

              <p className="text-gray-500 text-sm text-center">¿Aún no tienes cuenta? 
                <a href="#" onClick={toggleView} className="text-blue-500 hover:text-blue-200"> Regístrate</a>
              </p>
            </section>
          </div>

          {/* Register Form */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center items-center py-8 px-4 transition-opacity duration-1000 lg:duration-300 ease-in-out 
            ${!isLoginView ? 'opacity-100 z-10' : 'opacity-0 lg:opacity-0 absolute lg:relative pointer-events-none'}`}>
            <div className="text-white text-xl sm:text-2xl mb-8 lg:mb-16 font-bold text-center">
              <h1>¡Regístrate en FriendlyBet!</h1>
            </div>
            
            <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">
              <input type="text" placeholder="Nombre" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleNameChange}
                value={name} />
                
              <input type="text" placeholder="Apellido" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleLastNameChange}
                value={lastName} />
                
              <input type="text" placeholder="Usuario" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleUsernameChange}
                value={username} />
                
              <input type="text" placeholder="Número de celular" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handlePhoneNumChange}
                value={phoneNum} />
                
              <input type="email" placeholder="Correo electrónico" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleEmailChange}
                value={email} />
                
              <input type="password" placeholder="Contraseña" 
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handlePasswordChange}
                value={password} />
            </section>
            
            <section className="w-full max-w-md flex flex-col items-center mt-2">
              <button className="bg-myBlue w-full max-w-xs sm:max-w-sm md:w-44 h-12 rounded-full mb-4 font-semibold hover:bg-blue-200" 
                      onClick={handleRegisterSubmit}>
                Registrarse
              </button>
              
              <p className="text-gray-500 text-sm text-center">¿Tienes una cuenta? 
                <a href="#" onClick={toggleView} className="text-blue-500 hover:text-blue-200"> Inicia sesión</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;