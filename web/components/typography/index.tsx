import { cn } from "@/lib/utils";

interface TypographyProps {
  className?: string;
  children: React.ReactNode;
}

export function H1({ className, children }: TypographyProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-bold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children }: TypographyProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children }: TypographyProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function H4({ className, children }: TypographyProps) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h4>
  );
}

export function Lead({ className, children }: TypographyProps) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function Body({ className, children }: TypographyProps) {
  return (
    <p className={cn("text-base leading-7 text-foreground", className)}>
      {children}
    </p>
  );
}

export function Muted({ className, children }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function Code({ className, children }: TypographyProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm text-foreground",
        className
      )}
    >
      {children}
    </code>
  );
}
