
interface RegisterProps {
    onRegister?: (name: string, lastName: string, username: string, phoneNum: string,
                email: string, password: string, dateOfCreation: Date, profilePicture: string) => void;
}

function Register() {
    return (
        <div>
        <h1>Register</h1>
        </div>
    );
    }

export default Register;