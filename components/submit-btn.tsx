import React from "react";
import { useFormStatus } from "react-dom";
import { ReturnIcon } from "./ui/icons";

export default function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="key key-signal w-full justify-center disabled:opacity-60 sm:w-auto"
      disabled={pending}
    >
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          sending…
        </>
      ) : (
        <>
          send message <ReturnIcon />
        </>
      )}
    </button>
  );
}
