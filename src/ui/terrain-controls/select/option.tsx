import { ReactNode } from "react";

type Props<T> = {
  value: T;
  children: ReactNode;
};

export const Option = <T extends string | number>({
  value,
  children,
}: Props<T>) => {
  return <option value={String(value)}>{children}</option>;
};
