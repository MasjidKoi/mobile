import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";

/**
 * Surface card that groups rows from the Content & Community kit (used for the
 * Contact Card and Settings Card). Renders a bordered, rounded, clipped
 * surface and inserts a hairline divider between each child.
 */
export type CardProps = ViewProps & {
  children?: ReactNode;
  className?: string;
};

export function Card({ children, className, ...props }: CardProps) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View
      className={`overflow-hidden rounded-md border border-border bg-surface${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? <View className="h-px bg-border" /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

export default Card;
