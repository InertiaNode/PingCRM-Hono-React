import { ComponentProps } from "react";
import cx from "classnames";

interface TextInputProps extends ComponentProps<"input"> {
  error?: string;
}

export default function TextInput({
  name,
  className,
  error,
  ...props
}: TextInputProps) {
  return (
    <input
      id={name}
      name={name}
      {...props}
      aria-invalid={!!error}
      className={cx("form-input", className)}
    />
  );
}
