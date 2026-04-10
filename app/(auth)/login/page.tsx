import Image from "next/image";
import { LoginForm } from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center group">
            <Image
              alt="Logo"
              className="h-10 w-10 pixel-crisp"
              height={40}
              src="/logo_.png"
              width={40}
            />
            <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
              Athena
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image src="/auth.jpeg" alt="Athena" fill className="object-cover" />
      </div>
    </div>
  );
}
