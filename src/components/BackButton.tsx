
interface BackButtonProps {
  onClick: () => void;
  className?: string;
  text?: string;
}

function BackButton({ 
  onClick, 
  className = "w-10 h-10 flex justify-center items-center hover:text-myBlack hover:bg-slate-300 rounded-full transition-colors duration-300", 
  text = "←" 
}: BackButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      {text}
    </button>
  );
}

export default BackButton;