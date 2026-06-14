'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAppDispatch } from '@/types/redux-type';
import { register as registerThunk } from '@/lib/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerThunk({
        ...data,
        phone: data.phone || undefined
      })).unwrap();
      router.push('/'); // redirect sau khi register thành công
    } catch (err: any) {
      alert(err || 'Registration failed');
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - image/background */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://thietbimayanh.com/wp-content/uploads/2024/11/thiet-ke-phong-livestream-game-2.png" // đổi thành ảnh nền của bạn
          alt="NeonStream"
          className="object-cover w-full h-full"
        />
        <div className="absolute left-12 top-1/4 text-white max-w-xs">
          <h1 className="text-4xl font-bold mb-2">The Future <span className="text-cyan-400">Is Broadcast</span></h1>
          <p className="text-gray-300 text-sm">
            Step into the neon light. Join the most advanced streaming community where high-fidelity performance meets cinematic aesthetics.
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex flex-col w-full md:w-1/2 justify-center items-center bg-[#0f0f0f] p-8">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="text-gray-400 text-sm mb-2 inline-block">← BACK</Link>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm">Your journey into the nocturnal network begins here.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Elias Vance"
                {...registerField('fullName')}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  placeholder="@neon_knight"
                  {...registerField('username')}
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
                />
                {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  {...registerField('phone')}
                  className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="vance@neonstream.com"
                {...registerField('email')}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-300">Security Key</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...registerField('password')}
                className="bg-[#1a1a1a] border-gray-700 text-white placeholder-gray-500"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

  

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white">
              CREATE ACCOUNT
            </Button>
          </form>

          <p className="text-gray-400 text-center text-sm">
            Already a member? <Link href="/login" className="text-cyan-400 hover:underline">LOG IN</Link>
          </p>

      
        </div>
      </div>
    </div>
  );
}