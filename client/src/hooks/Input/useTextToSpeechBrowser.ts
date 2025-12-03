import { useRecoilValue } from 'recoil';
import { useState, useEffect, useCallback } from 'react';
import type { VoiceOption } from '~/common';
import store from '~/store';

function useTextToSpeechBrowser({
  setIsSpeaking,
}: {
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const voiceName = useRecoilValue(store.voice);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const cloudBrowserVoices = useRecoilValue(store.cloudBrowserVoices);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(true);

  const updateVoices = useCallback(() => {
    const synth = window.speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) {
      setIsSpeechSynthesisSupported(false);
      return;
    }

    try {
      const availableVoices = synth.getVoices();
      if (!Array.isArray(availableVoices)) {
        console.error('getVoices() did not return an array');
        setIsSpeechSynthesisSupported(false);
        return;
      }

      // Prefer local voices when `cloudBrowserVoices` is false,
      // but gracefully fall back to any available voices so the
      // TTS button actually works instead of doing nothing.
      let filteredVoices = availableVoices;
      if (!cloudBrowserVoices) {
        const localVoices = availableVoices.filter((v) => v.localService === true);
        if (localVoices.length > 0) {
          filteredVoices = localVoices;
        }
      }

      const voiceOptions: VoiceOption[] = filteredVoices.map((v) => ({
        value: v.name,
        label: v.name,
      }));

      setVoices(voiceOptions);
      setIsSpeechSynthesisSupported(voiceOptions.length > 0);
    } catch (error) {
      console.error('Error updating voices:', error);
      setIsSpeechSynthesisSupported(false);
    }
  }, [cloudBrowserVoices]);

  useEffect(() => {
    const synth = window.speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) {
      setIsSpeechSynthesisSupported(false);
      return;
    }

    try {
      if (synth.getVoices().length) {
        updateVoices();
      } else {
        synth.onvoiceschanged = updateVoices;
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setIsSpeechSynthesisSupported(false);
    }

    return () => {
      if (synth.onvoiceschanged) {
        synth.onvoiceschanged = null;
      }
    };
  }, [updateVoices]);

  const generateSpeechLocal = (text: string) => {
    if (!isSpeechSynthesisSupported) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }

    const synth = window.speechSynthesis;

    if (!voices.length) {
      console.warn('No speech synthesis voices available');
      return;
    }

    // Try to use the selected voice, otherwise fall back to the first available voice
    const selectedVoice = voices.find((v) => v.value === voiceName) ?? voices[0];

    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const matchingVoice = synth.getVoices().find((v) => v.name === selectedVoice.value) || null;
      utterance.voice = matchingVoice;
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      setIsSpeaking(true);
      synth.speak(utterance);
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  const cancelSpeechLocal = () => {
    if (!isSpeechSynthesisSupported) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('Error cancelling speech:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return { generateSpeechLocal, cancelSpeechLocal, voices, isSpeechSynthesisSupported };
}

export default useTextToSpeechBrowser;
