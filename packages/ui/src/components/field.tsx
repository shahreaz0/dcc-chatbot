"use client";

import * as React from "react";
import { cn } from "@dcc-chatbot/ui/lib/utils";

function Field({
  className,
  "data-invalid": dataInvalid,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { "data-invalid"?: boolean }) {
  return (
    <div
      data-slot="field"
      data-invalid={dataInvalid}
      className={cn("grid gap-1.5", className)}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="field-label"
      className={cn("font-medium text-xs text-foreground leading-none select-none", className)}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  errors,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  errors?: Array<{ message?: string } | undefined | null>;
}) {
  const errorMessage =
    children ||
    errors
      ?.map((e) => e?.message)
      .filter(Boolean)
      .join(", ");

  if (!errorMessage) return null;

  return (
    <p
      data-slot="field-error"
      className={cn("font-medium text-xs text-destructive", className)}
      {...props}
    >
      {errorMessage}
    </p>
  );
}

export { Field, FieldLabel, FieldDescription, FieldError };
