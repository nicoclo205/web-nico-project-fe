import React, { useEffect, useState } from 'react';
import './index.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
    onRegister?: (name: string, lastName: string, username: string, phoneNum: string,
                email: string, password: string) => void;
}

function Register({onRegister}: RegisterProps) {
    const navigate = useNavigate();
    const [name, setName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [phoneNum, setPhoneNum] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    //Animacion
    const [isVisible, setIsVisible] = useState<boolean>(false)

    useEffect(() => {
          setTimeout(() => setIsVisible(true), 200)
        }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(e.target.value)
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    };

    const handlePhoneNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNum(e.target.value)
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    };

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        try {
            // Incluir campos para ambos modelos (User y Usuario)
            const userData = {
                // Campos para el modelo User de Django
                username: username,     // Añadir este campo
                password: password,     // Añadir este campo
                email: email,           // Añadir este campo
                
                // Campos para tu modelo Usuario personalizado
                nombre_usuario: username,
                correo: email,
                contrasena: password,
                nombre: name,
                apellido: lastName,
                celular: phoneNum
                // fecha_registro and puntos_totales will likely be handled by the backend
            };
            
            const response = await axios.post(`${API_URL}/api/usuarios/`, userData);
            
            if (response.status === 201) {
                // Si la respuesta es exitosa
                if (onRegister) {
                    onRegister(name, lastName, username, phoneNum, email, password);
                }
                // Redirigir al usuario a la página de inicio de sesión o dashboard
                navigate('/login');
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            // Aquí podrías manejar errores específicos y mostrarlos al usuario
        }
    };

    const handleLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/login');
    }

    return (
        <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans p-4">
            
            <div className={`w-full lg:w-[85vw] lg:h-[85vh] rounded-3xl bg-myGray flex flex-col lg:flex-row justify-between items-center p-2 sm:p-4 will-change-transform will-change-opacity 
                transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>

                {/* Image section - hidden on small screens, modified on medium, full on large */}
                <div className="hidden md:block md:w-full lg:w-1/2 md:h-64 lg:h-full overflow-hidden rounded-3xl">
                    <img 
                        src="imagen_prueba.jpeg" 
                        alt="Imagen del registro" 
                        className="w-full h-full rounded-3xl object-cover md:object-top lg:object-center" 
                    />
                </div>
                
                <section className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center py-8 px-4">
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
                        <button className="bg-myBlue w-full max-w-xs sm:max-w-sm md:w-44 h-12 rounded-full mb-4 font-semibold hover:bg-blue-200" onClick={handleSubmit}>Registrarse</button>
                        
                        <p className="text-gray-500 text-sm text-center">¿Tienes una cuenta? 
                            <a href="" onClick={handleLogin} className="text-blue-500 hover:text-blue-200"> Inicia sesión</a>
                        </p>
                    </section>
                </section>
                
            </div>
        </div>
    );
}

export default Register;