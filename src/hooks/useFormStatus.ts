"use client";

import { useState } from "react";

export function useFormStatus() {
  const [pending, setPending] = useState(false);
  return { pending, setPending };
}
