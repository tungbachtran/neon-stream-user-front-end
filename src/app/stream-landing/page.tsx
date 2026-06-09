
'use client';

import { useRouter } from "next/navigation";



export default function NeonStreamLanding() {
  const router = useRouter();
    return (
      <div className="min-h-screen bg-[#0a0713] text-white">
        <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center overflow-hidden bg-[#090611]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.22),transparent_28%),radial-gradient(circle_at_68%_30%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_35%_70%,rgba(236,72,153,0.12),transparent_22%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
  
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8 md:px-10 lg:px-12">
            <div className="overflow-hidden rounded-[28px] border border-violet-400/70 bg-black/55 shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_40px_rgba(139,92,246,0.15)] backdrop-blur-sm">
              <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
                <div className="text-xl font-semibold italic tracking-tight text-violet-300">
                  NeonStream
                </div>
  
                <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
                  <a href="#" className="transition hover:text-white">Discover</a>
                  <a href="#" className="transition hover:text-white">Browse</a>
                  <a href="#" className="border-b border-violet-400 pb-1 text-violet-300">Creators</a>
                  <a href="#" className="transition hover:text-white">Pricing</a>
                </nav>
  
                <div className="hidden items-center gap-4 md:flex">
                  <button className="text-sm text-white/80 transition hover:text-white">Log In</button>
                  <button onClick={()=>router.push('/stream/stream-guide')} className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition hover:bg-violet-400">
                    Start Now
                  </button>
                </div>
              </header>
  
              <section className="relative min-h-[680px] overflow-hidden px-6 py-14 md:px-8 lg:px-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(236,72,153,0.18),transparent_24%),radial-gradient(circle_at_68%_40%,rgba(59,130,246,0.14),transparent_24%)]" />
                <div className="absolute bottom-0 right-0 h-[70%] w-[58%] rounded-tl-[120px] bg-[radial-gradient(circle_at_40%_40%,rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.16),transparent_30%)] blur-2xl" />
  
                <div className="relative z-10 grid min-h-[580px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="max-w-3xl">
                    <div className="mb-8 inline-flex items-center rounded-full border border-pink-400/30 bg-pink-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pink-300">
                      Now recruiting creators
                    </div>
  
                    <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-7xl lg:text-[7rem]">
                      Unleash your
                      <span className="mt-2 block bg-gradient-to-r from-violet-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                        Pulse
                      </span>
                    </h1>
  
                    <p className="mt-8 max-w-xl text-lg leading-8 text-white/75 md:text-[1.45rem]">
                      Step into the next evolution of streaming. High-fidelity broadcasting,
                      instant monetization, and a community built for the bold.
                    </p>
  
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                      <button className="rounded-2xl bg-gradient-to-r from-violet-400 to-purple-500 px-8 py-4 text-base font-bold uppercase tracking-wide text-black shadow-[0_14px_40px_rgba(139,92,246,0.45)] transition hover:scale-[1.02] hover:from-violet-300 hover:to-purple-400">
                        Start Streaming
                      </button>
                    </div>
                  </div>
  
                  <div className="relative hidden h-full min-h-[520px] lg:block">
                    <div className="absolute bottom-8 left-2 h-[280px] w-[320px] rounded-[26px] border border-violet-400/20 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-[0_0_50px_rgba(168,85,247,0.12)] backdrop-blur-sm" />
                    <div className="absolute bottom-24 left-16 h-[220px] w-[420px] rounded-[28px] border border-cyan-400/15 bg-[#07111d]/70 shadow-[0_0_60px_rgba(59,130,246,0.14)] backdrop-blur-md">
                      <div className="absolute left-6 top-6 h-3 w-24 rounded-full bg-white/10" />
                      <div className="absolute left-6 top-16 h-32 w-56 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(147,197,253,0.18),rgba(0,0,0,0.1))]" />
                      <div className="absolute right-6 top-10 h-16 w-16 rounded-full border border-cyan-300/20 bg-white/5" />
                      <div className="absolute bottom-6 left-6 h-3 w-36 rounded-full bg-white/10" />
                      <div className="absolute bottom-6 right-6 h-3 w-20 rounded-full bg-violet-400/20" />
                    </div>
                    <div className="absolute bottom-14 right-0 h-[360px] w-[230px] rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0d1424] to-[#090d16] shadow-[0_0_80px_rgba(59,130,246,0.14)]">
                      <div className="mx-auto mt-10 h-28 w-28 rounded-full border border-cyan-300/15 bg-black/30" />
                      <div className="mx-auto mt-8 h-40 w-40 rounded-[20px] border border-violet-300/10 bg-white/[0.02]" />
                      <div className="mx-auto mt-8 h-4 w-20 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
  