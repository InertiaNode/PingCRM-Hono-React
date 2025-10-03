import { ComponentProps } from "react";
import cx from "classnames";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "outline-primary"
  | "outline-secondary"
  | "ghost"
  | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-indigo",
  secondary: "btn-gray",
  success: "btn-green",
  danger: "btn-red",
  warning: "btn-yellow",
  "outline-primary": "btn-outline-indigo",
  "outline-secondary": "btn-outline-gray",
  ghost: "btn-ghost",
  link: "btn-link",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cx(variantClasses[variant], sizeClasses[size], className);

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
