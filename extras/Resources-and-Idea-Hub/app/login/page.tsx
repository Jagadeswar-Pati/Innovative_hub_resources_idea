import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const justRegistered = sp.registered === "1";

  return <LoginForm bannerRegistered={justRegistered} />;
}
