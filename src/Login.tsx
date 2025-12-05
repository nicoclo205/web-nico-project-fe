import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from "./components/BackButton";
import MensajeError from "./components/mensajeError";
import { useAuth } from "./hooks/useAuth";
import './index.css';

function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);
  const { 
    login, 
    register, 
    loading, 
    error, 
    mensajeErr, 
    setError, 
    setMensajeErr 
  } = useAuth();

  // Obtenemos el estado de la ubicación actual
  const location = useLocation();
  const initialLoginView = location.state?.isLoginView !== undefined 
    ? location.state.isLoginView 
    : true;
    
  //cambiar entre el login y el registro
  const [isLoginView, setIsLoginView] = useState<boolean>(initialLoginView);
  
  // Inicio de sesión estados
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  
  // Registro estados
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [phoneNum, setPhoneNum] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  //cambiar entre el login y el registro
  const toggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    // Añadir clase al body para la transición
    document.body.classList.add('form-transitioning');
    
    // Hacer la transición después de un pequeño delay
    setTimeout(() => {
      setIsLoginView(!isLoginView);
      
      // Quitar la clase después de completar la transición
      setTimeout(() => {
        document.body.classList.remove('form-transitioning');
      }, 500);
    }, 50);
  };

  // Inicio de sesión
  const handleLoginUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginUsername(e.target.value);
  };

  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const result = await login(loginUsername, loginPassword);
    
    if (result?.success) {
      navigate("/homepage");
    }
  };

  // Registro de usuario
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

    const userData = {
      nombre: name,
      apellido: lastName,
      nombre_usuario: username,
      celular: phoneNum,
      correo: email,
      contrasena: password,

      username: username,
      password: password,
      email: email
    };

    const result = await register(userData);

    if (result?.success) {
      // Limpiar los campos del formulario
      setName("");
      setLastName("");
      setUsername("");
      setPhoneNum("");
      setEmail("");
      setPassword("");

      // Después de registrarse, cambia a la vista de inicio de sesión
      setIsLoginView(true);
    }
  };

  //Control de errores
  let componenteError;

  if (error){
    componenteError = <MensajeError mensaje={mensajeErr} />;
  } else {
    componenteError = null;
  }

  return (
    <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans p-4">

      {/* Boton hacia atrás */}
      <div className="absolute w-full h-full flex justify-start items-start p-5 text-white">
        <BackButton onClick={() => navigate("/Start")} />
      </div>

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
        <div className="w-full lg:w-full h-full flex flex-col lg:flex-row justify-between overflow-hidden">
          
          {/* Login Form */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center items-center py-8 px-4 transition-all duration-500 lg:duration-300 ease-in-out 
            ${isLoginView ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 lg:opacity-0 translate-x-full sm:translate-x-full md:translate-x-full lg:translate-x-0 absolute lg:relative pointer-events-none'}`}>
            <div className="text-white text-xl sm:text-2xl mb-8 lg:mb-16 font-bold text-center">
              <h1>{t('auth:title')}</h1>
            </div>

            <section className="w-full max-w-md flex flex-col items-center">
              {componenteError}
            </section>

            <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">
              <input 
                type="text" 
                placeholder={t('auth:username')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleLoginUsernameChange}
                value={loginUsername} 
              />
              
              <input 
                type="password" 
                placeholder={t('auth:password')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black" 
                onChange={handleLoginPasswordChange}
                value={loginPassword} 
              />
            </section>

            <section className="w-full max-w-md flex flex-col items-center mt-6">
              <Button 
                variant="login" 
                size="lg" 
                radius="full"
                className="max-w-xs sm:max-w-sm md:w-56 h-11"
                onClick={handleLoginSubmit}
                disabled={loading}
              >
                {loading ? t('common:loading') : t('auth:loginButton')}
              </Button>

              <p className="text-gray-500 text-sm text-center mt-4">
                {t('auth:noAccount')} 
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    toggleView(e); 
                    setError(false); 
                    setMensajeErr("") 
                  }} 
                  className="text-blue-500 hover:text-blue-200"
                > 
                  {t('auth:signUp')}
                </a>
              </p>
            </section>
          </div>

          {/* Register Form */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center items-center py-8 px-4 transition-all duration-500 lg:duration-300 ease-in-out 
            ${!isLoginView ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 lg:opacity-0 -translate-x-full sm:-translate-x-full md:-translate-x-full lg:translate-x-0 absolute lg:relative pointer-events-none'}`}>
            <div className="text-white text-xl sm:text-2xl mb-8 lg:mb-16 font-bold text-center">
              <h1>{t('auth:registerTitle')}</h1>
            </div>

            <section className="w-full max-w-md flex flex-col items-center">
              {componenteError}
            </section>
            
            <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">
              <input 
                type="text" 
                placeholder={t('auth:name')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleNameChange}
                value={name} 
              />
                
              <input 
                type="text" 
                placeholder={t('auth:lastName')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleLastNameChange}
                value={lastName} 
              />
                
              <input 
                type="text" 
                placeholder={t('auth:username')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleUsernameChange}
                value={username} 
              />
                
              <input 
                type="text" 
                placeholder={t('auth:phone')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handlePhoneNumChange}
                value={phoneNum} 
              />
                
              <input 
                type="email" 
                placeholder={t('auth:email')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handleEmailChange}
                value={email} 
              />
                
              <input 
                type="password" 
                placeholder={t('auth:password')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={handlePasswordChange}
                value={password} 
              />
            </section>
            
            <section className="w-full max-w-md flex flex-col items-center mt-2">
              <Button 
                variant="login" 
                size="lg" 
                radius="full"
                className="max-w-xs sm:max-w-sm md:w-56 h-11"
                onClick={handleRegisterSubmit}
                disabled={loading}
              >
                {loading ? t('common:loading') : t('auth:registerButton')}
              </Button>
              
              <p className="text-gray-500 text-sm text-center mt-4">
                {t('auth:hasAccount')} 
                <a 
                  href="#" 
                  onClick={(e)=> {
                    e.preventDefault();
                    toggleView(e); 
                    setError(false); 
                    setMensajeErr("")
                  }} 
                  className="text-blue-500 hover:text-blue-200"
                > 
                  {t('auth:signIn')}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;