// ToggleSwitch.tsx - Reusable component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
}) => {
  const sizeClasses = {
    sm: "w-8 h-4 after:h-3.5 after:w-3.5",
    md: "w-11 h-6 after:h-5 after:w-5",
    lg: "w-14 h-7 after:h-6 after:w-6",
  };

  return (
    <label
      className={`relative inline-flex items-center ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {label && <span className="mr-2 text-sm text-slate-300">{label}</span>}
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`${sizeClasses[size]} bg-slate-700 peer-focus:ring-2 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:transition-all peer-checked:bg-violet-600 relative ${
          disabled ? "opacity-50" : ""
        }`}
      ></div>
    </label>
  );
};

export default ToggleSwitch;
