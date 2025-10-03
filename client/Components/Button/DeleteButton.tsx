import { ComponentProps } from "react";
import cx from "classnames";

interface Props extends ComponentProps<"button"> {
  onDelete: () => void;
  variant?: "link" | "button";
}

export default function DeleteButton({
  onDelete,
  children,
  variant = "link",
  className,
  ...props
}: Props) {
  const classes = cx(
    variant === "link"
      ? "text-red-600 hover:text-red-800 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      : "btn-red",
    className,
  );

  return (
    <button
      className={classes}
      type="button"
      tabIndex={-1}
      onClick={onDelete}
      {...props}
    >
      {children}
    </button>
  );
}
