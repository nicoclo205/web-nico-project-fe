function mensajeError(props: { mensaje: string }) {
  return <div className="text-myRed w-full h-full bg-red-300 border-2 border-myRed rounded-2xl py-2 flex justify-center">{props.mensaje}</div>;
}

export default mensajeError;