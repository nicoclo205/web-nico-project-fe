import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "./components/ui/navigation-menu";

function About() {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  }

  const handleAbout = () => {
    navigate("/about");
  }

  const handleStart = () => {
    navigate("/start");
  }

  return (
    <div className="bg-myBlack text-white min-h-screen flex flex-col">


      {/* Barra de navegación */}
      <header className="w-full p-4 flex flex-col">

        <div className="container mx-auto flex justify-between items-center">

          <h1 className="text-2xl font-bold text-myBlue">FriendlyBet</h1>
                    
          <NavigationMenu>
                        
            <NavigationMenuList>

            <NavigationMenuItem>
                
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle({ variant: "transparent" })}
                            onClick={handleStart}>
                                    Inicio
                </NavigationMenuLink>
                            
              </NavigationMenuItem>

              <NavigationMenuItem>
                
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle({ variant: "transparent" })}
                            onClick={handleLogin}>
                                    Iniciar sesión
                </NavigationMenuLink>
                            
              </NavigationMenuItem>
                            
              <NavigationMenuItem>

                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle({ variant: "transparent" })}
                            onClick={handleAbout}>
                                    Acerca de
                </NavigationMenuLink>

              </NavigationMenuItem>

            </NavigationMenuList>

          </NavigationMenu>
          
        </div>

      </header>


      {/* Contenido principal*/}

    <main className="flex flex-col justify-center px-10 lg:px-32 flex-grow">

      <h1 className="text-3xl py-5">¿Quiénes somos?</h1>
      <p>Somos desarrolladores empezando en el mundo del desarrollo web. 
        Creamos esta aplicación web para practicar y para unir más a amigos y familiares, es para motivos de diversión. </p>
      
      <h1 className="text-3xl py-5">¿Cuál es el objetivo de FriendlyBet?</h1>
      <p>FriendlyBet es una aplicación web que permite a los usuarios crear y gestionar apuestas amistosas entre amigos y familiares. 
        El objetivo es fomentar la diversión y la interacción social a través de las apuestas.</p>
      
      <h1 className="text-3xl py-5">¿Cómo funciona?</h1>
      <p>Los usuarios pueden registrarse, iniciar sesión y crear apuestas. 
        También pueden invitar a amigos a unirse a sus apuestas y realizar un seguimiento de los resultados por medio de un ranking.</p>
      <p>Se puede apostar tanto para un torneo completo como tambien para partidos individuales.</p>
      <p>¡Crea tus propias reglas! al poder modificar los puntajes de cada estadística y modificar los premios de cada apuesta.</p>
      
      <p>¡Diviértete apostando con tus amigos!</p>
      <p>¡No olvides que es solo un juego!</p>

    </main>

      {/* Pie de página */}
      <footer className="w-full p-4 bg-gray-900 text-center mt-5">
        <p>© 2025 FriendlyBet. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}

export default About;