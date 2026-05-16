import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...rest} />;
}

export function Section({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-16 sm:py-24 relative", className)} {...rest} />;
}
