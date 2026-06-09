// src/app/(dashboard)/stream/setup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStreams } from '@/lib/hooks/use-streams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Video, MessageSquare, Eye, Settings, ArrowRight } from 'lucide-react';

const streamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  isChatEnabled: z.boolean().default(true),
  isPublic: z.boolean().default(true),
});

type StreamFormData = z.infer<typeof streamSchema>;

export default function StreamSetupPage() {
  const router = useRouter();
  const { createStream } = useStreams();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StreamFormData>({
    resolver: zodResolver(streamSchema),
    defaultValues: {
      isChatEnabled: true,
      isPublic: true,
    },
  });

  const isChatEnabled = watch('isChatEnabled');
  const isPublic = watch('isPublic');

  const onSubmit = async (data: StreamFormData) => {
    createStream(data, {
      onSuccess: (stream) => {
        router.push(`/stream/${stream.id}`);
      },
    });
  };

  const features = [
    {
      icon: Video,
      title: 'HD Streaming',
      description: 'Stream in up to 1080p 60fps with low latency',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Interact with your audience in real-time',
    },
    {
      icon: Eye,
      title: 'Analytics',
      description: 'Track viewers, engagement, and stream health',
    },
    {
      icon: Settings,
      title: 'Full Control',
      description: 'Manage your stream settings on the fly',
    },
  ];

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Your Streaming Journey
            </h1>
            <p className="text-xl text-muted-foreground">
              Let get you set up to go live in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setStep(2)}
              className="px-8"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Create Your First Stream</CardTitle>
            <CardDescription>
              Set up your stream details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Welcome Stream - Getting Started!"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers what your stream is about..."
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Stream Settings</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow viewers to chat during your stream
                    </p>
                  </div>
                  <Switch
                    checked={isChatEnabled}
                    onCheckedChange={(checked) => setValue('isChatEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Stream</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your stream visible to everyone
                    </p>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={(checked) => setValue('isPublic', checked)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Stream
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
