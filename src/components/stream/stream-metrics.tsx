// src/components/stream/stream-metrics.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stream } from '@/types';
import { Activity, Zap, Monitor } from 'lucide-react';

interface StreamMetricsProps {
  stream: Stream;
}

export function StreamMetrics({ stream }: StreamMetricsProps) {
  const metrics = stream.metrics || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Bitrate</span>
            </div>
            <p className="text-2xl font-bold">
              {metrics.bitrate ? `${(metrics.bitrate / 1000).toFixed(1)}k` : 'N/A'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm">FPS</span>
            </div>
            <p className="text-2xl font-bold">{metrics.fps || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span className="text-sm">Resolution</span>
            </div>
            <p className="text-2xl font-bold">{metrics.resolution || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
