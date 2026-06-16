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
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200),
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
      title: 'Phát Trực Tiếp HD',
      description: 'Phát trực tiếp với độ phân giải lên đến 1080p 60fps với độ trễ thấp',
    },
    {
      icon: MessageSquare,
      title: 'Chat Trực Tiếp',
      description: 'Tương tác với khán giả của bạn theo thời gian thực',
    },
    {
      icon: Eye,
      title: 'Phân Tích',
      description: 'Theo dõi người xem, mức độ tương tác và sức khỏe stream',
    },
    {
      icon: Settings,
      title: 'Kiểm Soát Toàn Diện',
      description: 'Quản lý cài đặt stream của bạn ngay lập tức',
    },
  ];

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chào Mừng Đến Với Hành Trình Phát Trực Tiếp Của Bạn
            </h1>
            <p className="text-xl text-muted-foreground">
              Hãy để chúng tôi giúp bạn thiết lập để phát trực tiếp trong vài phút
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
              Bắt Đầu
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
            <CardTitle>Tạo Stream Đầu Tiên Của Bạn</CardTitle>
            <CardDescription>
              Thiết lập chi tiết stream và tùy chọn của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu Đề Stream *</Label>
                <Input
                  id="title"
                  placeholder="Ví dụ: Stream Chào Mừng - Bắt Đầu!"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô Tả (Tùy Chọn)</Label>
                <Textarea
                  id="description"
                  placeholder="Kể cho người xem biết stream của bạn là về cái gì..."
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Cài Đặt Stream</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bật Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép người xem chat trong stream của bạn
                    </p>
                  </div>
                  <Switch
                    checked={isChatEnabled}
                    onCheckedChange={(checked) => setValue('isChatEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stream Công Khai</Label>
                    <p className="text-sm text-muted-foreground">
                      Làm cho stream của bạn hiển thị cho mọi người
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
                  Quay Lại
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Tạo Stream
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
