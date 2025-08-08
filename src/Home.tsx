import React, { useState } from "react";

function Home() {
    // Estado para controlar qué sección es visible en móvil
    const [showRedSection, setShowRedSection] = useState<boolean>(false);

    // Función para cambiar entre secciones con transición
    const toggleView = (e: React.MouseEvent) => {
        e.preventDefault();
        // Añadir clase para la transición
        document.body.classList.add('section-transitioning');
        
        // Hacer la transición después de un pequeño delay
        setTimeout(() => {
            setShowRedSection(!showRedSection);
            
            // Quitar la clase después de completar la transición
            setTimeout(() => {
                document.body.classList.remove('section-transitioning');
            }, 500);
        }, 50);
    };

    return (
        <div className="w-full min-h-screen flex flex-col justify-start bg-myBlack text-white">
            
            <header className="w-full h-16 flex items-center justify-around p-4 bg-purple-500">

                {/* Botón de toggle para móvil */}
                <button 
                    onClick={toggleView} 
                    className="md:hidden px-4 py-2 bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    {showRedSection ? 'Ver partidos' : 'Ver grupos'}
                </button>

                <h1 className="text-2xl font-semibold">Página principal</h1>
                
                
            </header>

            <main className="flex items-center justify-between w-full bg-green-500">

                {/* Barra lateral de iconos - solo visible en desktop */}
                <div className="hidden lg:block w-20 h-auto bg-blue-500">
                    <aside className="flex flex-col items-center justify-center h-full">
                    icono
                    </aside>
                </div>

                {/* Contenedor principal centrado */}
                <div className="w-full h-[90.8vh] flex flex-col md:flex-row bg-yellow-500">
                    {/* Contenido partidos y busqueda de partidos */}
                    <section className={`
                        transition-all duration-500 ease-in-out
                        w-full lg:w-7/12 h-full
                        ${showRedSection ? 'hidden lg:block' : 'block'}
                    `}>
                        <div className="h-full w-full bg-myGray rounded-3xl flex justify-center items-center">
                            <span className="text-xl">Cuadro Gris</span>
                        </div>
                    </section>

                    {/* Grupos y buscador de grupos */}
                    <section className={`
                        transition-all duration-500 ease-in-out
                        w-full lg:w-5/12 h-full
                        ${showRedSection ? 'block' : 'hidden lg:block'}
                    `}>
                        <div className="h-full w-full bg-red-500 rounded-3xl flex justify-center items-center">
                            <span className="text-xl">Cuadro Rojo</span>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Home;