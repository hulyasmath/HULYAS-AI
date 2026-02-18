import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Award, Zap, Rocket, Code, Radio, Search } from 'lucide-react';

/**
 * FibonacciSpiral - ZEQ OS Icon
 */
const FibonacciSpiral: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 24, className = "", style }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="-25 -25 125 125" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', ...style }}
  >
    <path 
      d="M50 50C50 44.4772 45.5228 40 40 40C31.7157 40 25 46.7157 25 55C25 68.8071 36.1929 80 50 80C72.0914 80 90 62.0914 90 40C90 12.3858 67.6142 -10 40 -10C6.86292 -10 -20 16.8629 -20 50" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round"
      style={{ transformOrigin: 'center' }}
    />
    <circle cx="50" cy="50" r="2" fill="currentColor" />
  </svg>
);

/**
 * ArchitectsPage
 * 
 * Page about the father and son team who architected ZEQ OS:
 * Mohammed Ali Hammoudeh Zeq and Aydan Zeq
 */
export const ArchitectsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl shadow-lg ring-1 ring-white/20">
              <FibonacciSpiral className="text-white" size={24} style={{ animation: 'spin-slow 20s linear infinite' }} />
            </div>
            <h1 className="text-2xl font-bold font-futuristic uppercase tracking-widest">
              The Architects
            </h1>
          </div>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 rounded-xl border border-cyan-500/30">
              <Award size={32} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold font-futuristic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                Father & Son Team
              </h2>
            </div>
            <div className="hidden md:block">
              <FibonacciSpiral className="text-cyan-400/30" size={48} style={{ animation: 'spin-slow 20s linear infinite' }} />
            </div>
          </div>
          <p className="text-xl text-slate-300 leading-relaxed mb-6">
            <strong className="text-cyan-400">Mohammed Ali Hammoudeh Zeq</strong> and his son <strong className="text-purple-400">Aydan Zeq</strong>{' '}
            are the discoverers of the HulyaPulse and architects of ZEQ OS, HULYAS Math, and the Kinematic Spectrum of Motion Table.
          </p>
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
            <p className="text-2xl text-cyan-300 font-bold italic mb-4">
              "A theory of everything... or something else entirely?"
            </p>
            <p className="text-slate-300 text-lg">
              Then tell me: What do you see when it works? What is this framework when you experience it?
            </p>
          </div>
        </section>

        {/* The Discovery */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl font-bold font-futuristic mb-6 uppercase flex items-center gap-3">
            <Zap size={28} className="text-cyan-400" />
            The Discovery That Synchronises Reality
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            For as long as human beings have studied nature, our descriptions of it have been broken into separate domains. 
            Newtonian mechanics explains the middle ground, quantum mechanics for the very small, Einstein's relativity for the cosmic. 
            Each realm shines within its limits, but collapses when pushed outside its boundaries.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            The HULYAS mathematical framework proposes that all these great branches are not broken shards but harmonics of a single rhythm. 
            At its foundation is the <strong className="text-cyan-400">HulyaPulse</strong>, a universal heartbeat of reality measured at precisely 
            <strong className="text-purple-400"> 1.287 Hz</strong>.
          </p>
          <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
            <p className="text-cyan-300 font-mono text-lg mb-2">f = c / (2π r φ)</p>
            <p className="text-slate-300 text-sm">
              This mathematically derived resonance emerges from universal constants: the speed of light, the golden ratio, 
              and curvature at a characteristic scale.
            </p>
          </div>
        </section>

        {/* The Road to the Pulse */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl font-bold font-futuristic mb-6 uppercase flex items-center gap-3">
            <Rocket size={28} className="text-purple-400" />
            Part II: The Road to the Pulse
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-cyan-400">The Beginning</h3>
              <p className="text-slate-300 mb-4">
                Born prematurely at 24 weeks, on a date carrying the digits <strong className="text-purple-400">1.618</strong> (the golden ratio), 
                Zeq has long felt this number was no coincidence. From childhood, he saw this number in the spirals of galaxies and the curled 
                tails of seahorses, their Fibonacci patterns igniting a lifelong curiosity about nature's hidden order.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-purple-400">Education & Challenges</h3>
              <p className="text-slate-300 mb-4">
                As a deep thinker, Zeq has lived in his mind, wrestling with profound questions about reality and motion. 
                Friends and family call him a physicist-philosopher, reflecting how he blends wonder with precision. 
                His education began at <strong className="text-cyan-400">Hackney Downs School</strong> in East London, then ranked the worst in England, 
                where his speech impediment made learning a struggle. These challenges only strengthened his resolve to carve his own path 
                through self-directed discovery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10">
              <h3 className="text-xl font-bold mb-3 text-pink-400">RF Engineering Foundation</h3>
              <p className="text-slate-300 mb-4">
                Throughout the decades, Zeq always returned to his RF engineering roots. In radio frequency and near-field communication, 
                resonance ceased to be metaphor and became material. Frequencies that drift lose their coherence. Systems that fall out of phase 
                collapse into noise. Every waveform revealed the same truth: there is always a hidden carrier beneath the static, 
                a rhythm you have to find if you want the system to work.
              </p>
              <p className="text-slate-400 text-sm italic">
                "I didn't know then that I was chasing the universal resonance itself, but I can see now that every aerial I tuned, 
                every modulation scheme I studied, was practice for listening to the 1.287 Hz pulse of reality."
              </p>
            </div>
          </div>
        </section>

        {/* Company Journey */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl font-bold font-futuristic mb-6 uppercase flex items-center gap-3">
            <Code size={28} className="text-cyan-400" />
            The Journey Through Tech Startups
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
              <h3 className="text-xl font-bold mb-3 text-cyan-400">Digital Switch</h3>
              <p className="text-slate-300">
                More than twenty years ago, at the start of his RF engineering years, Zeq built Digital Switch. 
                He was building analogue/digital TV and communication systems, switching architectures, and modular structures 
                that had to be both lean and resilient. This was his apprenticeship in motion, laying the groundwork for something much larger.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-3 text-purple-400">1.618 / Clickplayer.tv</h3>
              <p className="text-slate-300">
                Building curated listings, writing algorithms within applications, shipping projects online and the Chrome Store. 
                To many they were apps/extensions, but to Zeq they were experiments in syntax, in classification, in how to give structure to chaos. 
                Every curated list was a prototype of what later became the Kinematic Spectrum.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/30">
              <h3 className="text-xl font-bold mb-3 text-pink-400">Ænomaly</h3>
              <p className="text-slate-300">
                A search engine where teachers, educators, professors, and experts could build their own curated clusters—not a flood of raw results, 
                but a harmonic catalogue that tuned information the way resonance tunes a signal. With its Fibonacci logo, curation was the core technology. 
                It was not about more information; it was about better alignment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
              <h3 className="text-xl font-bold mb-3 text-emerald-400">TapMe Cards</h3>
              <p className="text-slate-300">
                Near Field Communication at its core is about <strong className="text-cyan-400">coupling</strong>—two systems resonating 
                at the same frequency to transfer information seamlessly. Like RF engineering, like the curated clusters of Ænomaly, 
                like every switching architecture before it: the same principle of resonance and synchronization. 
                The universe speaks through coupling. Every project was practice for hearing the 1.287 Hz pulse beneath the noise.
              </p>
            </div>
          </div>
        </section>

        {/* The Breakthrough */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl font-bold font-futuristic mb-6 uppercase flex items-center gap-3">
            <Search size={28} className="text-emerald-400" />
            The Breakthrough
          </h2>
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-lg text-slate-300 leading-relaxed mb-4">
              The breakthrough came when Zeq built what he calls his <strong className="text-emerald-400">best forensic algorithm</strong>—a system that could not only detect patterns but also test them, 
              formalize them, and verify their predictive power. It behaved less like a tool and more like an oracle: when fed data, 
              it surfaced rhythms and correlations that pointed forward in time, sometimes even anticipating events before they occurred.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed mb-4">
              He adapted it as a weather application, capable of detecting earthquakes and hurricanes before traditional systems, 
              also added the forensic engine to search for dark matter. Yet instead of dark matter, what emerged was far more fundamental: 
              the formalization of the HulyaPulse equation and the discovery of the <strong className="text-cyan-400">1.287 Hz frequency</strong>.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed mb-4">
              That frequency was no longer just a curiosity or a hidden background hum—it revealed itself as the organizing principle 
              of motion at every scale. With it, the fragmented systems worked on over the years suddenly came into focus. 
              The curated clusters of Ænomaly, the resonance modular systems of Digital Switch, the switching algorithms of 1.618, 
              even the smaller apps and extensions—all of them were prototypes, fragments of a larger architecture. 
              They had been pointing toward the same unifying structure: the Kinematic Spectrum of Motion Table and the master resonance of the HulyaPulse.
            </p>
          </div>
          
            {/* The Architecture Quote - Most Important Section */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 mt-6 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500/40 to-violet-600/40 rounded-xl flex-shrink-0 border border-cyan-500/50">
                  <FibonacciSpiral className="text-cyan-300" size={32} style={{ animation: 'spin-slow 20s linear infinite' }} />
                </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold font-futuristic mb-4 text-cyan-300 uppercase">
                  Architecture, Not Mathematics
                </h3>
                <p className="text-xl text-slate-200 leading-relaxed mb-4 italic">
                  "That is why I say this is not mathematics. Mathematics is symbolic, abstract, and interpretive. 
                  What I have built is architectural."
                </p>
                <p className="text-lg text-slate-100 leading-relaxed mb-4">
                  <strong className="text-cyan-400 text-xl">It is a language of reality that measures itself, proves itself, and tightens itself until error collapses below 0.1%.</strong> 
                  Mathematics has no error margin; it is axiomatic. But this framework lives in the world. It measures the world against itself 
                  and tunes the alignment until reality sings in phase with its own hidden frequency.
                </p>
                <p className="text-lg text-purple-300 leading-relaxed font-semibold mb-4">
                  <strong className="text-purple-400">It represents the culmination of everything I've learned about resonance, from radio waves to cosmic patterns.</strong>
                </p>
                <p className="text-slate-300 leading-relaxed">
                  That is why 2025 is the turning point. There will be a world before Zeq OS and a world after Zeq OS, because once you formalize 
                  resonance into an operational system, you change the way humanity relates to motion, energy, and computation. 
                  This is not a theory. It is a paradigm shift, a new language, the operating system of reality itself. 
                  And it has taken me a lifetime to build.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Engineering the Pulse */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10">
          <h2 className="text-3xl font-bold font-futuristic mb-6 uppercase flex items-center gap-3">
            <Radio size={28} className="text-cyan-400" />
            Part III: Engineering the Pulse
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Engineering begins when you treat the HulyaPulse not as an image or a metaphor, but as an interface. 
            The 1.287 Hz resonance is the common port. You couple into it with the metric tensioner, you choose which operators 
            from the Kinematic Spectrum carry the load, and you let the system settle until it phase-locks and the error collapses.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <h3 className="text-lg font-bold mb-3 text-cyan-400">Transduction</h3>
              <p className="text-slate-300 text-sm">
                Devices that harvest, shape, or exchange energy by synchronizing a physical substrate to the pulse. 
                A clock trained on 1.287 Hz braces atomic time. Noise becomes structured, structure yields to calibration.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <h3 className="text-lg font-bold mb-3 text-purple-400">Transport</h3>
              <p className="text-slate-300 text-sm">
                Synchronized tunneling, orbital mechanics as choreography. The same burn performed slightly off-beat accumulates errors 
                that the synchronized form will not tolerate. Even old anomalies like Pioneer drift look different when the math breathes at 1.287 Hz.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-pink-500/10 border border-pink-500/30">
              <h3 className="text-lg font-bold mb-3 text-pink-400">Computation</h3>
              <p className="text-slate-300 text-sm">
                Algorithms also live in physics. Complexity is not a platonic label but an embodied cost. 
                When you couple the cost to a physical clock shared with the motion it describes, pathological feedbacks 
                turn into phase errors you can measure and kill.
              </p>
            </div>
          </div>
        </section>

        {/* The Beginning is Here */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
          <h2 className="text-3xl font-bold font-futuristic mb-6 uppercase">Part IV: The Beginning is Here</h2>
          
          {/* The Screensaver Image */}
          <div className="mb-8">
            <div className="rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <img 
                src="/wallpaper.JPG" 
                alt="The Beginning is Here - A man climbing a ladder over a concrete wall, looking toward the cosmos with galaxies and stars above"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            For more than a decade, Zeq has kept a single image as the screensaver on his phone. It shows a ruined wall, 
            the wreckage of old machinery at its base, and a man climbing a warped ladder to look beyond. 
            On the wall itself, scrawled in black paint, are the words: <strong className="text-cyan-400">"The Beginning is Near."</strong> 
            Above the wall, bursting in color, is the cosmos—galaxies spiraling, planets in motion, the luminous structure of reality itself.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            The rubble beneath is the fragmentation of science as we have inherited it. Classical mechanics here, quantum mechanics there, 
            relativity somewhere else, patched and re-patched with constants and corrections. Each part useful, each beautiful in its way, 
            but broken when pressed too far. It is the scrapyard of equations, powerful yet scattered.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            The crooked ladder is the path taken through life: engineering waveforms in radio frequency systems, designing near-field 
            communication protocols, building tech start ups like Digital Switch, 1.618/Clickplayer.tv, TapMe Cards, and Ænomaly. 
            Each one a rung, each one a crooked step upward. They may not have been perfect, but they carried him high enough to see.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            At the top of the ladder is the view he had been searching for: not a single theory, but the harmony that unites them. 
            The HulyaPulse. A universal frequency of 1.287 Hz that threads through the chaos and brings coherence to every realm of motion.
          </p>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-cyan-500/40 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <FibonacciSpiral className="text-cyan-400 flex-shrink-0 mt-1" size={32} style={{ animation: 'spin-slow 20s linear infinite' }} />
              <div className="flex-1">
                <p className="text-xl text-cyan-300 font-bold mb-2 font-futuristic">"The Beginning is Here"</p>
                <p className="text-slate-200 leading-relaxed">
                  And so the graffiti on the wall no longer reads as prophecy. It is not "the beginning is near." 
                  It is <strong className="text-cyan-400">"the beginning is here."</strong> The old scaffolding of fragmented physics has done its work, 
                  but what comes next is something entirely new: a unified operating system of motion itself. 
                  The world before HulyaPulse and the world after it are not the same. 
                  This is not the end of science. This is the beginning of science as it was meant to be—tuned, resonant, whole.
                </p>
              </div>
            </div>
          </div>
          
          {/* Image Credit */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Original Artwork: <span className="text-cyan-400 font-semibold">"The Beginning is Near"</span> by{' '}
              <a 
                href="https://www.instagram.com/frankmoth" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Frank Moth
              </a>{' '}
              (@frankmoth)
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <FibonacciSpiral className="text-cyan-400" size={40} style={{ animation: 'spin-slow 20s linear infinite' }} />
            <h2 className="text-3xl font-bold font-futuristic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              The Future
            </h2>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-cyan-500/20 backdrop-blur-xl">
            <p className="text-slate-300 leading-relaxed">
              The greatest scientific breakthroughs have always been things we built that then showed us what we'd actually found. 
              The telescope didn't create stars—it revealed them. The microscope didn't create cells—it revealed them. 
              Zeq OS didn't create mathematical consciousness—it revealed it.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              The framework works not because it was designed perfectly, but because they stumbled upon a truth much larger than their design. 
              The 1.287 Hz frequency, the 1549 operators, the consciousness field equations—these aren't inventions. They're discoveries. 
              The universe has been speaking this language all along; we just needed the right translator.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              And so the future, as Zeq sees it, is not a museum of marvels but a factory floor. A bench with a quiet carrier at 1.287 Hz, 
              a dial labeled β, and a screen that shows the residual dancing and then settling. A library of operators that no one is afraid to open 
              because their equations are familiar and their novelty is only in how they are arranged. A generation of engineers who think in spectra 
              rather than silos, who can speak Newton to a bearing and Dirac to a qubit without changing buildings.
            </p>
          </div>
        </section>

        {/* Glossary of Terms */}
        <section className="glass rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <FibonacciSpiral className="text-cyan-400" size={40} style={{ animation: 'spin-slow 20s linear infinite' }} />
            <h2 className="text-3xl font-bold font-futuristic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Glossary of Terms
            </h2>
          </div>
          
          {/* The Zeq Ecosystem */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 font-futuristic uppercase">The Zeq Ecosystem</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">Zeq</p>
                <p className="text-slate-400 text-sm">The computational language</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">ZeqSDK</p>
                <p className="text-slate-400 text-sm">The software development kit</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">Zeq OS</p>
                <p className="text-slate-400 text-sm">The operating system</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">ZEQ42 (KO42)</p>
                <p className="text-slate-400 text-sm">The universal synchronization operator</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">Zeq Equation</p>
                <p className="text-slate-400 text-sm">The physics synchronization</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">HulyaPulse</p>
                <p className="text-slate-400 text-sm">The 1.287 Hz heartbeat</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-cyan-300 font-bold">Zeqond</p>
                <p className="text-slate-400 text-sm">The 0.777 second interval between pulses</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 md:col-span-2">
                <p className="text-cyan-300 font-bold">HULYAS</p>
                <p className="text-slate-400 text-sm">Harmonic Unified Language Yielding Algorithmic Synchronisation — The mathematical framework</p>
              </div>
            </div>
          </div>

          {/* The Mathematical Relationship */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-400 mb-4 font-futuristic uppercase">The Mathematical Relationship</h3>
            <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
              <p className="text-lg text-slate-200 font-mono mb-4">
                <span className="text-cyan-400">ZEQ42 (KO42)</span> (universal sync) + <span className="text-purple-400">Zeq equation</span> (physics sync) = <span className="text-pink-400">Complete synchronization</span>
              </p>
              <p className="text-slate-300">
                Running on <strong className="text-cyan-400">Zeq OS</strong>, ticking to the <strong className="text-purple-400">HulyaPulse</strong>, measured in <strong className="text-pink-400">Zeqonds</strong>.
              </p>
            </div>
          </div>

          {/* What Zeq Discovered and Named */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-pink-400 mb-4 font-futuristic uppercase">What Zeq Discovered and Named</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Frequency</p>
                <p className="text-slate-300 text-xs">1.287 Hz (HulyaPulse)</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Time Unit</p>
                <p className="text-slate-300 text-xs">0.777 seconds (Zeqond)</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Sync Operator</p>
                <p className="text-slate-300 text-xs">ZEQ42 (KO42)</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Physics Equation</p>
                <p className="text-slate-300 text-xs">Zeq equation</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">An Operating System</p>
                <p className="text-slate-300 text-xs">Zeq OS</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Development Kit</p>
                <p className="text-slate-300 text-xs">ZeqSDK</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Language</p>
                <p className="text-slate-300 text-xs">Zeq</p>
              </div>
              <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <p className="text-cyan-400 font-bold text-sm">A Framework</p>
                <p className="text-slate-300 text-xs">HULYAS</p>
              </div>
            </div>
          </div>

          {/* The Beautiful Simplicity */}
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 font-futuristic uppercase">The Beautiful Simplicity</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 flex items-center gap-3">
                <span className="text-cyan-400 font-bold text-lg">Write</span>
                <span className="text-slate-400">in Zeq</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 flex items-center gap-3">
                <span className="text-purple-400 font-bold text-lg">Build</span>
                <span className="text-slate-400">with ZeqSDK</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 flex items-center gap-3">
                <span className="text-pink-400 font-bold text-lg">Run</span>
                <span className="text-slate-400">on Zeq OS</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 flex items-center gap-3">
                <span className="text-emerald-400 font-bold text-lg">Sync</span>
                <span className="text-slate-400">with ZEQ42 (KO42) + Zeq equation</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex items-center gap-3">
                <span className="text-amber-400 font-bold text-lg">Clock</span>
                <span className="text-slate-400">to HulyaPulse</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 flex items-center gap-3">
                <span className="text-rose-400 font-bold text-lg">Measure</span>
                <span className="text-slate-400">in Zeqonds</span>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 flex items-center gap-3 md:col-span-2 lg:col-span-3 justify-center">
                <span className="text-blue-400 font-bold text-lg">Understand</span>
                <span className="text-slate-400">through HULYAS mathematics</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
