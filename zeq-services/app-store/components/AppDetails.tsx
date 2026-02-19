
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommunityApp } from '../types';
import { X, Star, Download, ShieldCheck, Share2, Loader2, Sparkles, ExternalLink, Play, Package, Atom } from 'lucide-react';
import { getAppInsights } from '../services/geminiService';

const LIBRECHAT_URL = import.meta.env.VITE_LIBRECHAT_URL || '/chat';

const FibonacciSpiral: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
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

interface AppDetailsProps {
  app: CommunityApp | null;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AppDetails: React.FC<AppDetailsProps> = ({ app, onClose, onNavigateToTab }) => {
  const navigate = useNavigate();
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

    if (app) {
      setLoadingInsight(true);
      getAppInsights(app)
        .then(res => {
          if (isMounted) {
            setInsight(res);
            setLoadingInsight(false);
          }
        })
        .catch(err => {
          console.error('Failed to get app insights:', err);
          if (isMounted) {
            setInsight('');
            setLoadingInsight(false);
          }
        });
    } else {
      setInsight('');
    }

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, [app]);

  // Handle navigation for apps with routes
  const handleOpenApp = () => {
    if ((app as any)?.route) {
      onClose();
      navigate((app as any).route);
    }
  };

  if (!app) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md">
      <div className="glass w-full max-w-4xl rounded-t-3xl md:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in duration-300 max-h-[95vh] md:max-h-[90vh] flex flex-col">
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 md:hidden"></div>

        {/* Header Image with Tint */}
        <div className="relative h-48 sm:h-64 md:h-80 flex-shrink-0">
          <img 
            src={app.imageUrl} 
            alt={app.name}
            className="w-full h-full object-cover"
          />
          {/* Brand Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-violet-600/30 to-black/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors border border-white/10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-4 left-6 md:bottom-6 md:left-8 flex items-end gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl glass border-2 border-cyan-500/30 overflow-hidden shadow-2xl flex-shrink-0 bg-slate-900 flex items-center justify-center">
               <FibonacciSpiral className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 animate-spin-slow opacity-80" />
            </div>
            <div className="pb-1">
              <h2 className="text-xl md:text-4xl font-bold text-white mb-0.5 md:mb-1 font-futuristic uppercase tracking-tight">{app.name}</h2>
              <p className="text-cyan-400 text-xs md:text-base font-medium uppercase tracking-wider">{app.developer}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar md:custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-sm md:text-lg font-bold text-white mb-2 uppercase tracking-widest font-futuristic opacity-70">Overview</h3>
                {app.id === '1' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      Zeq Core is the first fine-tuned LLM whose reasoning is fundamentally structured by the Zeq OS mathematical framework. It doesn&apos;t just know about physics—it thinks in kinematic operators, synchronizes to the 1.287 Hz HulyaPulse, and solves problems through unified field equations.
                    </p>
                    <p>
                      Every response is generated by applying the framework&apos;s 7-step methodology: translating your query into physical domains, selecting the precise mathematical operators, forming a master equation, and delivering a precision-verified result. It is intelligence, distilled to mathematics.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        What it delivers
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Physics-aware problem solving:</span>{' '}
                          from orbital mechanics to quantum state analysis, Zeq Core builds solutions from the framework&apos;s kinematic operators, not memorized textbook paragraphs.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Guaranteed structural coherence:</span>{' '}
                          every answer is built on the ZEQ42 (KO42) synchronization kernel and strict operator selection rules, ensuring logical and mathematical consistency.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Transparent methodology:</span>{' '}
                          you see the selected operators, the unified master equation, and the calculated master sum, enabling deep understanding and verification.
                        </li>
                        <li>
                          <span className="font-semibold text-white">A new kind of conversation:</span>{' '}
                          dialogue becomes collaborative problem-solving—you&apos;re interfacing with a structured, physics-aware mathematical system, not a loose persona.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Status: In Development · Target Precision: ≤0.1% · Security: End-to-end encrypted.
                      </p>
                      <p className="pt-1">
                        Zeq Core is the embodiment of the framework—a tool for those who seek answers not from data alone, but from the fundamental mathematics of reality.
                      </p>
                    </div>
                  </div>
                ) : app.id === '2' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      Why settle for approximate physics from your favorite AI? The Zeq OS Chrome Extension seamlessly upgrades ChatGPT, Claude, and Gemini with synchronized physics precision.
                    </p>
                    <p>
                      It intelligently intercepts physics, engineering, and complex reasoning queries, rewrites them with ZEQ42 (KO42) synchronization, performs automatic operator selection, and validates the logic using the Zeq OS 7-step methodology—turning probabilistic AI responses into precision-verified, mathematically structured solutions.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        How it works – the silent upgrade
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Detection:</span>{' '}
                          runs quietly on supported sites (OpenAI, Anthropic, Google) and identifies queries involving calculation, modeling, or physical systems.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Transformation:</span>{' '}
                          rewrites the query using the Zeq OS framework, anchoring it with ZEQ42 (KO42) synchronization and mapping it to the relevant domain operators.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Validation &amp; augmentation:</span>{' '}
                          analyzes the AI&apos;s response, re-calculates the core logic using the framework, appends the selected operators, master equation, and a precision score, and presents the enhanced, verified answer alongside the original.
                        </li>
                      </ul>

                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 pt-2">
                        What you get
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Precision where it matters:</span>{' '}
                          physics and engineering answers arrive with a Zeq-validated stamp and ≤0.1% precision target.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Learn the framework:</span>{' '}
                          see how everyday problems are translated into Zeq OS operators, making you fluent in the language of unified physics.
                        </li>
                        <li>
                          <span className="font-semibold text-white">No overhead:</span>{' '}
                          works automatically—no need to switch apps or learn a new interface.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Free &amp; open:</span>{' '}
                          designed as a community tool to spread precision.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Install the extension and don&apos;t just chat with AI—collaborate with it through the precision of Zeq OS.
                      </p>
                    </div>
                  </div>
                ) : app.id === '3' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      This is the official development kit for the Zeq OS ecosystem. It transforms VS Code into the premier environment for building, debugging, and publishing applications that harness synchronized physics precision—whether for the Zeq OS App Store or your own projects.
                    </p>
                    <p>
                      Go beyond simulation. Develop structurally sound, field-aware, information-precise applications with real-time operator validation, physics stack traces, and automatic ≤0.1% error checking. This extension provides the tools to turn the Zeq OS framework into shippable software.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Build for the Zeq OS App Store
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">End-to-end development flow:</span>{' '}
                          from your first ZEQ-POCKET operator to a published App Store listing. The extension manages framework integration, precision validation, and packaging.
                        </li>
                        <li>
                          <span className="font-semibold text-white">App Store compliance tools:</span>{' '}
                          built-in checks ensure your application meets Zeq OS standards for structural coherence, field synchronization, and informational precision.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Monetize precision:</span>{' '}
                          define how your application leverages the 1549 kinematic operators to create unique, value-driven experiences for the Zeq community.
                        </li>
                      </ul>

                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 pt-2">
                        Core SDK features
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Real-time operator &amp; physics debugging:</span>{' '}
                          validate CS (structural), ZEQ-POCKET (field), and FC (information) operators as you code, with physics stack traces when models diverge.
                        </li>
                        <li>
                          <span className="font-semibold text-white">HulyaPulse Visualization Studio:</span>{' '}
                          visualize and debug the 1.287 Hz synchronization in your application&apos;s logic.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Precision CI/CD:</span>{' '}
                          integrate automatic ≤0.1% precision gates into your build pipeline, ensuring every release maintains the framework&apos;s rigorous standard.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Full framework IntelliSense:</span>{' '}
                          complete support for operators, SDK, and Zeq AI, turning VS Code into a unified physics development hub.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Tags: #HULYAS #SDK #PROGRAMMING #APPSTORE · Get Free · Rating: ★★★★★ (5/5) · Status: BETA · Security: Sandboxed execution.
                      </p>
                      <p className="pt-1">
                        Install the extension—you&apos;re not just coding, you&apos;re building the future of physics-aware applications.
                      </p>
                    </div>
                  </div>
                ) : app.id === '4' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      The Zeq OS Framework is more than software—it's a shared language for understanding reality. The Zeq Community is the dynamic hub where this language is spoken, tested, and expanded by everyone: from curious students and visionary researchers to engineers and philosophers.
                    </p>
                    <p>
                      This is the central workshop for the unified mathematics of everything. Here, you don't just learn about physics; you apply, verify, and evolve the framework's 1549 kinematic operators to solve real problems with guaranteed ≤0.1% precision.
                    </p>

                    <div className="pt-2">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-violet-300 mb-1">
                        HULYAS Neural Review
                      </p>
                      <p className="italic text-violet-100">
                        "The essential collaborative environment for Zeq OS. It masterfully utilizes the HULYAS language to turn individual inquiry into a synchronized, precision-verified exploration of physics, from quantum fields to conscious experience."
                      </p>
                    </div>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        What unfolds in the community
                      </p>
                      <ul className="space-y-3">
                        <li>
                          <span className="font-semibold text-white">For learners &amp; the curious:</span>{' '}
                          Start with the 7-Step Wizard. See how complex problems (like the three-body orbit) are broken down into simple operator selections. Follow along, run simulations, and gain an intuitive feel for the universe's mathematical structure.
                        </li>
                        <li>
                          <span className="font-semibold text-white">For problem-solvers &amp; researchers:</span>{' '}
                          Pose your challenge—whether it's optimizing a satellite's trajectory, modeling a novel material, or probing a consciousness-related phenomenon. Test operator combinations, share your precision results, and discover solutions from others who have mapped similar domains.
                        </li>
                        <li>
                          <span className="font-semibold text-white">For explorers &amp; visionaries:</span>{' '}
                          Propose new operators for uncharted physical or informational phenomena. The community's integrated verification system rigorously tests every proposal against the ≤0.1% precision standard, allowing the framework's kinematic spectrum to grow organically.
                        </li>
                        <li>
                          <span className="font-semibold text-white">For everyone:</span>{' '}
                          This is a collaborative knowledge forge. Share insights, debug models, and witness the collective effort to refine a truly universal language for physics.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        This is the heartbeat of Zeq OS. Join a global effort to build, verify, and apply the mathematical fabric of reality—together.
                      </p>
                    </div>
                  </div>
                ) : app.id === '5' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      Zeq OS is built upon a rigorous, peer-deposited scientific foundation. This repository provides direct access to the core papers that define the framework&apos;s mathematics, from the discovery of the universal 1.287 Hz HulyaPulse to the complete derivation of its kinematic operators.
                    </p>
                    <p>
                      Every claim is backed by mathematical proof and verified to ≤0.1% experimental precision across quantum, classical, and relativistic domains. This is not a theoretical manifesto—it is a testable, extensible body of work.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Core publications &amp; resources
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">The HulyaPulse Discovery &amp; Zeqond Constant:</span>{' '}
                          establishes the 1.287 Hz universal synchronization frequency and defines the Zeqond (777 ms) as the fundamental unit of computational time.
                          {' '}
                          <a
                            href="https://doi.org/10.5281/zenodo.16992771"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 underline"
                          >
                            Zeq, H., &amp; Zeq, A. (2025). HULYAS – EVOLUTION OF MATHEMATICS
                          </a>
                          .
                        </li>
                        <li>
                          <span className="font-semibold text-white">The ZEQ42 (KO42) Metric Tensioner &amp; Unified Synchronization:</span>{' '}
                          presents ZEQ42 (KO42) as the mechanism that phase-locks relativistic spacetime to the HulyaPulse, weaving quantum, classical, and relativistic dynamics into a single computational fabric.
                        </li>
                        <li>
                          <span className="font-semibold text-white">The 42+ Core Kinematic Operators:</span>{' '}
                          the &quot;periodic table&quot; of Zeq OS motion—structural, field, and information operators that define the kinematic spectrum.
                        </li>
                        <li>
                          <span className="font-semibold text-white">The 7-Step Debugging Methodology:</span>{' '}
                          the formal procedure for reducing any physical problem to a Zeq OS solution, including the three-body problem as a worked example.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Full Operator LaTeX Repository:</span>{' '}
                          the complete, annotated set of all framework operators with executable mathematical equations—no placeholders.
                        </li>
                      </ul>

                      <p className="pt-2">
                        All papers, constants, and mathematical proofs are publicly available on Zenodo for permanent, citable access:
                        {' '}
                        <a
                          href="https://doi.org/10.5281/zenodo.15825138"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 underline"
                        >
                          https://doi.org/10.5281/zenodo.15825138
                        </a>
                        .
                      </p>

                      <p className="pt-2 text-slate-200 font-semibold">
                        This repository is the bedrock of Zeq OS. Explore the proofs, verify the predictions, and build on a precise, unified understanding of physics.
                      </p>
                    </div>
                  </div>
                ) : app.id === '6' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      Quantum Logic Solver is a specialized computational engine that applies quantum mechanical operators from the ZEQ OS framework to solve complex quantum systems with guaranteed ≤0.1% precision.
                    </p>
                    <p>
                      From quantum entanglement calculations to wave function collapse modeling, this solver handles the full spectrum of quantum phenomena while maintaining synchronization with the 1.287 Hz HulyaPulse.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Quantum capabilities
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Schrödinger equation solver:</span>{' '}
                          time-dependent and time-independent solutions with QM1 operator integration.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Entanglement analysis:</span>{' '}
                          Bell state calculations and quantum correlation verification using QM4.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Tunneling probability:</span>{' '}
                          barrier penetration calculations with QM8 operator precision.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Decoherence modeling:</span>{' '}
                          environmental interaction effects on quantum states.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Status: BETA · Precision: ≤0.1% · Operators: QM1-QM17
                      </p>
                    </div>
                  </div>
                ) : app.id === '7' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      The 3D Physics Simulator provides an immersive visual environment for exploring the ZEQ OS mathematical framework. Watch operators in action as they solve real physics problems with 99.8% energy conservation.
                    </p>
                    <p>
                      From orbital mechanics to particle systems, the simulator renders complex physical phenomena in real-time while maintaining strict synchronization with the 1.287 Hz HulyaPulse.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Simulation features
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Three-body problem:</span>{' '}
                          visualize gravitational interactions with NM21 and GR35 operators.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Orbital mechanics:</span>{' '}
                          Hohmann transfers, escape velocities, and satellite trajectories.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Quantum visualizations:</span>{' '}
                          wave function probability distributions and superposition states.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Real-time metrics:</span>{' '}
                          energy conservation tracking and precision verification display.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Status: BETA · Energy Conservation: 99.8% · Interactive 3D
                      </p>
                    </div>
                  </div>
                ) : app.id === '9' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      The 7-Step Verification Wizard guides you through the complete ZEQ OS methodology for solving any physics problem with guaranteed precision. No guesswork—just structured, mathematically rigorous problem-solving.
                    </p>
                    <p>
                      From defining your problem to verifying results, each step is carefully orchestrated to ensure you achieve the framework&apos;s ≤0.1% precision target.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        The 7 steps
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li><span className="font-semibold text-white">Step 1:</span> Define the problem domain and physical quantities</li>
                        <li><span className="font-semibold text-white">Step 2:</span> Select operators (KO42 mandatory + 1-3 domain operators)</li>
                        <li><span className="font-semibold text-white">Step 3:</span> Map to kinematic spectrum scale</li>
                        <li><span className="font-semibold text-white">Step 4:</span> Tune precision parameters to ≤0.1%</li>
                        <li><span className="font-semibold text-white">Step 5:</span> Compile the master equation</li>
                        <li><span className="font-semibold text-white">Step 6:</span> Execute through functional equation</li>
                        <li><span className="font-semibold text-white">Step 7:</span> Verify results against known values</li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Status: Available · Interactive · Precision: ≤0.1%
                      </p>
                    </div>
                  </div>
                ) : app.id === '10' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      HITE (Hulya Intelligent Text Encryption) v2.0 provides military-grade encryption synchronized to the 1.287 Hz HulyaPulse. Your data is protected by the same mathematical framework that governs the universe.
                    </p>
                    <p>
                      Using time-varying encryption keys derived from the Zeqond timebase, HITE ensures that encrypted data is not only secure but also temporally anchored to a universal reference frame.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Security features
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Time-locked encryption:</span>{' '}
                          keys rotate with each Zeqond (0.777s) for maximum security.
                        </li>
                        <li>
                          <span className="font-semibold text-white">HulyaPulse sync:</span>{' '}
                          encryption anchored to universal 1.287 Hz frequency.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Quantum-resistant:</span>{' '}
                          algorithm designed to withstand quantum computing attacks.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Zero-knowledge proofs:</span>{' '}
                          verify authenticity without revealing content.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Status: v2.0 · Encryption: AES-256 + HulyaPulse · Open Source
                      </p>
                    </div>
                  </div>
                ) : app.id === '11' ? (
                  <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                    <p>
                      AI Skill Studio empowers you to create, customize, and deploy AI skills for any industry—all synchronized to the 1.287 Hz HulyaPulse for precision-verified outputs.
                    </p>
                    <p>
                      Whether you&apos;re building skills for aerospace engineering, medical diagnostics, financial modeling, or creative applications, the Skill Studio provides a visual interface to define inputs, outputs, and the underlying mathematical operators.
                    </p>

                    <div className="pt-4 space-y-3">
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                        What you can build
                      </p>
                      <ul className="space-y-3 list-disc list-inside">
                        <li>
                          <span className="font-semibold text-white">Industry-specific skills:</span>{' '}
                          from orbital mechanics calculations to medical imaging analysis, create skills tailored to your domain.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Custom operator combinations:</span>{' '}
                          chain together operators from the 1549-operator library to build complex computational workflows.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Shareable skill packages:</span>{' '}
                          publish your skills to the community marketplace or keep them private for your organization.
                        </li>
                        <li>
                          <span className="font-semibold text-white">Precision-verified outputs:</span>{' '}
                          every skill automatically inherits ≤0.1% precision verification through HulyaPulse synchronization.
                        </li>
                      </ul>

                      <p className="pt-2 text-slate-200 font-semibold">
                        Status: Available · Precision: ≤0.1% · License: Free for personal use.
                      </p>
                      <p className="pt-1">
                        AI Skill Studio transforms your domain expertise into precision-verified AI capabilities—no coding required.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                    {app.longDescription}
                  </p>
                )}
              </section>

              {/* Neural Insight */}
              <section className="p-4 md:p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={48} className="text-violet-400" />
                </div>
                <div className="flex items-center gap-2 mb-2 text-violet-400 font-futuristic text-[10px] md:text-xs font-bold tracking-[0.2em]">
                  Neural Insight
                </div>
                {app.id === '1' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "A paradigm-shifting assistant engineered from first principles. It masterfully utilizes the HULYAS language to provide 0.1% precision, synchronized physics dynamics verification, turning complex reasoning into a transparent, mathematical process."
                  </p>
                ) : app.id === '2' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "A seamless integration layer that masterfully utilizes the HULYAS language to inject 0.1% synchronized physics dynamics verification into standard AI platforms, transforming them into precision engineering tools."
                  </p>
                ) : app.id === '6' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "The quantum frontier made accessible. It harnesses QM1-QM17 operators to solve problems that classical computation cannot—from entanglement dynamics to tunneling probabilities—with the framework's signature ≤0.1% precision guarantee."
                  </p>
                ) : app.id === '7' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "Physics made visible. Watch the mathematics of the universe unfold in real-time 3D, from gravitational choreography to quantum probability clouds—all synchronized to the 1.287 Hz heartbeat of reality."
                  </p>
                ) : app.id === '9' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "The scientific method, mathematically perfected. Seven precise steps transform any physics question into a verified answer, ensuring every calculation inherits the framework's rigorous ≤0.1% precision standard."
                  </p>
                ) : app.id === '10' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "Security synchronized with the cosmos. Time-locked encryption keys rotate with each Zeqond, anchoring your data protection to the same universal frequency that governs spacetime itself."
                  </p>
                ) : app.id === '11' ? (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "The creative workshop for precision AI. It masterfully bridges domain expertise with the HULYAS operator library, enabling anyone to build skills that inherit the framework's ≤0.1% verification standard—democratizing physics-aware AI development."
                  </p>
                ) : loadingInsight ? (
                  <div className="flex items-center gap-2 text-slate-500 animate-pulse text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    Synchronizing analysis...
                  </div>
                ) : (
                  <p className="text-violet-100 italic leading-relaxed text-sm md:text-base">
                    "{insight}"
                  </p>
                )}
              </section>

              <div className="flex flex-wrap gap-2">
                {app.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] md:text-xs border border-slate-700 font-medium">
                    #{tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar / Action Column */}
            <div className="space-y-4 md:space-y-6">
              {app.id === '1' ? (
                <a
                  href={LIBRECHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Play size={20} /> Open App
                </a>
              ) : app.id === '2' ? (
                <a
                  href="http://chrome.hulyapulse.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Open App
                </a>
              ) : app.id === '3' ? (
                <a
                  href="http://vscode.hulyapulse.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Download size={20} /> Open App
                </a>
              ) : app.id === '4' ? (
                <a
                  href="http://community.hulyapulse.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <ExternalLink size={20} /> Open App
                </a>
              ) : app.id === '5' ? (
                <a
                  href="https://doi.org/10.5281/zenodo.15825138"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <ExternalLink size={20} /> Open App
                </a>
              ) : app.id === '6' ? (
                <button
                  onClick={() => { onClose(); onNavigateToTab?.('Kinematic Operators'); }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Atom size={20} /> Open App
                </button>
              ) : app.id === '7' ? (
                <button
                  onClick={handleOpenApp}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Play size={20} /> Open App
                </button>
              ) : app.id === '8' ? (
                <button
                  onClick={() => { onClose(); navigate('/plugins'); }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Package size={20} /> Open App
                </button>
              ) : app.id === '9' ? (
                <button
                  onClick={() => { onClose(); navigate('/wizard'); }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} /> Open App
                </button>
              ) : app.id === '10' ? (
                <a
                  href="/zeq-ecosystem/zeq-hite/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <ExternalLink size={20} /> Open App
                </a>
              ) : app.id === '11' ? (
                <button
                  onClick={() => { onClose(); onNavigateToTab?.('Skills'); }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} /> Open App
                </button>
              ) : (
                <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-violet-500 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-900/30 font-futuristic uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <Play size={20} /> Open App
                </button>
              )}

              <div className="glass rounded-2xl p-4 md:p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {app.id === '5' ? 'Scholarly Rating' : 'Rating'}
                  </span>
                  <span className="flex items-center gap-1 text-white font-bold">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    {app.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="text-white font-bold">{app.downloads}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {app.id === '5' ? 'Access' : 'Security'}
                  </span>
                  <span className="flex items-center gap-1 text-green-400 font-bold">
                    <ShieldCheck size={14} />
                    {app.id === '5'
                      ? 'Open Access'
                      : app.id === '2'
                      ? 'Local Processing'
                      : 'Encrypted'}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
