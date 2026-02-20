import { useMemo, useCallback, useState, useEffect } from 'react';
import { EModelEndpoint, Constants } from 'librechat-data-provider';
import { useChatContext, useAgentsMapContext, useAssistantsMapContext } from '~/Providers';
import { useGetAssistantDocsQuery, useGetEndpointsQuery } from '~/data-provider';
import { getIconEndpoint, getEntity } from '~/utils';
import { useSubmitMessage } from '~/hooks';

interface PatternStarter {
  icon: string;
  title: string;
  content: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10',
  operators: 'border-purple-500/40 text-purple-300 hover:bg-purple-500/10',
  equations: 'border-orange-500/40 text-orange-300 hover:bg-orange-500/10',
  forensic: 'border-red-500/40 text-red-300 hover:bg-red-500/10',
  time: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10',
  advanced: 'border-violet-500/40 text-violet-300 hover:bg-violet-500/10',
  quantum: 'border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10',
  relativity: 'border-blue-500/40 text-blue-300 hover:bg-blue-500/10',
  computation: 'border-teal-500/40 text-teal-300 hover:bg-teal-500/10',
  hulyas: 'border-pink-500/40 text-pink-300 hover:bg-pink-500/10',
  consciousness: 'border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500/10',
  applications: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10',
  default: 'border-slate-500/40 text-slate-300 hover:bg-slate-500/10',
};

// Fallback patterns when API is unreachable
const FALLBACK_PATTERNS: PatternStarter[] = [
  { icon: '⭐', title: '7-Step Wizard', content: 'Walk me through the full 7-Step HULYAS Protocol step by step. Show what happens at each stage when I ask "Calculate orbital velocity".', category: 'fundamentals' },
  { icon: '🧮', title: 'Physics Solver', content: 'Solve this physics problem using the Zeq OS framework: Calculate the orbital velocity of a satellite at 400km altitude. Show all operators used and the KO42 modulation.', category: 'equations' },
  { icon: '💻', title: 'Run Code', content: 'Write and run a Python script that demonstrates the HulyaPulse frequency at 1.287 Hz. Plot the waveform over 5 Zeqonds and show the phase calculation.', category: 'computation' },
  { icon: '🔍', title: 'Operator Lookup', content: 'List all 42+ kinematic operators organized by domain (QM, NM, GR, CS). Show the equation for each and explain when they activate.', category: 'operators' },
  { icon: '🎓', title: 'Explain Like a Tutor', content: 'Explain the Zeq Equation R(t) = S(t)·[1 + α·sin(2πft + φ₀)] as if teaching a curious university student. Use analogies and build intuition step by step.', category: 'fundamentals' },
  { icon: '💓', title: 'HulyaPulse Status', content: 'Show the current HulyaPulse status: phase value, Zeqond count since epoch, Master Sum, information integrity score, and which operators are active right now.', category: 'time' },
  { icon: '🟣', title: 'Three-Body Problem', content: 'Solve the three-body problem using the Zeq OS 7-Step Protocol. Show operator selection, KO42 tensioning, cross-domain harmony, and verify ≤0.1% precision.', category: 'applications' },
  { icon: '⚛️', title: 'Quantum Mechanics', content: 'Demonstrate quantum mechanics operators QM1-QM17. Calculate the tunneling probability for an electron through a 1nm potential barrier using QM8.', category: 'quantum' },
  { icon: '🌌', title: 'General Relativity', content: 'Show General Relativity operators GR31-GR41. Calculate gravitational time dilation for a GPS satellite at 20,200km altitude using GR35.', category: 'relativity' },
  { icon: '🧠', title: 'Consciousness Field', content: 'Explore the consciousness field operators: ON0, QL1, XI1, PSI96, CHI95. Show how they connect to the HULYAS Master Equation and what each measures.', category: 'consciousness' },
];

const ConversationStarters = () => {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const assistantMap = useAssistantsMapContext();
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const [patternStarters, setPatternStarters] = useState<PatternStarter[]>([]);

  const endpointType = useMemo(() => {
    let ep = conversation?.endpoint ?? '';
    if (
      [
        EModelEndpoint.chatGPTBrowser,
        EModelEndpoint.azureOpenAI,
        EModelEndpoint.gptPlugins,
      ].includes(ep as EModelEndpoint)
    ) {
      ep = EModelEndpoint.openAI;
    }
    return getIconEndpoint({
      endpointsConfig,
      iconURL: conversation?.iconURL,
      endpoint: ep,
    });
  }, [conversation?.endpoint, conversation?.iconURL, endpointsConfig]);

  const { data: documentsMap = new Map() } = useGetAssistantDocsQuery(endpointType, {
    select: (data) => new Map(data.map((dbA) => [dbA.assistant_id, dbA])),
  });

  const { entity, isAgent } = getEntity({
    endpoint: endpointType,
    agentsMap,
    assistantMap,
    agent_id: conversation?.agent_id,
    assistant_id: conversation?.assistant_id,
  });

  const conversation_starters = useMemo(() => {
    if (entity?.conversation_starters?.length) {
      return entity.conversation_starters;
    }

    if (isAgent) {
      return [];
    }

    return documentsMap.get(entity?.id ?? '')?.conversation_starters ?? [];
  }, [documentsMap, isAgent, entity]);

  // Fetch pattern starters from API (used when no agent-specific starters exist)
  useEffect(() => {
    fetch('/api/zeq-patterns/starters')
      .then((res) => {
        if (res.ok) return res.json();
        // Fall back to /today if /starters doesn't exist
        return fetch('/api/zeq-patterns/today').then((r) => {
          if (r.ok) return r.json();
          throw new Error('Failed to fetch patterns');
        });
      })
      .then((data: any) => {
        const patternsArr = Array.isArray(data) ? data : data?.patterns;
        if (patternsArr && patternsArr.length > 0) {
          const mapped: PatternStarter[] = patternsArr.map((p: any) => ({
            icon: p.icon || '📋',
            title: p.title || 'Pattern',
            content: p.promptText || p.content || '',
            category: typeof p.category === 'string' ? p.category : p.category?.name || 'default',
          }));
          setPatternStarters(mapped);
        } else {
          setPatternStarters(FALLBACK_PATTERNS);
        }
      })
      .catch(() => {
        setPatternStarters(FALLBACK_PATTERNS);
      });
  }, []);

  const { submitMessage } = useSubmitMessage();
  const sendConversationStarter = useCallback(
    (text: string) => submitMessage({ text }),
    [submitMessage],
  );

  // If agent has its own starters, show those (original behavior)
  if (conversation_starters.length > 0) {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
        {conversation_starters
          .slice(0, Constants.MAX_CONVO_STARTERS)
          .map((text: string, index: number) => (
            <button
              key={index}
              onClick={() => sendConversationStarter(text)}
              className="relative flex cursor-pointer items-center gap-1.5 rounded-full border border-border-medium px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm transition-all duration-200 hover:bg-surface-tertiary hover:text-text-primary hover:shadow-md"
            >
              <p className="line-clamp-1 break-all">
                {text}
              </p>
            </button>
          ))}
      </div>
    );
  }

  // Otherwise show pattern-based starters
  const starters = patternStarters.length > 0 ? patternStarters : FALLBACK_PATTERNS;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
      {starters.slice(0, 10).map((pattern, index) => {
        const catKey = CATEGORY_COLORS[pattern.category] ? pattern.category : 'default';
        return (
          <button
            key={index}
            onClick={() => sendConversationStarter(pattern.content)}
            className={`relative flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md ${CATEGORY_COLORS[catKey]}`}
          >
            <span className="text-sm">{pattern.icon}</span>
            <span className="line-clamp-1">{pattern.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationStarters;
