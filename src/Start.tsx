import { useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "./components/ui/navigation-menu";
function Start() {

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    }

    const handleAbout = () => {
        navigate("/about");
    }

    const handleRegister = () => {
        navigate("/login", {state: {isLoginView: false}});
    }

    const handleStart = () => {
        navigate("/start");
    }

    return (
        <div className="w-full min-h-screen flex flex-col bg-myBlack text-white">

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
            <main className="flex-grow flex flex-col justify-center items-center px-4">
                <section className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">FriendlyBet</h1>
                    <h2 className="text-xl md:text-2xl text-gray-300">¡Apuesta con tus amigos!</h2>
                </section>

                <div className="space-y-4 md:space-x-4 justify-start lg:justify-between">
                    <Button 
                        variant="login" 
                        radius="full" 
                        size="lg" 
                        className="w-full md:w-auto min-w-[200px]" 
                        onClick={handleLogin}
                    >
                        Iniciar sesión
                    </Button>
                    
                    <Button 
                        variant="yellowBorder" 
                        radius="full" 
                        size="lg" 
                        className="w-full md:w-auto min-w-[200px]" 
                        onClick={handleRegister}
                    >
                        Registrarse
                    </Button>
                </div>
            </main>
        </div>
    );
}

export default Start;