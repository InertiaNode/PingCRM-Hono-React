import { ComponentProps } from "react";
import cx from "classnames";

interface SelectInputProps extends ComponentProps<"select"> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function SelectInput({
  name,
  error,
  options = [],
  placeholder,
  className,
  ...props
}: SelectInputProps) {
  return (
    <select
      id={name}
      name={name}
      {...props}
      aria-invalid={!!error}
      className={cx("form-select", className)}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options?.map(({ value, label }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
