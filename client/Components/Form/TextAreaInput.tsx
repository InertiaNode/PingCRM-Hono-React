import { ComponentProps } from "react";
import cx from "classnames";

interface TextAreaInputProps extends ComponentProps<"textarea"> {
  error?: string;
}

export default function TextAreaInput({
  name,
  className,
  error,
  ...props
}: TextAreaInputProps) {
  return (
    <textarea
      id={name}
      name={name}
      {...props}
      aria-invalid={!!error}
      className={cx("form-textarea", className)}
    />
  );
}
