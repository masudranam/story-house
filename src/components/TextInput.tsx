import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TextInputProps {
  type?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  toggleVisibility?: boolean; // enable eye icon if password
   disabled?: boolean;
}

const TextInput = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  toggleVisibility = false,
  disabled = false,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === 'password' && toggleVisibility ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled = {disabled}
        required={required}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
      />
      {type === 'password' && toggleVisibility && (
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default TextInput;
