import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-white dark:bg-zinc-950">
      <SignIn />
    </div>
  );
}
