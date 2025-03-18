import { useEffect, useState } from "react";
import './index.css'
import axios from 'axios';
import {useNavigate } from 'react-router-dom';

interface LoginProps {
    onLogin?: (username: string, password: string) => void;
  }      

function Login({onLogin}: LoginProps){

    const navigate = useNavigate();
    
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    //prueba animacion
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
      setTimeout(() => setIsVisible(true), 200)
    }, []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    };


    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        if (username && password) {
          try {
            const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
            
            const response = await axios.post(`${API_URL}/login/`, {
              username: username,
              password: password
            });
            
            if (response.data.token) {
              localStorage.setItem('token', response.data.token);
            }
            
            if (onLogin) {
              onLogin(username.toString(), password.toString());
            }

            navigate("/home")
            
          } catch (error) {
            console.error('Error al iniciar sesión:', error);
          }
        } else {
          console.log('Por favor ingresa usuario y contraseña');
        }
      };

      const handleRegister = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/register');
      }

    return(
        
        <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans p-4">

          <div className={`w-full lg:w-[85vw] lg:h-[85vh] rounded-3xl bg-myGray flex flex-col-reverse lg:flex-row justify-between items-center p-2 sm:p-4 will-change-transform will-change-opacity 
                transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
            
                <section className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center py-8 px-4">

                    <div className="text-white text-xl sm:text-2xl mb-8 lg:mb-16 font-bold text-center">
                        <h1>¡Bienvenido a FriendlyBet!</h1>
                    </div>

                    <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">

                        <input type="text" placeholder="Nombre de usuario" 
                        className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                        onChange={handleUsernameChange}
                        value={username} />
                        
                        <input type="password" placeholder="Contraseña" 
                        className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black" 
                        onChange={handlePasswordChange}
                        value={password} />

                    </section>

                    <section className="w-full max-w-md flex flex-col items-center mt-6">

                        <button className="bg-myBlue w-full max-w-xs sm:max-w-sm md:w-44 h-12 rounded-full mb-4 font-semibold hover:bg-blue-200" onClick={handleSubmit}>Iniciar sesión</button>

                            <p className="text-gray-500 text-sm text-center">¿Aún no tienes cuenta? 
                                <a href="" onClick={handleRegister} className="text-blue-500 hover:text-blue-200"> Regístrate</a>
                            </p>

                    </section>

                </section>

                {/* Image section - hidden on small screens, modified on medium, full on large */}
                <div className="hidden md:block md:w-full lg:w-1/2 md:h-64 lg:h-full overflow-hidden rounded-3xl">
                    <img 
                        src="imagen_prueba.jpeg" 
                        alt="Imagen del login" 
                        className="w-full h-full rounded-3xl object-cover md:object-top lg:object-center" 
                    />
                </div>

            </div>

        </div>

    );


}

export default Login