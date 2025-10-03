interface FieldGroupProps {
  name?: string;
  label?: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}

export default function FieldGroup({
  label,
  name,
  error,
  helpText,
  children,
}: FieldGroupProps) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
      )}
      {children}
      {helpText && <div className="form-help">{helpText}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
