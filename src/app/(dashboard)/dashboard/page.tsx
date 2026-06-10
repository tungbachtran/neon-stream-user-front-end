// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useStreams } from '@/lib/hooks/use-streams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Plus, Video, Users, Clock, Play, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DailyCheckInModal } from '@/components/check-in/daily-check-in-modal';
import { useAppSelector } from '@/types/redux-type';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { myStreams, isLoadingMy } = useStreams();

  const liveStream = myStreams?.find((s) => s.status === 'LIVE');
  const pastStreams = myStreams?.filter((s) => s.status === 'ENDED') || [];
  const idleStreams = myStreams?.filter((s) => s.status === 'IDLE') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
            <p className="text-muted-foreground">Manage your streams and content</p>
          </div>
          <Link href="/stream/setup">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Stream
            </Button>
          </Link>
        </div>

        {/* Live Stream Alert */}
        {liveStream && (
          <Card className="border-2 border-red-500 bg-red-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div>
                    <CardTitle>You are Live!</CardTitle>
                    <CardDescription>{liveStream.title}</CardDescription>
                  </div>
                </div>
                <Link href={`/stream/${liveStream.id}`}>
                  <Button variant="destructive">
                    <Play className="mr-2 h-4 w-4" />
                    Go to Stream
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{liveStream.viewerCount} viewers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Started {formatDistanceToNow(new Date(liveStream.startedAt!), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myStreams?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {pastStreams.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myStreams?.reduce((acc, s) => acc + s.viewerCount, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all streams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stream Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pastStreams.length > 0 ? `${pastStreams.length}h` : '0h'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total streaming time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Streams List */}
        <Tabs defaultValue="ready" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ready">
              Ready to Stream ({idleStreams.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Streams ({pastStreams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="space-y-4">
            {idleStreams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No streams ready</p>
                  <Link href="/stream/setup">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Stream
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {idleStreams.map((stream) => (
                  <Card key={stream.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-1">{stream.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {stream.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Ready</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href={`/stream/${stream.id}`} className="flex-1">
                          <Button className="w-full">
                            <Play className="mr-2 h-4 w-4" />
                            Go Live
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastStreams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No past streams yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastStreams.map((stream) => (
                  <Card key={stream.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-32 h-20 bg-muted rounded-md overflow-hidden">
                            {stream.thumbnailUrl ? (
                              <img
                                src={stream.thumbnailUrl}
                                alt={stream.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="line-clamp-1">{stream.title}</CardTitle>
                            <CardDescription>
                              {formatDistanceToNow(new Date(stream.endedAt!), { addSuffix: true })}
                            </CardDescription>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{stream.viewerCount} views</span>
                              {stream.recordingUrl && (
                                <Badge variant="secondary">Recorded</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <DailyCheckInModal/>
    </div>
  );
}
