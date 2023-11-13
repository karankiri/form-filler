import React from "react";

export function TypographyH2({
  children
}) {
  return (
    <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight mt-0">
      {children}
    </h2>
  )
}

export function TypographyH3({
  children
}) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-0">
      {children}
    </h3>
  )
}

export function TypographyP({
  children
}) {
  return (
    <p className="leading-7 [&:not(:first-child)]:mt-6">
      {children}
    </p>
  )
}
