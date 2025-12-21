import { CheckCircle, Mail } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  showEmailIcon?: boolean;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, showEmailIcon = false }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
      {showEmailIcon ? (
        <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      )}
      <p className="text-green-700 text-sm">{message}</p>
    </div>
  );
};

export default SuccessMessage;
