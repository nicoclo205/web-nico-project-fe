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

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        
        try {
            const userData = {
                name,
                lastName,
                username,
                phoneNum,
                email,
                password
            };
            
            const response = await axios.post(`${API_URL}/users/register`, userData);
            
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
        <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans">
            
            <div className={`w-[85vw] h-[85vh] rounded-3xl bg-myGray flex justify-between items-center p-2 will-change-transform will-change-opacity 
                transition-all duration-500 ease-out
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`}>

            <img src="imagen_prueba.jpeg" alt="Imagen del registro" className="w-1/2 h-full rounded-3xl" />
                
                <section className="w-1/2 h-full flex flex-col justify-center items-center">
                    <div className="text-white text-2xl mb-16 font-bold">
                        <h1>¡Regístrate en FriendlyBet!</h1>
                    </div>
                    
                    <section className="text-white font-sans w-96 flex flex-col justify-around py-5 items-center">
                        <input type="text" placeholder="Nombre" 
                            className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black mb-2"
                            onChange={handleNameChange}
                            value={name} />
                            
                        <input type="text" placeholder="Apellido" 
                            className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black mb-2"
                            onChange={handleLastNameChange}
                            value={lastName} />
                            
                        <input type="text" placeholder="Usuario" 
                            className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black mb-2"
                            onChange={handleUsernameChange}
                            value={username} />
                            
                        <input type="text" placeholder="Número de celular" 
                            className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black mb-2"
                            onChange={handlePhoneNumChange}
                            value={phoneNum} />
                            
                        <input type="email" placeholder="Correo electrónico" 
                            className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black mb-2"
                            onChange={handleEmailChange}
                            value={email} />
                            
                        <input type="password" placeholder="Contraseña" 
                            className="border-spacing-2 rounded-xl h-8 w-80 p-2 text-black mb-2"
                            onChange={handlePasswordChange}
                            value={password} />
                    </section>
                    
                    <section className="w-96 flex flex-col items-center mt-2">
                        <button className="bg-myBlue w-44 h-10 rounded-full mb-4 font-semibold hover:bg-blue-200" onClick={handleSubmit}>Registrarse</button>
                        
                        <p className="text-gray-500 text-sm">¿Tienes una cuenta? 
                            <a href="" onClick={handleLogin} className="text-blue-500 hover:text-blue-200"> Inicia sesión</a>
                        </p>
                    </section>
                </section>
                
            </div>
        </div>
    );
}

export default Register;