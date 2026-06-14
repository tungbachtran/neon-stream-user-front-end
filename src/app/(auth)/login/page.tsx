'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAppDispatch } from '@/types/redux-type';
import { login } from '@/lib/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { toast } from 'sonner';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register: registerField, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
      router.push('/'); // redirect khi login thành công
      toast('Đăng nhập thành công');
    } catch (err: any) {
      alert(err || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
  
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - image */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-900 to-black items-center justify-center">
        <img
          src="https://thietbimayanh.com/wp-content/uploads/2024/11/thiet-ke-phong-livestream-game-2.png" // bạn có thể thay bằng ảnh của bạn
          alt="NeonStream"
          className="object-cover h-full w-full opacity-90"
        />
        <div className="absolute left-12 text-white max-w-xs">
          <h1 className="text-4xl font-bold mb-2">Authenticating <span className="text-purple-400">your pulse.</span></h1>
          <p className="text-sm text-gray-300">
            Join the next evolution of cinematic live performance. Your front row seat to the neon future awaits.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex flex-col w-full md:w-1/2 justify-center items-center bg-[#0f0f0f] p-8">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
          <p className="text-gray-400 text-center">Enter your details to sync your stream.</p>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.google className="mr-2 h-4 w-4" />}
            Continue with Google
          </Button>

          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <span className="flex-1 border-t border-gray-700"></span>
            <span>OR</span>
            <span className="flex-1 border-t border-gray-700"></span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="identifier" className="text-gray-300">Email or Phone Number</Label>
              <Input
                id="identifier"
                placeholder="Enter your credentials"
                {...registerField('identifier')}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
              />
              {errors.identifier && <p className="text-xs text-red-500">{errors.identifier.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...registerField('password')}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Sign In
            </Button>
          </form>

          <p className="text-gray-400 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-purple-500 hover:underline">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}