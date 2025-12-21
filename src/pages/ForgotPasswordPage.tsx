import { ForgotPassword } from '../components/ForgotPassword';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans p-4 relative">
      {/* Back Button */}
      <div className="absolute top-5 left-5 text-white z-10">
        <BackButton onClick={() => navigate("/login")} />
      </div>

      <ForgotPassword onBack={() => navigate("/login")} />
    </div>
  );
};
