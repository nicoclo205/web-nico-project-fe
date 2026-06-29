import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FiAward } from 'react-icons/fi';
import BackButton from "../components/BackButton";
import AlertMessage from "../components/AlertMessage";
import LanguageSelectorEnhanced from '../components/LanguageSelectorEnhanced';
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from '../config/api';
import '../index.css';

const EMAIL_RE = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

type FieldErrors = Partial<Record<
  'name' | 'lastName' | 'username' | 'phoneNum' | 'email' | 'password' | 'confirmPassword',
  string
>>;

function Auth() {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);
  const {
    login,
    register,
    loading,
    error,
    mensajeErr,
    setError,
    setMensajeErr
  } = useAuth();

  // Obtenemos el estado de la ubicación actual
  const location = useLocation();
  const initialLoginView = location.state?.isLoginView !== undefined
    ? location.state.isLoginView
    : true;

  // Read invite token from URL (?invite=TOKEN) — used by email invitations
  const searchParams = new URLSearchParams(location.search);
  const inviteToken = searchParams.get('invite') || '';
  const [inviteRoomName, setInviteRoomName] = useState<string>('');

  // If an invite token is present, switch to register view and fetch room name
  const [isLoginView, setIsLoginView] = useState<boolean>(inviteToken ? false : initialLoginView);

  React.useEffect(() => {
    if (!inviteToken) return;
    fetch(`${API_BASE_URL}/api/invitations/validate/?token=${inviteToken}`)
      .then(r => r.json())
      .then(data => { if (data.valid) setInviteRoomName(data.room_name); })
      .catch(() => {});
  }, [inviteToken]);
  // Persistido en sessionStorage para que el aviso sobreviva recargas o remontajes
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(
    () => sessionStorage.getItem('fb_reg_success') === '1'
  );
  const [registeredEmail, setRegisteredEmail] = useState<string>(
    () => sessionStorage.getItem('fb_reg_email') || ""
  );

  // Inicio de sesión estados
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  // Registro estados
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [phoneNum, setPhoneNum] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  //cambiar entre el login y el registro
  const toggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    // Añadir clase al body para la transición
    document.body.classList.add('form-transitioning');

    // Hacer la transición después de un pequeño delay
    setTimeout(() => {
      setIsLoginView(!isLoginView);

      // Quitar la clase después de completar la transición
      setTimeout(() => {
        document.body.classList.remove('form-transitioning');
      }, 500);
    }, 50);
  };

  // Inicio de sesión
  const handleLoginSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const result = await login(loginUsername, loginPassword);

    if (result?.success) {
      // Limpiar el aviso de verificación una vez logra entrar
      sessionStorage.removeItem('fb_reg_success');
      sessionStorage.removeItem('fb_reg_email');
      navigate("/homepage");
    }
  };

  // ── Validación del registro ────────────────────────────────────────────
  const validateRegister = (): FieldErrors => {
    const errs: FieldErrors = {};
    const req = t('auth:validation.required');

    if (!name.trim()) errs.name = req;
    else if (name.trim().length < 4) errs.name = t('auth:validation.nameMin');

    if (!lastName.trim()) errs.lastName = req;

    if (!username.trim()) errs.username = req;
    else if (username.trim().length < 4) errs.username = t('auth:validation.usernameMin');

    if (!phoneNum.trim()) errs.phoneNum = req;
    else if (!/^\d{10}$/.test(phoneNum.trim())) errs.phoneNum = t('auth:validation.phoneLength');

    if (!email.trim()) errs.email = req;
    else if (!EMAIL_RE.test(email.trim())) errs.email = t('auth:validation.emailInvalid');

    if (!password) errs.password = req;
    else if (password.length < 6) errs.password = t('auth:validation.passwordMin');

    if (!confirmPassword) errs.confirmPassword = req;
    else if (password && confirmPassword !== password)
      errs.confirmPassword = t('auth:validation.passwordsNoMatch');

    return errs;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Validación en el cliente antes de llamar al backend
    const errs = validateRegister();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError(true);
      setMensajeErr(t('auth:validation.fixErrors'));
      return;
    }
    setError(false);
    setMensajeErr("");

    const userData = {
      nombre: name,
      apellido: lastName,
      nombre_usuario: username,
      celular: phoneNum,
      correo: email,
      contrasena: password,

      username: username,
      password: password,
      email: email,
      ...(inviteToken ? { invite_token: inviteToken } : {}),
    };

    const result = await register(userData);

    if (result?.success) {
      // If registered via invite link, auto-join the room
      if (inviteToken) {
        try {
          await fetch(`${API_BASE_URL}/api/invitations/accept/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: inviteToken, email: email }),
          });
        } catch {
          // Non-blocking — registration still succeeded
        }
      }

      // Guardar el correo para mostrarlo en el aviso de verificación
      setRegisteredEmail(email);
      sessionStorage.setItem('fb_reg_success', '1');
      sessionStorage.setItem('fb_reg_email', email);

      // Limpiar los campos del formulario
      setName("");
      setLastName("");
      setUsername("");
      setPhoneNum("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFieldErrors({});

      // Mostrar mensaje de éxito
      setRegistrationSuccess(true);

      // Después de registrarse exitosamente, cambia a la vista de inicio de sesión
      setIsLoginView(true);
    }
    // Si hay error, result.success será false y nos quedaremos en la vista de registro
    // mostrando el mensaje de error
  };

  //Control de errores
  let componenteError;

  if (error){
    componenteError = <AlertMessage variant="error" message={mensajeErr} />;
  } else {
    componenteError = null;
  }

  // Input de registro con error por campo
  const inputClass = (field: keyof FieldErrors) =>
    `border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black ${
      fieldErrors[field] ? 'border-2 border-red-500 ring-1 ring-red-500' : ''
    }`;

  const FieldError = ({ field }: { field: keyof FieldErrors }) =>
    fieldErrors[field] ? (
      <p className="text-red-400 text-xs w-full max-w-xs sm:max-w-sm mt-1 mb-2 pl-1">
        {fieldErrors[field]}
      </p>
    ) : (
      <span className="mb-3" />
    );

  return (
    <div className="w-full min-h-screen bg-myBlack flex justify-center items-center font-sans p-4">

      {/* Boton hacia atrás */}
      <div className="absolute w-full h-full flex justify-start items-start p-5 text-white">
        <BackButton onClick={() => navigate("/Start")} />
      </div>

      <div className="w-full lg:w-[85vw] lg:h-[85vh] rounded-3xl bg-myGray flex flex-col lg:flex-row p-2 sm:p-4 overflow-hidden relative">
        {/* Language selector */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
          <LanguageSelectorEnhanced />
        </div>

        {/* Image Container - Fixed position, but image moves inside it */}
        <div className="hidden lg:block lg:w-1/2 h-full absolute left-1/2 transform -translate-x-1/2 top-0 overflow-visible transition-none pointer-events-none py-2 px-1.5">
          <div className={`w-full h-full transition-transform duration-1000 ease-in-out ${isLoginView ? 'translate-x-1/2' : '-translate-x-1/2'}`}>
            <img
              src="imagen_prueba.jpeg"
              alt={t('auth:authImage', 'Authentication image')}
              className="w-full h-full rounded-3xl object-cover"
            />
          </div>
        </div>

        {/* Mobile Image - Only visible on md screens, hidden on lg and up */}
        <div className="hidden md:block lg:hidden w-full h-64 mb-4 overflow-hidden rounded-3xl">
          <img
            src="imagen_prueba.jpeg"
            alt={t('auth:authImage', 'Authentication image')}
            className="w-full h-full rounded-3xl object-cover md:object-top"
          />
        </div>

        {/* Forms Container */}
        <div className="w-full lg:w-full h-full flex flex-col lg:flex-row justify-between overflow-hidden">

          {/* Login Form */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center items-center pt-14 pb-8 sm:py-8 px-4 transition-all duration-500 lg:duration-300 ease-in-out
            ${isLoginView ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 lg:opacity-0 translate-x-full sm:translate-x-full md:translate-x-full lg:translate-x-0 absolute lg:relative pointer-events-none'}`}>
            <div className="text-white text-xl sm:text-2xl mb-8 lg:mb-16 font-bold text-center">
              <h1>{t('auth:title')}</h1>
            </div>

            <section className="w-full max-w-md flex flex-col items-center">
              {componenteError}
              {registrationSuccess && isLoginView && (
                <div className="w-full border border-green-500/40 bg-green-500/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 font-bold text-base">
                      {t('auth:registrationSuccessTitle')}
                    </p>
                  </div>
                  <p className="text-green-200/90 text-sm leading-relaxed">
                    {t('auth:registrationSuccessDetail', { email: registeredEmail })}
                  </p>
                </div>
              )}
            </section>

            <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">
              <input
                type="text"
                placeholder={t('auth:username')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black mb-3"
                onChange={(e) => setLoginUsername(e.target.value)}
                value={loginUsername}
              />

              <input
                type="password"
                placeholder={t('auth:password')}
                className="border-spacing-2 rounded-xl h-8 w-full max-w-xs sm:max-w-sm p-2 text-black"
                onChange={(e) => setLoginPassword(e.target.value)}
                value={loginPassword}
              />
            </section>

            <section className="w-full max-w-md flex flex-col items-center mt-6">
              <Button
                variant="login"
                size="lg"
                radius="full"
                className="max-w-xs sm:max-w-sm md:w-56 h-11"
                onClick={handleLoginSubmit}
                disabled={loading}
              >
                {loading ? t('common:loading') : t('auth:loginButton')}
              </Button>

              <p className="text-gray-400 text-sm text-center mt-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/forgot-password');
                  }}
                  className="hover:text-blue-400 underline"
                >
                  Forgot password?
                </a>
              </p>

              <p className="text-gray-500 text-sm text-center mt-4">
                {t('auth:noAccount')}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleView(e);
                    setError(false);
                    setMensajeErr("")
                  }}
                  className="text-blue-500 hover:text-blue-200"
                >
                  {t('auth:signUp')}
                </a>
              </p>
            </section>
          </div>

          {/* Register Form */}
          <div className={`w-full lg:w-1/2 h-full flex flex-col justify-center items-center pt-14 pb-8 sm:py-8 px-4 transition-all duration-500 lg:duration-300 ease-in-out
            ${!isLoginView ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 lg:opacity-0 -translate-x-full sm:-translate-x-full md:-translate-x-full lg:translate-x-0 absolute lg:relative pointer-events-none'}`}>
            <div className="text-white text-xl sm:text-2xl mb-4 lg:mb-8 font-bold text-center">
              <h1>{t('auth:registerTitle')}</h1>
            </div>

            {inviteRoomName && (
              <div className="w-full max-w-md mb-4 px-4 py-3 bg-green-900/40 border border-green-500/40 rounded-xl text-center">
                <p className="text-green-400 text-sm font-medium">
                  <FiAward className="inline mr-1" />{t('rooms:invite.joinedRoom')}: <strong>{inviteRoomName}</strong>
                </p>
              </div>
            )}

            <section className="w-full max-w-md flex flex-col items-center">
              {componenteError}
            </section>

            <section className="text-white font-sans w-full max-w-md flex flex-col justify-around py-5 items-center">
              <input
                type="text"
                placeholder={`${t('auth:name')} *`}
                className={inputClass('name')}
                onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
                value={name}
              />
              <FieldError field="name" />

              <input
                type="text"
                placeholder={`${t('auth:lastName')} *`}
                className={inputClass('lastName')}
                onChange={(e) => { setLastName(e.target.value); clearFieldError('lastName'); }}
                value={lastName}
              />
              <FieldError field="lastName" />

              <input
                type="text"
                placeholder={`${t('auth:username')} *`}
                className={inputClass('username')}
                onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
                value={username}
              />
              <FieldError field="username" />

              <input
                type="text"
                inputMode="numeric"
                placeholder={`${t('auth:phone')} *`}
                className={inputClass('phoneNum')}
                onChange={(e) => { setPhoneNum(e.target.value); clearFieldError('phoneNum'); }}
                value={phoneNum}
              />
              <FieldError field="phoneNum" />

              <input
                type="email"
                placeholder={`${t('auth:email')} *`}
                className={inputClass('email')}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                value={email}
              />
              <FieldError field="email" />

              <input
                type="password"
                placeholder={`${t('auth:password')} *`}
                className={inputClass('password')}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                value={password}
              />
              <FieldError field="password" />

              <input
                type="password"
                placeholder={`${t('auth:confirmPassword')} *`}
                className={inputClass('confirmPassword')}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                value={confirmPassword}
              />
              <FieldError field="confirmPassword" />
            </section>

            <section className="w-full max-w-md flex flex-col items-center mt-2">
              <Button
                variant="login"
                size="lg"
                radius="full"
                className="max-w-xs sm:max-w-sm md:w-56 h-11"
                onClick={handleRegisterSubmit}
                disabled={loading}
              >
                {loading ? t('common:loading') : t('auth:registerButton')}
              </Button>

              <p className="text-gray-500 text-sm text-center mt-4">
                {t('auth:hasAccount')}
                <a
                  href="#"
                  onClick={(e)=> {
                    e.preventDefault();
                    toggleView(e);
                    setError(false);
                    setMensajeErr("")
                  }}
                  className="text-blue-500 hover:text-blue-200"
                >
                  {t('auth:signIn')}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
