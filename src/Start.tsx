import { useNavigate } from "react-router-dom";

function Start() {

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    }

    return (

        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-myBlack text-white">
        
        <section>
            <h1>FriendlyBet</h1>
            <h2>¡apuesta con tus amigos!</h2>
        </section>

            <button onClick={handleLogin}>Login</button>

        </div>
    );
}

export default Start;