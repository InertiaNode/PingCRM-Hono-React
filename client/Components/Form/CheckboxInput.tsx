import { ComponentProps } from "react";
import cx from "classnames";

interface CheckboxInputProps extends ComponentProps<"input"> {
  label?: string;
}

export function CheckboxInput({
  label,
  name,
  className,
  ...props
}: CheckboxInputProps) {
  return (
    <label
      className="flex items-center select-none cursor-pointer"
      htmlFor={name}
    >
      <input
        id={name}
        name={name}
        type="checkbox"
        className={cx("form-checkbox mr-2", className)}
        {...props}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
