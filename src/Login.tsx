import { useState } from "react";
import './index.css'
import App from './App.tsx'
import axios from 'axios';

interface LoginProps {
    onLogin?: (username: string, password: string) => void;
  }      

function Login({onLogin}: LoginProps){
    
    const [username, setUsername] = useState<String>("")
    const [password, setPassword] = useState<String>("")

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
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
            
            const response = await axios.post(`${API_URL}/auth/login/`, {
              username: username.toString(),
              password: password.toString()
            });
            
            if (response.data.token) {
              localStorage.setItem('token', response.data.token);
            }
            
            if (onLogin) {
              onLogin(username.toString(), password.toString());
            }
            
          } catch (error) {
            console.error('Error al iniciar sesión:', error);
          }
        } else {
          console.log('Por favor ingresa usuario y contraseña');
        }
      };

    return(
        
        <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans ">

            <div className="w-[85vw] h-[85vh] rounded-3xl bg-myGray flex justify-between items-center p-2">
            
                
                <section className="w-1/2 h-full flex flex-col justify-center items-center">

                    <div className=" text-white text-2xl mb-16 font-bold">
                        <h1>¡Bienvenido a FriendlyBet!</h1>
                    </div>

                    <section className="text-white font-sans w-96 h-32 flex flex-col justify-around py-5 items-center">

                        <input type="text" placeholder="Correo electrónico" className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black" />
                        
                        <input type="text" placeholder="Contraseña" className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black"  />

                    </section>

                    <section className="w-96 flex flex-col items-center mt-2">

                        <button className="bg-myBlue w-44 h-10 rounded-full mb-4 font-semibold hover:bg-blue-200" onClick={handleSubmit}>Iniciar sesión</button>

                            <p className="text-gray-500 text-sm">¿Aún no tienes cuenta? 
                                <a href="" className="text-blue-500 hover:text-blue-200">Regístrate</a>
                            </p>

                    </section>

                </section>

                <img src="imagen_prueba.jpeg" alt="Imagen del login" className="w-1/2 h-full rounded-3xl" />

            </div>

        </div>

    );


}

export default Login